"""
Property-based test for link field round-trip persistence

Feature: diagnosis-ui-enhancement, Property 1: Link field round-trip persistence
Validates: Requirements 1.1, 2.1
"""

from hypothesis import given, strategies as st, settings
from sqlalchemy import create_engine
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


# Strategy for generating optional URL strings
@st.composite
def optional_url(draw):
    """Generate an optional URL string"""
    # Generate either None or a valid-looking URL
    has_url = draw(st.booleans())
    if not has_url:
        return None
    
    # Generate a simple URL structure
    protocol = draw(st.sampled_from(['http', 'https']))
    domain = draw(st.text(min_size=3, max_size=20, alphabet=st.characters(min_codepoint=97, max_codepoint=122)))
    tld = draw(st.sampled_from(['com', 'org', 'net', 'edu']))
    path = draw(st.text(min_size=0, max_size=50, alphabet=st.characters(min_codepoint=97, max_codepoint=122)))
    
    url = f"{protocol}://{domain}.{tld}"
    if path:
        url += f"/{path}"
    
    # Ensure URL doesn't exceed 500 characters
    return url[:500]


# Strategy for generating disease data with blog_link
@st.composite
def disease_data_with_link(draw):
    """Generate valid disease data with optional blog_link for testing"""
    return {
        "name": draw(st.text(min_size=1, max_size=100, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "description": draw(st.text(min_size=0, max_size=500, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "category": draw(st.text(min_size=1, max_size=50, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "available_modalities": draw(modality_list()),
        "blog_link": draw(optional_url()),
    }


# Strategy for generating classifier data with links
@st.composite
def classifier_data_with_links(draw, disease_id):
    """Generate valid classifier data with optional blog_link and paper_link for testing"""
    return {
        "name": draw(st.text(min_size=1, max_size=100, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "description": draw(st.text(min_size=0, max_size=500, alphabet=st.characters(blacklist_categories=('Cs',), blacklist_characters=['\x00']))),
        "disease_id": disease_id,
        "modality": draw(st.sampled_from([m for m in ModalityType])),
        "accuracy": draw(st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False)),
        "blog_link": draw(optional_url()),
        "paper_link": draw(optional_url()),
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
@given(disease_data=disease_data_with_link())
def test_disease_blog_link_round_trip(disease_data):
    """
    Property 1: Link field round-trip persistence (Disease)
    
    For any disease with a blog_link value, creating the entity and then retrieving it
    should return the same link value.
    
    Validates: Requirements 1.1
    """
    with create_test_db() as (engine, SessionLocal):
        session = SessionLocal()
        
        try:
            # Create disease with blog_link
            disease = Disease(**disease_data)
            session.add(disease)
            session.commit()
            session.refresh(disease)
            
            # Capture the blog_link value
            original_blog_link = disease_data["blog_link"]
            disease_id = disease.id
            
            # Close session and create new one to ensure we're reading from database
            session.close()
            session = SessionLocal()
            
            # Retrieve the disease
            retrieved_disease = session.query(Disease).filter(Disease.id == disease_id).first()
            
            # Verify blog_link persisted correctly
            assert retrieved_disease is not None
            assert retrieved_disease.blog_link == original_blog_link
            
            # Verify to_dict() includes blog_link
            disease_dict = retrieved_disease.to_dict()
            assert "blog_link" in disease_dict
            assert disease_dict["blog_link"] == original_blog_link
            
        finally:
            session.close()


@settings(max_examples=100, deadline=None)
@given(
    disease_data=disease_data_with_link(),
    classifier_data_gen=st.data()
)
def test_classifier_links_round_trip(disease_data, classifier_data_gen):
    """
    Property 1: Link field round-trip persistence (Classifier)
    
    For any classifier with blog_link and/or paper_link values, creating the entity
    and then retrieving it should return the same link values.
    
    Validates: Requirements 2.1
    """
    with create_test_db() as (engine, SessionLocal):
        session = SessionLocal()
        
        try:
            # Create disease first (without blog_link to focus on classifier)
            disease_data_no_link = {k: v for k, v in disease_data.items() if k != 'blog_link'}
            disease = Disease(**disease_data_no_link)
            session.add(disease)
            session.commit()
            session.refresh(disease)
            
            # Generate classifier data with links
            clf_data = classifier_data_gen.draw(classifier_data_with_links(disease.id))
            
            # Create classifier with blog_link and paper_link
            classifier = Classifier(**clf_data)
            session.add(classifier)
            session.commit()
            session.refresh(classifier)
            
            # Capture the link values
            original_blog_link = clf_data["blog_link"]
            original_paper_link = clf_data["paper_link"]
            classifier_id = classifier.id
            
            # Close session and create new one to ensure we're reading from database
            session.close()
            session = SessionLocal()
            
            # Retrieve the classifier
            retrieved_classifier = session.query(Classifier).filter(Classifier.id == classifier_id).first()
            
            # Verify links persisted correctly
            assert retrieved_classifier is not None
            assert retrieved_classifier.blog_link == original_blog_link
            assert retrieved_classifier.paper_link == original_paper_link
            
            # Verify to_dict() includes both links
            classifier_dict = retrieved_classifier.to_dict()
            assert "blog_link" in classifier_dict
            assert "paper_link" in classifier_dict
            assert classifier_dict["blog_link"] == original_blog_link
            assert classifier_dict["paper_link"] == original_paper_link
            
        finally:
            session.close()
