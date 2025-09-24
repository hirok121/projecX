"""
Database initialization and utilities
"""
from app.db.connection import init_db, get_db, Base, engine, SessionLocal
from app.models.user import User

# Initialize the database when this module is imported
init_db()

__all__ = [
    "init_db",
    "get_db", 
    "Base",
    "engine",
    "SessionLocal",
    "User"
]