#![allow(missing_docs)]

use biscuit::{
    jwa::SignatureAlgorithm,
    jwk::{AlgorithmParameters, JWKSet, JWK},
    jws::{Header, Secret},
    ClaimsSet, Empty, JWT,
};
use derive_new::new;
use napi::Status;

use super::{outputs::RegisteredClaims, Error};

const BEARER: &str = "Bearer ";

/// Authorizer
#[derive(new)]
#[napi(js_name = "Authorizer")]
pub struct Authorizer {
    /// The token audience
    pub audience: String,

    /// The authorization URL to use
    pub auth_url: String,

    /// The JSON Web Key Set
    jwks: JWKSet<Empty>,
}

#[napi]
impl Authorizer {
    /// Initialize the authorizer
    #[napi(factory)]
    pub async fn init(audience: String, auth_url: String) -> napi::Result<Self> {
        let response = reqwest::get(format!("{}/.well-known/jwks.json", auth_url))
            .await
            .map_err(|e| napi::Error::new(Status::InvalidArg, e.to_string()))?;

        let jwks = response
            .json::<JWKSet<Empty>>()
            .await
            .map_err(|e| napi::Error::new(Status::InvalidArg, e.to_string()))?;

        println!("JWK set with {} keys retrieved\n", jwks.keys.len());

        Ok(Authorizer::new(audience, auth_url, jwks))
    }

    /// Authorize the request
    #[napi]
    pub fn authorize(&self, auth_header: String) -> napi::Result<RegisteredClaims> {
        let jwt = jwt_from_header(auth_header)
            .map_err(|err| napi::Error::new(Status::Unknown, err.to_string()))?
            .ok_or(napi::Error::new(
                Status::Unknown,
                "No JWT found".to_string(),
            ))?;

        let claims = self
            .get_payload(&jwt)
            .map_err(|e| napi::Error::new(Status::Unknown, e.to_string()))?;

        Ok(claims.registered.into())
    }

    /// Get a validated payload from a JWT string
    pub fn get_payload(&self, jwt: &str) -> Result<ClaimsSet<Empty>, Error> {
        // First extract without verifying the header to locate the key-id (kid)
        let token = JWT::<Empty, Empty>::new_encoded(jwt);

        let header: Header<Empty> = token.unverified_header().map_err(Error::JWTToken)?;

        let key_id = header.registered.key_id.ok_or(Error::JWKSVerification)?;

        debug!("Fetching signing key for '{:?}'", key_id);

        // Now that we have the key, construct our RSA public key secret
        let secret =
            get_secret_from_key_set(&self.jwks, &key_id).map_err(|_err| Error::JWKSVerification)?;

        // Now fully verify and extract the token
        let token = token
            .into_decoded(&secret, SignatureAlgorithm::RS256)
            .map_err(Error::JWTToken)?;

        let payload = token.payload().map_err(Error::JWTToken)?;

        debug!(
            "Successfully verified token with subject: {:?}",
            payload.registered.subject
        );

        Ok(payload.clone())
    }
}

/// If an authorization header is provided, make sure it's in the expected format, and
/// return it as a String.
fn jwt_from_header(header: String) -> Result<Option<String>, Error> {
    let auth_header = if let Ok(value) = std::str::from_utf8(header.as_bytes()) {
        value
    } else {
        // Authorization header couldn't be decoded, so return early with None
        return Ok(None);
    };

    if !auth_header.starts_with(BEARER) {
        // Authorization header doesn't start with "Bearer ", so return early with an Error
        return Err(Error::InvalidAuthHeader);
    }

    Ok(Some(auth_header.trim_start_matches(BEARER).to_string()))
}

pub fn get_secret_from_key_set(jwks: &JWKSet<Empty>, key_id: &str) -> Result<Secret, Error> {
    let jwk = get_key(jwks, key_id)?;
    let secret = get_secret(jwk)?;

    Ok(secret)
}

/// Get a particular key from a key set by id
pub fn get_key<T: Clone>(jwks: &JWKSet<T>, key_id: &str) -> Result<JWK<T>, Error> {
    let key = jwks.find(key_id).ok_or(Error::MissingKeyId)?.clone();

    Ok(key)
}

/// Convert a JWK into a Secret
pub fn get_secret(jwk: JWK<Empty>) -> Result<Secret, Error> {
    let secret = match jwk.algorithm {
        AlgorithmParameters::RSA(rsa_key) => rsa_key.jws_public_key_secret(),
        _ => return Err(Error::SecretKeyError),
    };

    Ok(secret)
}
