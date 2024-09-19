#![allow(missing_docs)]

use std::sync::Arc;

use bert_burn::data::BertInferenceBatch;
use burn::{
    backend::{libtorch::LibTorchDevice, Autodiff, LibTorch},
    config::Config as _,
    data::dataloader::batcher::Batcher as _,
    module::Module,
    record::{CompactRecorder, Recorder},
};
use burn_transformers::{
    models::bert::text_classification::{Config, Model},
    pipelines::sequence_classification::{
        self,
        text_classification::{Batcher, ModelConfig},
    },
};
use derive_new::new;
use tokenizers::Tokenizer;

/// Inference class for text classification
#[napi]
#[derive(Clone, new)]
pub struct Inference {
    config: sequence_classification::Config,
    device: LibTorchDevice,
    tokenizer: Tokenizer,
    model: Model<Autodiff<LibTorch>>,
}

#[napi]
impl Inference {
    /// Create a new instance of Inference
    #[napi(factory)]
    pub fn from_data_dir(data_dir: String) -> napi::Result<Self> {
        let model_dir = format!("{}/snips-bert", data_dir);

        let config = Config::load(format!("{model_dir}/config.json").as_str())
            .map_err(|e| napi::Error::from_reason(e.to_string()))?;

        let tokenizer = Tokenizer::from_pretrained("{model_dir}/tokenizer.json", None)
            .map_err(|e| napi::Error::from_reason(e.to_string()))?;

        let device = LibTorchDevice::Cuda(0);

        let record = CompactRecorder::new()
            .load(format!("{model_dir}/model").into(), &device)
            .map_err(|e| {
                napi::Error::from_reason(format!("Unable to load trained model weights: {}", e))
            })?;

        let model = config
            .init::<Autodiff<LibTorch>>(&device)
            .load_record(record);

        Ok(Self {
            config: config.get_config(),
            device,
            tokenizer,
            model,
        })
    }

    /// Infer the class of the input text
    #[napi]
    pub fn infer(&self, input: String) -> napi::Result<String> {
        let input: Vec<String> = vec![input];

        let batcher = Arc::new(Batcher::<Autodiff<LibTorch>>::new(
            self.tokenizer.clone(),
            self.config.clone(),
            self.device.clone(),
        ));

        let item = batcher.batch(input);

        let predictions = self.model.infer(BertInferenceBatch {
            tokens: item.tokens,
            mask_pad: item.mask_pad,
        });
        let prediction = predictions.slice([0..1]);

        let class_indexes = prediction.argmax(1).into_data().convert::<i64>().value;

        let classes = class_indexes
            .into_iter()
            .map(|index| &self.config.id2label[&(index as usize)])
            .collect::<Vec<_>>();

        Ok((*classes.first().unwrap()).to_string())
    }
}
