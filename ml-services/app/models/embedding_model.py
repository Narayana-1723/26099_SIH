import logging
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from app.config.settings import settings

logger = logging.getLogger(__name__)


class BaseEmbeddingModel:
    """Base interface for embedding models."""
    def encode(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError

    @property
    def model_version(self) -> str:
        raise NotImplementedError

    @property
    def dimension(self) -> int:
        raise NotImplementedError

    @property
    def is_loaded(self) -> bool:
        raise NotImplementedError


class SentenceTransformerEmbeddingModel(BaseEmbeddingModel):
    """Deep learning sentence transformer embedding model."""
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", device: str = "cpu"):
        self.model_name = model_name
        self.device = device
        self._model = None
        self._dimension = 384
        self._is_loaded = False

    def load(self) -> bool:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer: {self.model_name} on device: {self.device}")
            self._model = SentenceTransformer(self.model_name, device=self.device)
            # Determine dimensionality
            sample = self._model.encode(["test"])
            self._dimension = sample.shape[1]
            self._is_loaded = True
            logger.info(f"SentenceTransformer loaded successfully (dim={self._dimension})")
            return True
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to baseline.")
            self._model = None
            self._is_loaded = False
            return False

    def encode(self, texts: List[str]) -> List[List[float]]:
        if not self._is_loaded or self._model is None:
            raise RuntimeError("SentenceTransformer model is not loaded")
        embeddings = self._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.tolist()

    @property
    def model_version(self) -> str:
        return f"{self.model_name}-dl"

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded


class TfidfEmbeddingModel(BaseEmbeddingModel):
    """
    Mathematical TF-IDF Character/Word N-Gram Baseline Embedding Model.
    Produces dense L2-normalized vectors for cosine similarity.
    Clearly marked as baseline model.
    """
    def __init__(self, dimension: int = 256):
        self._dimension = dimension
        self._vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=dimension,
            sublinear_tf=True
        )
        self._is_fitted = False
        self._is_loaded = False
        # Initialize with standard CPSE engineering vocabulary
        self._init_vocabulary()

    def _init_vocabulary(self):
        seed_corpus = [
            "m16 hex bolt stainless steel 316 50 mm",
            "m20 hexagonal bolt stainless steel 304 100 mm",
            "carbon steel pipe seamless schedule 40 2 inch dn50",
            "ball valve class 150 flanged rf stainless steel 316",
            "gate valve class 300 cast steel flanged 4 inch",
            "copper power cable 4 core 16 sq mm 1100 v",
            "high tension xlpe cable 3 core 11 kv 240 sq mm",
            "pressure gauge dial 100 mm range 0 10 bar bottom connection",
            "centrifugal pump water single stage 15 kw 415 v",
            "structural steel beam ismb 200 mild steel",
            "spiral wound gasket class 150 ss316 graphite filler",
            "flange weld neck class 150 rf carbon steel a105",
            "electric motor 3 phase induction 10 hp 415 v 1440 rpm",
            "temperature transmitter rtd pt100 4-20 ma flameproof"
        ]
        self._vectorizer.fit(seed_corpus)
        self._dimension = len(self._vectorizer.get_feature_names_out())
        self._is_fitted = True
        self._is_loaded = True

    def encode(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        # Compute sparse TF-IDF and convert to dense normalized array
        sparse_mat = self._vectorizer.transform(texts)
        dense_mat = sparse_mat.toarray()
        # L2 normalize
        norms = np.linalg.norm(dense_mat, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized = dense_mat / norms
        return normalized.tolist()

    @property
    def model_version(self) -> str:
        return "baseline-tfidf-v1"

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded


class EmbeddingModelManager:
    """Manages embedding model loading and fallback."""
    def __init__(self):
        self.active_model: Optional[BaseEmbeddingModel] = None
        self.model_status: str = "INITIALIZING"

    def initialize(self):
        # Attempt to load SentenceTransformer if enabled
        transformer = SentenceTransformerEmbeddingModel(
            model_name=settings.EMBEDDING_MODEL_NAME,
            device=settings.DEVICE
        )
        if transformer.load():
            self.active_model = transformer
            self.model_status = "LOADED"
            logger.info("Active embedding model: SentenceTransformer")
        else:
            logger.info("Initializing TF-IDF baseline embedding model...")
            self.active_model = TfidfEmbeddingModel()
            self.model_status = "LOADED_BASELINE"
            logger.info("Active embedding model: Baseline TF-IDF (clearly marked)")

    def encode(self, texts: List[str]) -> List[List[float]]:
        if not self.active_model:
            self.initialize()
        return self.active_model.encode(texts)

    @property
    def model_version(self) -> str:
        return self.active_model.model_version if self.active_model else "unknown"

    @property
    def dimension(self) -> int:
        return self.active_model.dimension if self.active_model else 0

    @property
    def is_loaded(self) -> bool:
        return self.active_model.is_loaded if self.active_model else False


# Singleton instance
embedding_manager = EmbeddingModelManager()
