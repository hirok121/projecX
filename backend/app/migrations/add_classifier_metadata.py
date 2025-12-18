"""
Migration: Add feature_metadata and model_config to classifiers table

Run this migration to add new fields for classifier metadata
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# Revision identifiers
revision = 'add_classifier_metadata'
down_revision = None  # Update this with your previous migration
branch_labels = None
depends_on = None


def upgrade():
    """Add feature_metadata and model_config columns"""
    
    # Add feature_metadata column (for tabular models)
    op.add_column(
        'classifiers',
        sa.Column('feature_metadata', JSON, nullable=True)
    )
    
    # Add classifier_config column (for image models - keeping it simple)
    op.add_column(
        'classifiers',
        sa.Column('classifier_config', JSON, nullable=True)
    )
    
    # Add additional metrics for image models
    op.add_column(
        'classifiers',
        sa.Column('auc_roc', sa.Float, nullable=True)
    )
    
    op.add_column(
        'classifiers',
        sa.Column('sensitivity', sa.Float, nullable=True)
    )
    
    op.add_column(
        'classifiers',
        sa.Column('specificity', sa.Float, nullable=True)
    )
    
    # Add training metadata
    op.add_column(
        'classifiers',
        sa.Column('training_date', sa.DateTime(timezone=True), nullable=True)
    )
    
    op.add_column(
        'classifiers',
        sa.Column('training_samples', sa.Integer, nullable=True)
    )


def downgrade():
    """Remove added columns"""
    
    op.drop_column('classifiers', 'feature_metadata')
    op.drop_column('classifiers', 'classifier_config')
    op.drop_column('classifiers', 'auc_roc')
    op.drop_column('classifiers', 'sensitivity')
    op.drop_column('classifiers', 'specificity')
    op.drop_column('classifiers', 'training_date')
    op.drop_column('classifiers', 'training_samples')
