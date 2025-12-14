/**
 * Disease and Classifier Constants
 * Shared constants for disease categories and imaging modalities
 */

// Imaging modalities available for diagnosis
export const MODALITY_OPTIONS = ["MRI", "CT", "X-Ray", "Tabular"];

// Disease categories for diagnosis platform (user-facing)
export const DIAGNOSIS_CATEGORIES = [
  "All",
  "Cardiovascular",
  "Hepatic",
  "Neurological",
  "Respiratory",
  "Oncology",
  "Metabolic",
];

// Disease categories for admin management (simplified)
export const ADMIN_CATEGORIES = [
  "Liver",
  "Heart",
  "Lung",
  "Brain",
  "Other",
];

// Legacy export for backward compatibility
export const CATEGORY_OPTIONS = ADMIN_CATEGORIES;
