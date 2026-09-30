# Model Training & Evaluation Pipeline

This directory contains standalone scripts and sample datasets for training, fine-tuning, and evaluating CPSE material harmonization models.

## Separation of Concerns
As specified in **Section 34**, training and inference are strictly separated. Training never runs during FastAPI HTTP request handling.

## Directory Structure
- `data/`: Sample and benchmark datasets in JSON format.
- `preprocessing/`: Preprocessing scripts to clean and tokenize raw material records.
- `train_ner.py`: Pipeline for fine-tuning spaCy/transformer entity recognition models.
- `train_classifier.py`: Pipeline to train hierarchical taxonomy classifiers on domain data.
- `train_similarity.py`: Siamese Sentence Transformers fine-tuning on material equivalence pairs.
- `evaluate.py`: Standardized benchmark evaluation calculating Accuracy, Precision, Recall, F1 Score, False Positive Rate (FPR), and False Negative Rate (FNR).

## Running Evaluation
```powershell
.venv\Scripts\python.exe training/evaluate.py
```
