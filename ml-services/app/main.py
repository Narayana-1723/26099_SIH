import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.models.embedding_model import embedding_manager
from app.models.ner_model import ner_model
from app.models.classifier_model import classifier_model

from app.api.routes.health import router as health_router
from app.api.routes.normalization import router as normalization_router
from app.api.routes.extraction import router as extraction_router
from app.api.routes.embeddings import router as embeddings_router
from app.api.routes.matching import router as matching_router
from app.api.routes.classification import router as classification_router
from app.api.routes.duplicates import router as duplicates_router

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("ml_service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for model warmup and resource initialization."""
    logger.info("Starting up SIH26099 ML Microservice...")
    logger.info(f"Target Device: {settings.DEVICE}")

    # Initialize model managers once at startup
    embedding_manager.initialize()
    logger.info(f"Embedding Model: {embedding_manager.model_version} (Status: {embedding_manager.model_status})")

    logger.info(f"NER Model loaded: {ner_model.is_loaded}")
    logger.info(f"Classifier Model loaded: {classifier_model.is_loaded}")
    logger.info("All ML models ready to serve inference requests.")

    yield

    logger.info("Shutting down SIH26099 ML Microservice...")


app = FastAPI(
    title="CPSE Material Harmonization ML Microservice",
    description="Dedicated AI/ML microservice for Standardization & Harmonization of Material Codes Across CPSEs.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def correlation_and_logging_middleware(request: Request, call_next):
    """Tracks correlation ID and logs execution latency for every request."""
    correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
    request.state.correlation_id = correlation_id

    start_time = time.perf_counter()
    try:
        response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000.0
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Process-Time-MS"] = f"{process_time_ms:.2f}"

        logger.info(
            f"req_id={correlation_id} method={request.method} path={request.url.path} "
            f"status={response.status_code} latency={process_time_ms:.2f}ms"
        )
        return response
    except Exception as exc:
        process_time_ms = (time.perf_counter() - start_time) * 1000.0
        logger.error(
            f"req_id={correlation_id} method={request.method} path={request.url.path} "
            f"latency={process_time_ms:.2f}ms error={str(exc)}"
        )
        raise exc


# Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, dict):
        content = exc.detail
    else:
        content = {
            "success": False,
            "errorCode": f"HTTP_{exc.status_code}",
            "message": exc.detail,
        }
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error for path {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "errorCode": "VALIDATION_ERROR",
            "message": "Invalid request payload format",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    logger.error(f"req_id={correlation_id} Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "errorCode": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred during ML inference processing",
            "correlationId": correlation_id,
        },
    )


# Include API Routers under /api
app.include_router(health_router, prefix="/api")
app.include_router(normalization_router, prefix="/api")
app.include_router(extraction_router, prefix="/api")
app.include_router(embeddings_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(classification_router, prefix="/api")
app.include_router(duplicates_router, prefix="/api")


#.venv312\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload