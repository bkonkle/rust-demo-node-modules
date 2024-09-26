#![allow(missing_docs)]

use std::{path::PathBuf, str::from_utf8};

use derive_new::new;
use napi::bindgen_prelude::Buffer;
use rust_bert::{
    pipelines::{
        common::{ModelResource, ModelType},
        sequence_classification::{SequenceClassificationConfig, SequenceClassificationModel},
    },
    resources::LocalResource,
};

/// Inference class for text classification
#[napi]
#[derive(new)]
pub struct Inference {
    model: SequenceClassificationModel,
}

#[napi]
impl Inference {
    /// Create a new instance of Inference
    #[napi(factory)]
    pub fn from_data_dir(data_dir: String) -> napi::Result<Self> {
        let model_dir = format!("{}/snips-bert", data_dir);

        let model = SequenceClassificationModel::new(SequenceClassificationConfig {
            model_type: ModelType::Bert,
            model_resource: ModelResource::Torch(Box::new(LocalResource::from(PathBuf::from(
                format!("{}/rust_model.ot", model_dir),
            )))),
            config_resource: Box::new(LocalResource::from(PathBuf::from(format!(
                "{}/config.json",
                model_dir
            )))),
            vocab_resource: Box::new(LocalResource::from(PathBuf::from(format!(
                "{}/vocab.txt",
                model_dir
            )))),
            ..Default::default()
        })
        .map_err(|e| napi::Error::from_reason(e.to_string()))?;

        Ok(Self { model })
    }

    /// Infer the class of the input text
    #[napi]
    pub fn infer(&self, input: Buffer) -> napi::Result<Buffer> {
        let input = from_utf8(&input).map_err(|e| napi::Error::from_reason(e.to_string()))?;

        let output = self
            .model
            .predict(vec![input])
            .pop()
            .ok_or_else(|| napi::Error::from_reason("No model output was received"))?;

        Ok(output.text.into())
    }
}
