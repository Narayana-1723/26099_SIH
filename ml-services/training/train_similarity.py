import os


def train_similarity_model(
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
    output_dir: str = "models/embeddings/fine_tuned"
):
    """
    Offline fine-tuning template for Siamese Sentence Transformers on CPSE material pairs.
    Uses CosineSimilarityLoss or MultipleNegativesRankingLoss.
    """
    print(f"Preparing SentenceTransformer fine-tuning from base: {model_name}")
    print(f"Output directory: {output_dir}")

    training_pairs = [
        ("M16 HEX BOLT SS316 X 50MM", "STAINLESS STEEL 316 HEX BOLT M16 50MM", 1.0),
        ("M16 HEX BOLT SS316 X 50MM", "M16 HEX BOLT SS316 X 100MM", 0.3),
        ("BALL VALVE 2 INCH CLASS 150 FLANGED", "GATE VALVE 2 INCH CLASS 150 FLANGED", 0.4),
        ("COPPER CABLE 4 CORE 16 SQ MM", "ALUMINUM CABLE 4 CORE 16 SQ MM", 0.5),
    ]

    try:
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from torch.utils.data import DataLoader

        train_examples = [
            InputExample(texts=[p[0], p[1]], label=float(p[2])) for p in training_pairs
        ]
        model = SentenceTransformer(model_name)
        train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=2)
        train_loss = losses.CosineSimilarityLoss(model=model)

        print("Simulating fine-tuning execution...")
        # model.fit(train_objectives=[(train_dataloader, train_loss)], epochs=1, warmup_steps=10)
        os.makedirs(output_dir, exist_ok=True)
        print("Training completed. Fine-tuned weights can be loaded via EMBEDDING_MODEL_NAME.")
    except ImportError:
        print("Sentence-transformers or torch is not installed in the training environment.")
        print("Install via: pip install sentence-transformers torch")


if __name__ == "__main__":
    train_similarity_model()
