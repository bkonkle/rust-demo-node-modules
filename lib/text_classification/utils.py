import os
import logging
from typing import Optional

import numpy
import random
import torch


def init_logger():
    logging.basicConfig(
        format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
        datefmt="%m/%d/%Y %H:%M:%S",
        level=logging.INFO,
    )


def set_seed(seed: Optional[int] = None):
    if seed is None:
        seed = random.randint(0, 2**32 - 1)

    random.seed(seed)
    numpy.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def get_labels(data_dir: str):
    return [
        label.strip()
        for label in open(
            os.path.join(data_dir, "labels.txt"),
            "r",
            encoding="utf-8",
        )
    ]
