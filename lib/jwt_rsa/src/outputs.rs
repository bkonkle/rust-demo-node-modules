#![allow(missing_docs)]

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Registered claims defined by [RFC7519#4.1](https://tools.ietf.org/html/rfc7519#section-4.1)
/// Converted to a wasm-bindgen-friendly format
#[wasm_bindgen]
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize, Default)]
pub struct RegisteredClaims {
    /// Token issuer. Serialized to `iss`.
    #[serde(rename = "iss", skip_serializing_if = "Option::is_none")]
    #[wasm_bindgen(getter_with_clone)]
    pub issuer: Option<String>,

    /// Subject where the JWT is referring to. Serialized to `sub`
    #[serde(rename = "sub", skip_serializing_if = "Option::is_none")]
    #[wasm_bindgen(getter_with_clone)]
    pub subject: Option<String>,

    /// Audience intended for the JWT. Serialized to `aud`
    #[serde(rename = "aud", skip_serializing_if = "Option::is_none")]
    #[wasm_bindgen(getter_with_clone)]
    pub audience: Option<Vec<String>>,

    /// Expiration time in seconds since Unix Epoch. Serialized to `exp`
    #[serde(rename = "exp", skip_serializing_if = "Option::is_none")]
    pub expiry: Option<i64>,

    /// Not before time in seconds since Unix Epoch. Serialized to `nbf`
    #[serde(rename = "nbf", skip_serializing_if = "Option::is_none")]
    pub not_before: Option<i64>,

    /// Issued at Time in seconds since Unix Epoch. Serialized to `iat`
    #[serde(rename = "iat", skip_serializing_if = "Option::is_none")]
    pub issued_at: Option<i64>,

    /// Application specific JWT ID. Serialized to `jti`
    #[serde(rename = "jti", skip_serializing_if = "Option::is_none")]
    #[wasm_bindgen(getter_with_clone)]
    pub id: Option<String>,
}

impl From<biscuit::RegisteredClaims> for RegisteredClaims {
    fn from(claims: biscuit::RegisteredClaims) -> Self {
        Self {
            issuer: claims.issuer,
            subject: claims.subject,
            audience: claims.audience.map(|a| a.iter().cloned().collect()),
            expiry: claims.expiry.map(|e| e.timestamp()),
            not_before: claims.not_before.map(|e| e.timestamp()),
            issued_at: claims.issued_at.map(|e| e.timestamp()),
            id: claims.id,
        }
    }
}
