from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.database_url, pool_size=5, max_overflow=10, pool_pre_ping=True, echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Database dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    # Import all models here to ensure they are registered with SQLAlchemy
    from app.models import user  # noqa: F401
    from app.models import disease  # noqa: F401
    from app.models import classifier  # noqa: F401

    # Create all tables
    Base.metadata.create_all(bind=engine)
