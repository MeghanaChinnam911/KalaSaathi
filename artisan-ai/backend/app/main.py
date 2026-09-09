from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.image_routes import router as image_router

app = FastAPI(
    title="Artisan AI",
    description="AI backend for marginalized artisans",
    version="1.0.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Routers
app.include_router(image_router, prefix="/api/v1/image")


@app.get("/artisan")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "artisan-ai"
    }