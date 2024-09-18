import argparse
from argparse import Namespace
from pathlib import Path
from typing import Optional

from text_classification.trainer import Trainer
from text_classification.utils import init_logger, set_seed
from datasets import load_dataset, DatasetDict
from huggingface_hub import hf_hub_download
from optimum.onnxruntime import ORTModelForSequenceClassification


def main(args: Namespace):
    init_logger()

    if not isinstance(args.data_dir, str):
        raise ValueError("data-dir must be a string")

    Path(args.data_dir).mkdir(parents=True, exist_ok=True)

    if isinstance(args.seed, Optional[int]):
        set_seed(args.seed)

    dataset = load_dataset("bkonkle/snips-joint-intent")
    if not isinstance(dataset, DatasetDict):
        raise ValueError("dataset must be a DatasetDict")

    labels_file = hf_hub_download(
        repo_id="bkonkle/snips-joint-intent",
        filename="intent_labels.txt",
        repo_type="dataset",
    )

    with open(labels_file, "r") as file:
        labels = list(filter(None, (line.strip() for line in file)))

    trainer = Trainer(dataset, labels, args.batch_size, args.num_epochs, args.data_dir)
    model_dir = trainer.train()

    # Convert to ONNX
    ort_model = ORTModelForSequenceClassification.from_pretrained(
        model_dir, export=True, local_files_only=True
    )
    ort_model.save_pretrained(model_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--data-dir",
        default="./data",
        type=str,
        help="The path to the top-level data directory (defaults to 'data')",
    )

    parser.add_argument(
        "--batch-size", default=32, type=int, help="Batch size for training."
    )

    parser.add_argument(
        "--num-epochs",
        default=10,
        type=int,
        help="Number of epochs to train for",
    )

    parser.add_argument(
        "--seed", default=None, type=int, help="Batch size for training."
    )

    args = parser.parse_args()

    main(args)
