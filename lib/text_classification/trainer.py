import logging
from typing import List

from datasets import Dataset, DatasetDict, IterableDataset, IterableDatasetDict

logger = logging.getLogger(__name__)


class Trainer(object):
    dataset: Dataset
    labels: List[str]

    def __init__(self, dataset: Dataset, labels: List):
        self.dataset = dataset
        self.labels = labels

    def train(self):
        pass
