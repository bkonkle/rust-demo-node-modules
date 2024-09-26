#![allow(missing_docs)]

use biscuit::{
    jwa::SignatureAlgorithm,
    jwk::{AlgorithmParameters, JWKSet, JWK},
    jws::Secret,
    ClaimPresenceOptions, ClaimsSet, Empty, ValidationOptions, JWT,
};
use derive_new::new;

use super::{outputs::RegisteredClaims, Error};

const BEARER: &str = "Bearer ";

/// Authorizer
#[derive(new)]
#[napi]
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
            .map_err(|e| napi::Error::from_reason(e.to_string()))?;

        let jwks = response
            .json::<JWKSet<Empty>>()
            .await
            .map_err(|e| napi::Error::from_reason(e.to_string()))?;

        println!("JWK set with {} keys retrieved\n", jwks.keys.len());

        Ok(Authorizer::new(audience, auth_url, jwks))
    }

    /// Authorize the request
    #[napi]
    pub fn authorize(&self, auth_header: String) -> napi::Result<RegisteredClaims> {
        let jwt = jwt_from_header(&auth_header)
            .map_err(|err| napi::Error::from_reason(err.to_string()))?
            .ok_or(napi::Error::from_reason("No JWT found".to_string()))?;

        let claims = self
            .get_payload(&jwt)
            .map_err(|err| napi::Error::from_reason(err.to_string()))?;

        Ok(claims.registered.into())
    }

    /// Get a validated payload from a JWT string
    pub fn get_payload(&self, jwt: &str) -> Result<ClaimsSet<Empty>, Error> {
        let token = JWT::<Empty, Empty>::new_encoded(jwt)
            .decode_with_jwks(&self.jwks, Some(SignatureAlgorithm::RS256))
            .map_err(|_err| Error::JWKSVerification)?;

        token
            .validate(ValidationOptions {
                claim_presence_options: ClaimPresenceOptions {
                    expiry: biscuit::Presence::Required,
                    subject: biscuit::Presence::Required,
                    ..Default::default()
                },
                ..Default::default()
            })
            .map_err(|_err| Error::JWKSValidation)?;

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
fn jwt_from_header(header: &str) -> Result<Option<String>, Error> {
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
