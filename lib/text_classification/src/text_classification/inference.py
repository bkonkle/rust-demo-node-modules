import json
from typing import Dict, Any

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    PreTrainedTokenizer,
    PreTrainedTokenizerFast,
)


class Inference(object):
    tokenizer: PreTrainedTokenizer | PreTrainedTokenizerFast
    device: torch.device
    model: Any
    model_dir: str

    def __init__(self, model_dir: str):
        with open("data/snips-bert/config.json") as file:
            config = json.load(file)

        id2label: Dict[str, str] = config["id2label"]
        if not isinstance(id2label, dict):
            raise ValueError("id2label must be a dictionary")

        label2id: Dict[str, str] = config["label2id"]
        if not isinstance(label2id, dict):
            raise ValueError("label2id must be a dictionary")

        num_labels = len(id2label)

        tokenizer = AutoTokenizer.from_pretrained(
            model_dir,
            clean_up_tokenization_spaces=False,
        )

        model = AutoModelForSequenceClassification.from_pretrained(
            model_dir,
            num_labels=num_labels,
            id2label=id2label,
            label2id=label2id,
        )

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)

        self.tokenizer = tokenizer
        self.device = device
        self.model_dir = model_dir
        self.model = model

    def infer(self, input: str) -> str:
        inputs = self.tokenizer(
            input, truncation=True, max_length=512, return_tensors="pt"
        )

        inputs = {key: value.to(self.device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits

        predictions = torch.argmax(logits, dim=-1).cpu().numpy()

        predicted_label = self.model.config.id2label[str(predictions[0])]
        if not isinstance(predicted_label, str):
            raise ValueError("predicted_label must be a string")

        return predicted_label
