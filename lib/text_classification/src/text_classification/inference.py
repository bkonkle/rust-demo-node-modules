import torch
from transformers import (
    pipeline,
    Pipeline,
)


class Inference(object):
    classifier: Pipeline

    def __init__(self, model_dir: str):
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.classifier = pipeline(
            "text-classification", model=model_dir, device=device
        )

    def infer(self, input: str) -> str:
        result = self.classifier(input)
        if result is None:
            raise ValueError("Model failed to return a result")

        if not isinstance(result, list):
            raise ValueError("Model returned an unexpected result")

        return result[0]["label"]
