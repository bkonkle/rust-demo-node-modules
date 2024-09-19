import argparse
import os
import json
from argparse import Namespace
from typing import Dict

import torch
from text_classification.utils import init_logger
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_ID = "bert-base-uncased"


def main(args: Namespace):
    init_logger()

    if not isinstance(args.data_dir, str):
        raise ValueError("data-dir must be a string")

    if not isinstance(args.input, list) or not all(
        isinstance(i, str) for i in args.input
    ):
        raise ValueError("input must be a list of strings")

    joined_input = " ".join(args.input)

    print("Input:", joined_input)

    model_dir = f"{args.data_dir}/snips-bert"

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

    inputs = tokenizer(
        joined_input, truncation=True, max_length=512, return_tensors="pt"
    )

    model = AutoModelForSequenceClassification.from_pretrained(
        model_dir,
        num_labels=num_labels,
        id2label=id2label,
        label2id=label2id,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits

    predictions = torch.argmax(logits, dim=-1).cpu().numpy()

    predicted_label = model.config.id2label[str(predictions[0])]

    print(f"Predicted label: {predicted_label}")


def get_args(pred_config):
    return torch.load(os.path.join(pred_config.model_dir, "training_args.bin"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--data-dir",
        default="./data",
        type=str,
        help="The path to the top-level data directory (defaults to 'data')",
    )

    parser.add_argument("input", nargs="+", help="The input to query the model with")

    args = parser.parse_args()

    main(args)
