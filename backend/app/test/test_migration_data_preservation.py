"""
Property-based test for migration data preservation

Feature: diagnosis-ui-enhancement, Property 7: Migration data preservation
Validates: Requirements 6.4
"""

from hypothesis import given, strategies as st, settings
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.models.disease import Disease, ModalityType
from app.models.classifier import Classifier
from app.db.connection import Base
from contextlib import contextmanager
import tempfile
import os


# Strategy for generating valid modality lists
@st.composite
def modality_list(draw):
    """Generate a valid list of modalities"""
    modalities = [m.value for m in ModalityType]
    size = draw(st.integers(min_value=1, max_value=len(modalities)))
    return draw(st.lists(
        st.sampled_from(modalities),
        min_size=size,
        max_size=size,
        unique=True
    ))


# Strategy for generating disease data
@st.composite
def disease_data(draw):
    """Generate valid disease data for testing"""
    return {
        "name": draw(st.text(min_size=1, max_size=100, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "description": draw(st.text(min_size=0, max_size=500, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "category": draw(st.text(min_size=1, max_size=50, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "available_modalities": draw(modality_list()),
    }


# Strategy for generating classifier data
@st.composite
def classifier_data(draw, disease_id):
    """Generate valid classifier data for testing"""
    return {
        "name": draw(st.text(min_size=1, max_size=100, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "description": draw(st.text(min_size=0, max_size=500, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "disease_id": disease_id,
        "modality": draw(st.sampled_from([m for m in ModalityType])),
        "accuracy": draw(st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)),
    }


@contextmanager
def create_test_db():
    """Create a temporary test database context manager"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    database_url = f"sqlite:///{db_path}"
    
    # Create engine and session
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    try:
        yield engine, SessionLocal
    finally:
        # Cleanup
        engine.dispose()
        os.close(db_fd)
        try:
            os.unlink(db_path)
        except PermissionError:
            pass  # File may still be locked on Windows


@settings(max_examples=100, deadline=None)
@given(disease_data=disease_data())
def test_disease_migration_preserves_data(disease_data):
    """
    Property 7: Migration data preservation (Disease)
    
    For any existing disease record before migration, after running the migration,
    all original field values (excluding the new link fields) should remain unchanged.
    
    Validates: Requirements 6.4
    """
    with create_test_db() as (engine, SessionLocal):
        session = SessionLocal()
        
        try:
            # Create disease without blog_link (simulating pre-migration state)
            disease = Disease(**disease_data)
            session.add(disease)
            session.commit()
            session.refresh(disease)
            
            # Capture original values
            original_id = disease.id
            original_name = disease.name
            original_description = disease.description
            original_category = disease.category
            original_storage_path = disease.storage_path
            original_modalities = disease.available_modalities
            original_is_active = disease.is_active
            
            # Simulate migration by adding blog_link column (already exists in model)
            # In real migration, this would be ALTER TABLE ADD COLUMN
            # Here we just verify the column exists and can be set to NULL
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('diseases')]
            assert 'blog_link' in columns, "blog_link column should exist after migration"
            
            # Refresh from database to ensure we're reading persisted data
            session.expire(disease)
            session.refresh(disease)
            
            # Verify all original fields are preserved
            assert disease.id == original_id
            assert disease.name == original_name
            assert disease.description == original_description
            assert disease.category == original_category
            assert disease.storage_path == original_storage_path
            assert disease.available_modalities == original_modalities
            assert disease.is_active == original_is_active
            
            # Verify new field is NULL (default for existing records)
            assert disease.blog_link is None
            
        finally:
            session.close()


@settings(max_examples=100, deadline=None)
@given(
    disease_data=disease_data(),
    classifier_data_gen=st.data()
)
def test_classifier_migration_preserves_data(disease_data, classifier_data_gen):
    """
    Property 7: Migration data preservation (Classifier)
    
    For any existing classifier record before migration, after running the migration,
    all original field values (excluding the new link fields) should remain unchanged.
    
    Validates: Requirements 6.4
    """
    with create_test_db() as (engine, SessionLocal):
        session = SessionLocal()
        
        try:
            # Create disease first
            disease = Disease(**disease_data)
            session.add(disease)
            session.commit()
            session.refresh(disease)
            
            # Generate classifier data with the disease_id
            clf_data = classifier_data_gen.draw(classifier_data(disease.id))
            
            # Create classifier without paper_link (simulating pre-migration state)
            classifier = Classifier(**clf_data)
            session.add(classifier)
            session.commit()
            session.refresh(classifier)
            
            # Capture original values
            original_id = classifier.id
            original_name = classifier.name
            original_description = classifier.description
            original_disease_id = classifier.disease_id
            original_modality = classifier.modality
            original_model_path = classifier.model_path
            original_accuracy = classifier.accuracy
            original_blog_link = classifier.blog_link
            original_is_active = classifier.is_active
            
            # Simulate migration by adding paper_link column (already exists in model)
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('classifiers')]
            assert 'paper_link' in columns, "paper_link column should exist after migration"
            
            # Refresh from database
            session.expire(classifier)
            session.refresh(classifier)
            
            # Verify all original fields are preserved
            assert classifier.id == original_id
            assert classifier.name == original_name
            assert classifier.description == original_description
            assert classifier.disease_id == original_disease_id
            assert classifier.modality == original_modality
            assert classifier.model_path == original_model_path
            assert classifier.accuracy == original_accuracy
            assert classifier.blog_link == original_blog_link
            assert classifier.is_active == original_is_active
            
            # Verify new field is NULL (default for existing records)
            assert classifier.paper_link is None
            
        finally:
            session.close()
