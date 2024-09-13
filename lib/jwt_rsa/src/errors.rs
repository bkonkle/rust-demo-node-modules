/// Possible errors during jwks retrieval
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// No key found with the given key_id
    #[error("No key found with the given key_id")]
    MissingKeyId,

    /// Unable to construct RSA public key secret
    #[error("Unable to construct RSA public key secret")]
    SecretKeyError,

    /// The Authorization header is not valid
    #[error("Invalid Authorization header")]
    InvalidAuthHeader,

    /// An error occurred while attempting to decode the token
    #[error("Invalid JWT")]
    JWTToken(biscuit::errors::Error),

    /// An error occured while attempting to verify with the given key id
    #[error("JWK verification failed")]
    JWKSVerification,

    /// An error occured while attempting to resolve the Validator dependency
    #[error("Missing Validator dependency")]
    MissingValidator,
}
