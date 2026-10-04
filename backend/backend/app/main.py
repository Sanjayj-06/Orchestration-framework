from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

try:
    from app.db.database import init_db
    from app.routes.analyze import router as analyze_router
    from app.routes.agents import router as agents_router
    from app.routes.chat import router as chat_router
    from app.routes.workflows import router as workflows_router
except ImportError:
    from backend.app.db.database import init_db
    from backend.app.routes.analyze import router as analyze_router
    from backend.app.routes.agents import router as agents_router
    from backend.app.routes.chat import router as chat_router
    from backend.app.routes.workflows import router as workflows_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on startup
    init_db()
    yield

app = FastAPI(
    title="No-Code AI Agent Builder API",
    description="Backend API empowering non-technical users to design, configure, test, and export AI Agents.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(analyze_router, prefix="/api")
app.include_router(agents_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "No-Code AI Agent Builder",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
