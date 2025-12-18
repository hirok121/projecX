"""
Simple migration script to add new columns to classifiers table
Run this with: python run_migration.py
"""

from sqlalchemy import create_engine, text
from app.core.config import settings

def run_migration():
    """Add new columns to classifiers table"""
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        try:
            # Add feature_metadata column
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS feature_metadata JSON
            """))
            print("✅ Added feature_metadata column")
            
            # Add classifier_config column
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS classifier_config JSON
            """))
            print("✅ Added classifier_config column")
            
            # Add additional metrics
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS auc_roc FLOAT
            """))
            print("✅ Added auc_roc column")
            
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS sensitivity FLOAT
            """))
            print("✅ Added sensitivity column")
            
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS specificity FLOAT
            """))
            print("✅ Added specificity column")
            
            # Add training metadata (if not exists)
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS training_date TIMESTAMP WITH TIME ZONE
            """))
            print("✅ Added training_date column")
            
            conn.execute(text("""
                ALTER TABLE classifiers 
                ADD COLUMN IF NOT EXISTS training_samples INTEGER
            """))
            print("✅ Added training_samples column")
            
            conn.commit()
            print("\n🎉 Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            conn.rollback()
            raise

if __name__ == "__main__":
    run_migration()
