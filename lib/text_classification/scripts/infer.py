import argparse
import os
from argparse import Namespace

import torch
from text_classification.utils import init_logger
from text_classification.inference import Inference


def main(args: Namespace):
    init_logger()

    if not isinstance(args.data_dir, str):
        raise ValueError("data-dir must be a string")

    if not isinstance(args.input, list) or not all(
        isinstance(i, str) for i in args.input
    ):
        raise ValueError("input must be a list of strings")

    model_dir = f"{args.data_dir}/snips-bert"

    inference = Inference(model_dir)
    prediction = inference.infer(" ".join(args.input))

    print(f"Classification: {prediction}")


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
