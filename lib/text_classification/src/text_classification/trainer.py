import logging
from typing import List, Dict

import numpy
import evaluate
import transformers
from datasets import DatasetDict, ClassLabel
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    DataCollatorWithPadding,
    PreTrainedTokenizer,
    PreTrainedTokenizerFast,
    TrainingArguments,
)
from transformers.trainer_callback import EarlyStoppingCallback

MODEL_ID = "bert-base-uncased"

logger = logging.getLogger(__name__)


class Trainer(object):
    dataset: DatasetDict
    labels: List[str]
    batch_size: int
    num_epochs: int
    data_dir: str

    num_labels: int
    label2id: Dict[str, int]
    id2label: Dict[str, str]
    tokenizer: PreTrainedTokenizer | PreTrainedTokenizerFast

    def __init__(
        self,
        dataset: DatasetDict,
        labels: List[str],
        batch_size: int,
        num_epochs: int,
        data_dir: str,
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID,
            clean_up_tokenization_spaces=False,
        )

        class_feature = ClassLabel(names=labels)

        dataset = dataset.cast_column("intent", class_feature)
        dataset = dataset.rename_column("intent", "labels")
        dataset = dataset.rename_column("input", "text")
        dataset = dataset.map(process_with(self.tokenizer), batched=True)

        dataset.remove_columns(["slots"])

        self.dataset = dataset

        self.num_labels = len(labels)

        self.label2id, self.id2label = dict(), dict()
        for i, label in enumerate(labels):
            self.label2id[label] = i
            self.id2label[str(i)] = label

        self.labels = labels
        self.batch_size = batch_size
        self.num_epochs = num_epochs
        self.data_dir = data_dir

    def train(self) -> str:
        tracing_steps = (
            len(self.dataset["train"]) // self.batch_size
        ) * self.num_epochs

        tracing = "steps"

        output_dir = f"{self.data_dir}/snips-bert"

        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=self.num_epochs,
            per_device_train_batch_size=self.batch_size,
            per_device_eval_batch_size=self.batch_size,
            warmup_steps=100,
            fp16=True,
            learning_rate=3e-5,
            seed=33,
            # logging & evaluation strategies
            logging_dir=f"{output_dir}/logs",
            logging_strategy=tracing,
            logging_steps=tracing_steps,
            eval_strategy=tracing,
            eval_steps=tracing_steps,
            save_strategy=tracing,
            save_steps=tracing_steps,
            save_total_limit=2,
            save_safetensors=False,
            load_best_model_at_end=True,
            metric_for_best_model="f1",
        )

        data_collator = DataCollatorWithPadding(tokenizer=self.tokenizer)

        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_ID,
            num_labels=self.num_labels,
            id2label=self.id2label,
            label2id=self.label2id,
        )

        callbacks = []
        callbacks.append(EarlyStoppingCallback(early_stopping_patience=3))

        trainer = transformers.Trainer(
            model,
            training_args,
            train_dataset=self.dataset["train"],
            eval_dataset=self.dataset["test"],
            data_collator=data_collator,
            tokenizer=self.tokenizer,
            callbacks=callbacks,
            compute_metrics=compute_metrics(),
        )

        trainer.train()

        trainer.save_model(output_dir)
        self.tokenizer.save_pretrained(output_dir)

        return output_dir


def process_with(tokenizer: PreTrainedTokenizer | PreTrainedTokenizerFast):
    def process(examples):
        tokenized_inputs = tokenizer(
            examples["text"],
            truncation=True,
            max_length=512,
        )

        return tokenized_inputs

    return process


def compute_metrics():
    f1_metric = evaluate.load("f1")
    accuracy_metric = evaluate.load("accuracy")

    def compute(eval_pred):
        predictions, labels = eval_pred

        predictions = numpy.argmax(predictions, axis=1)

        acc = accuracy_metric.compute(predictions=predictions, references=labels)
        if acc is None:
            acc = {"accuracy": 0.0}

        f1 = f1_metric.compute(
            predictions=predictions, references=labels, average="micro"
        )
        if f1 is None:
            f1 = {"f1": 0.0}

        return {
            "accuracy": acc["accuracy"],
            "f1": f1["f1"],
        }

    return compute
