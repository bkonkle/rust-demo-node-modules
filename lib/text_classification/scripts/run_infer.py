import argparse
import sys
import logging
from argparse import Namespace

from text_classification.inference import Inference
from text_classification.utils import init_logger

logger = logging.getLogger(__name__)


def main(args: Namespace):
    init_logger()

    if not isinstance(args.data_dir, str):
        raise ValueError("data-dir must be a string")

    model_dir = f"{args.data_dir}/snips-bert"

    inference = Inference(model_dir)

    while True:
        input_line = sys.stdin.readline().strip()
        if not input_line:
            break

        prediction = inference.infer(input_line)

        print(prediction, file=sys.stdout)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--data-dir",
        default="./data",
        type=str,
        help="The path to the top-level data directory (defaults to 'data')",
    )

    args = parser.parse_args()

    main(args)
