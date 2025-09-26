"""
Test script to verify PostgreSQL connection
Run this before starting your application
"""
from app.core.config import settings
from app.db.connection import engine, init_db
from sqlalchemy import text

def test_connection():
    try:
        # Test basic connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            row = result.fetchone()
            if row:
                version = row[0]
                print(f"✅ Successfully connected to PostgreSQL!")
                print(f"Database version: {version}")
            else:
                print("✅ Connected but no version info retrieved")
            
        # Test table creation
        print("\n🔧 Creating database tables...")
        init_db()
        print("✅ Database tables created successfully!")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Supabase PostgreSQL connection...")
    print(f"Database URL: {settings.database_url}")
    test_connection()