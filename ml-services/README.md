# CPSE Material Harmonization ML Microservice (SIH26099)

AI-Driven Standardization & Harmonization of Material Codes Across Central Public Sector Enterprises (CPSEs).

This microservice is **dedicated strictly to AI/ML inference**. It does not handle user authentication, JWT, frontend communication, or database persistence. All input data is received via JSON over HTTP from the **Spring Boot backend**, which acts as the sole orchestrator.

---

## 1. System Architecture

```text
React Frontend
      │
      ▼
Spring Boot Backend ─────────► PostgreSQL
      │
      ▼ HTTP / JSON
Python FastAPI ML Service
      │
      ├── Text Normalization
      ├── NER / Attribute Extraction
      ├── Dense Embeddings
      ├── Semantic Similarity
      ├── Lexical Similarity
      ├── Unit-Aware Attribute Comparison
      ├── Domain Rule Engine
      ├── Match Classification
      ├── Duplicate Detection
      └── Explainable AI Output
```

---

## 2. Technology Stack

* **Language**: Python 3.11+
* **Framework**: FastAPI, Uvicorn, Pydantic v2, Pydantic Settings
* **Scientific Computing**: NumPy, Pandas, SciPy, scikit-learn
* **Deep Learning / NLP**: PyTorch & Sentence Transformers (`sentence-transformers/all-MiniLM-L6-v2`) with automatic fallback to high-speed scikit-learn TF-IDF baseline embedding model
* **Testing & HTTP**: Pytest, Pytest-Asyncio, HTTPX
* **Containerization**: Docker (multi-stage non-root build)

---

## 3. Project Directory Structure

```text
ml-services/
├── app/
│   ├── main.py                  # FastAPI app entry point & lifespan manager
│   ├── api/
│   │   ├── dependencies.py      # Dependency injection & internal auth
│   │   └── routes/
│   │       ├── health.py        # /api/health & /api/model-status
│   │       ├── normalization.py # /api/normalize & /api/normalize/batch
│   │       ├── extraction.py    # /api/extract-attributes
│   │       ├── embeddings.py    # /api/embeddings
│   │       ├── matching.py      # /api/match & /api/match/batch
│   │       ├── classification.py# /api/classify & /api/classify/batch
│   │       └── duplicates.py    # /api/duplicates
│   ├── schemas/                 # Strongly-typed Pydantic request/response schemas
│   ├── services/                # Core business & algorithm orchestration services
│   ├── models/                  # ML/DL model wrappers & loaders
│   ├── pipelines/               # Staged preprocessing & harmonization pipelines
│   ├── utils/                   # Unit parsers, text cleaners, similarity metrics
│   └── config/settings.py       # Pydantic Settings configuration
├── training/                    # Separate offline training & evaluation pipelines
├── tests/                       # Complete pytest unit & integration test suite
├── Dockerfile                   # Production Docker image
├── requirements.txt             # Python dependencies
├── .env.example                 # Configuration template
└── README.md
```

---

## 4. API Endpoints Reference

### 4.1 Health & Model Status
* `GET /api/health`: Returns overall service status.
* `GET /api/model-status`: Returns loading status for embedding, NER, and classification models.

### 4.2 Text Normalization
* `POST /api/normalize`
```json
{
  "materialCode": "BOLT001",
  "description": "SS316 M16 HEX BOLT 50MM"
}
```
**Response**:
```json
{
  "materialCode": "BOLT001",
  "originalDescription": "SS316 M16 HEX BOLT 50MM",
  "normalizedDescription": "stainless steel 316 M16 hexagonal bolt 50 mm",
  "tokens": ["stainless", "steel", "316", "M16", "hexagonal", "bolt", "50", "mm"]
}
```

### 4.3 Engineering Attribute Extraction
* `POST /api/extract-attributes`
```json
{
  "materialCode": "BOLT001",
  "description": "M16 HEX BOLT SS316 X 50MM"
}
```
**Response**:
```json
{
  "materialCode": "BOLT001",
  "normalizedDescription": "M16 hexagonal bolt stainless steel 316 50 mm",
  "attributes": {
    "itemType": "Hex Bolt",
    "material": "Stainless Steel",
    "grade": "316",
    "diameter": "M16",
    "length": "50 mm",
    "width": null,
    "voltage": null,
    "pressureClass": null
  }
}
```

