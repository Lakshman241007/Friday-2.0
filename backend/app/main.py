
from fastapi import FastAPI

from app.api.router import api_router
from app.core.database import Base, engine
from app.models import Role, User

# Temporary development table creation.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FRIDAY Backend API",
    version="2.0.0",
)

app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}