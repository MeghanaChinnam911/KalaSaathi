import os
# Configure CPU thread limits to prevent 512MB RAM overflow on Render
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.image_routes import router as image_router
from app.api.catalog_routes import router as catalog_router
from app.api.pricing_routes import router as pricing_router

app = FastAPI(
    title="Artisan AI",
    description="AI backend for marginalized artisans",
    version="1.0.0"
)

# Enable CORS for React frontend & production deployment integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)



# Register API Routers
app.include_router(image_router, prefix="/api/v1/image")
app.include_router(catalog_router, prefix="/api/v1/catalog")
app.include_router(pricing_router, prefix="/api/v1/pricing")


@app.get("/artisan")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "artisan-ai"
    }