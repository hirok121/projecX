-- Add model_path column to classifiers table

-- Add the column (nullable first)
ALTER TABLE classifiers
ADD COLUMN IF NOT EXISTS model_path VARCHAR(500);

-- Update existing rows with UUID values
UPDATE classifiers 
SET model_path = gen_random_uuid()::text 
WHERE model_path IS NULL;

-- Make the column NOT NULL and UNIQUE
ALTER TABLE classifiers ALTER COLUMN model_path SET NOT NULL;

ALTER TABLE classifiers
ADD CONSTRAINT classifiers_model_path_key UNIQUE (model_path);

-- Create index
CREATE INDEX IF NOT EXISTS ix_classifiers_model_path ON classifiers (model_path);