### 4.4 Semantic Embeddings
* `POST /api/embeddings`
```json
{
  "texts": [
    "M16 hex bolt stainless steel 316 50 mm",
    "SS316 M16 hexagonal bolt length 50mm"
  ]
}
```
**Response**:
```json
{
  "embeddings": [[0.042, 0.081, ...], [0.039, 0.085, ...]],
  "dimension": 384,
  "modelVersion": "embedding-v1",
  "device": "cpu"
}
```

### 4.5 Hybrid Matching & Explainable AI
* `POST /api/match`
```json
{
  "sourceMaterial": {
    "materialCode": "BOLT001",
    "description": "M16 HEX BOLT SS316 X 50MM"
  },
  "candidateMaterials": [
    {
      "materialCode": "BOLT200",
      "description": "STAINLESS STEEL 316 HEX BOLT M16 50MM"
    },
    {
      "materialCode": "BOLT300",
      "description": "M16 HEX BOLT SS316 X 100MM"
    }
  ]
}
```
**Response**:
```json
{
  "sourceMaterialCode": "BOLT001",
  "matches": [
    {
      "materialCode": "BOLT200",
      "matchType": "EXACT",
      "semanticScore": 0.9412,
      "lexicalScore": 0.8845,
      "attributeScore": 1.0,
      "finalConfidence": 0.9521,
      "explanation": {
        "matchedAttributes": ["itemType", "material", "grade", "diameter", "length"],
        "differences": [],
        "positiveFactors": [
          "Same item type: Hex Bolt",
          "Same material: Stainless Steel",
          "Same grade: 316",
          "Identical thread: M16",
          "Identical: 50 mm"
        ],
        "negativeFactors": [],
        "criticalMismatches": []
      },
      "modelVersion": "baseline-tfidf-v1",
      "pipelineVersion": "harmonization-v1"
    },
    {
      "materialCode": "BOLT300",
      "matchType": "SIMILAR",
      "semanticScore": 0.9124,
      "lexicalScore": 0.8250,
      "attributeScore": 0.3529,
      "finalConfidence": 0.2864,
      "explanation": {
        "matchedAttributes": ["itemType", "material", "grade", "diameter"],
        "differences": ["Dimension differs: 50 mm vs 100 mm"],
        "positiveFactors": [
          "Same item type: Hex Bolt",
          "Same material: Stainless Steel",
          "Same grade: 316",
          "Identical thread: M16"
        ],
        "negativeFactors": ["Dimension differs: 50 mm vs 100 mm"],
        "criticalMismatches": ["length: 50 mm != 100 mm"]
      }
    }
  ]
}
```

### 4.6 Material Classification
* `POST /api/classify`
```json
{
  "description": "M16 HEX BOLT SS316 X 50MM"
}
```
**Response**:
```json
{
  "category": "Mechanical",
  "subcategory": "Fasteners",
  "class": "Bolts",
  "confidence": 0.9125,
  "modelVersion": "classifier-v1"
}
```

### 4.7 Duplicate Detection
* `POST /api/duplicates`
```json
{
  "materials": [
    { "materialCode": "A001", "description": "SS316 M16 HEX BOLT 50MM" },
    { "materialCode": "B002", "description": "M16 HEXAGONAL BOLT STAINLESS STEEL 316 50 MM" },
    { "materialCode": "C003", "description": "COPPER POWER CABLE 4 CORE 16 SQ MM 1100 V" }
  ]
}
```
**Response**:
```json
{
  "duplicateGroups": [
    {
      "groupId": "DUP-001",
      "materials": ["A001", "B002"],
      "confidence": 0.9415,
      "representativeDescription": "M16 HEXAGONAL BOLT STAINLESS STEEL 316 50 MM",
      "commonAttributes": {
        "itemType": "Hex Bolt",
        "material": "Stainless Steel",
        "grade": "316",
        "diameter": "M16",
        "length": "50 mm"
      }
    }
  ],
  "unmatchedMaterials": ["C003"],
  "totalGroups": 1,
  "totalDuplicates": 2
}
```

---

## 5. Local Setup & Execution

### Prerequisites
* Python 3.11 installed

### Installation
```powershell
# Create and activate virtual environment
py -3.11 -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Run Service
```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
* Swagger UI: `http://127.0.0.1:8000/docs`
* ReDoc: `http://127.0.0.1:8000/redoc`

---

## 6. Running Tests

Execute the comprehensive unit and integration test suite:
```powershell
.venv\Scripts\pytest.exe -v
```

---

## 7. Docker Deployment

Build and run the Docker container:
```bash
docker build -t cpse-ml-service .
docker run -p 8000:8000 --name cpse-ml cpse-ml-service
```
