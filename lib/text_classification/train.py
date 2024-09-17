import argparse
from argparse import Namespace
from pathlib import Path
from typing import Optional

from trainer import Trainer
from utils import init_logger, set_seed
from datasets import load_dataset, Dataset, DatasetDict

from transformers import AutoTokenizer, PreTrainedTokenizer, PreTrainedTokenizerFast


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

    train_dataset = dataset["train"]

    print("Train dataset", train_dataset)

    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    tokenized_dataset = train_dataset.map(process(tokenizer), batched=True)

    trainer = Trainer(tokenized_dataset, labels)
    trainer.train()


def process(tokenizer: PreTrainedTokenizer | PreTrainedTokenizerFast):
    def process_inner(examples):
        tokenized_inputs = tokenizer(examples["input"], truncation=True, max_length=512)

        return tokenized_inputs

    return process_inner


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
        type=float,
        help="Number of epochs to train for",
    )

    parser.add_argument(
        "--seed", default=None, type=int, help="Batch size for training."
    )

    args = parser.parse_args()

    main(args)
