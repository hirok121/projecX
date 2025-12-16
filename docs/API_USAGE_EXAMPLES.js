// Frontend API Usage Examples for Disease & Classifier Management
// IMPORTANT: Always import diseaseAPI and classifierAPI directly

import { diseaseAPI } from '../services/diseaseAPI';
import { classifierAPI } from '../services/classifierAPI';
import { diagnosisAPI } from '../services/diagnosisAPI'; // Only for diagnosis/prediction operations

// ============================================
// DISEASE MANAGEMENT
// ============================================

// 1. Get all active diseases
const diseases = await diseaseAPI.getDiseases({ is_active: true });

// 2. Get diseases with pagination and category filter
const filteredDiseases = await diseaseAPI.getDiseases({
  category: 'Infectious',
  is_active: true,
  skip: 0,
  limit: 20
});

// 3. Get specific disease
const disease = await diseaseAPI.getDisease(diseaseId);

// 4. Create new disease (admin)
const newDisease = await diseaseAPI.createDisease({
  name: 'Hepatitis C',
  description: 'Viral infection causing liver inflammation',
  category: 'Infectious',
  available_modalities: ['Tabular', 'Medical-Image']
});

// 5. Update disease (admin)
const updatedDisease = await diseaseAPI.updateDisease(diseaseId, {
  description: 'Updated description',
  is_active: true
});

// 6. Delete disease (admin) - WARNING: Also deletes all classifiers
await diseaseAPI.deleteDisease(diseaseId);

// ============================================
// CLASSIFIER MANAGEMENT
// ============================================

// 1. Get all classifiers for a disease
const classifiers = await classifierAPI.getClassifiersByDisease(diseaseId, true);

// 2. Get classifiers with filters
const tabularClassifiers = await classifierAPI.getClassifiers({
  disease_id: diseaseId,
  modality: 'Tabular',
  is_active: true
});

// 3. Get specific classifier
const classifier = await classifierAPI.getClassifier(classifierId);

// 4. Create new classifier (admin) - Step 1: Create without files
const newClassifier = await classifierAPI.createClassifier({
  name: 'HCV XGBoost Classifier',
  description: 'XGBoost model for HCV prediction',
  disease_id: 1,
  modality: 'Tabular',
  model_type: 'XGBoost',
  accuracy: 0.95,
  version: 'v1.0.0',
  required_features: ['Age', 'ALB', 'ALP', 'ALT', 'AST', 'BIL', 'CHE', 'CHOL', 'CREA', 'GGT', 'PROT']
});

// 5. Upload model files (admin) - Step 2: Upload 5 .pkl files
const files = {
  features_file: featuresFile,  // File object from input
  scaler_file: scalerFile,
  imputer_file: imputerFile,
  model_file: modelFile,
  class_file: classFile
};
await classifierAPI.uploadModelFiles(newClassifier.id, files);

// 6. Update classifier metadata (admin)
const updatedClassifier = await classifierAPI.updateClassifier(classifierId, {
  description: 'Updated description',
  accuracy: 0.97,
  version: 'v1.1.0'
});

// 7. Delete classifier (admin) - WARNING: Also deletes model files
await classifierAPI.deleteClassifier(classifierId);

// ============================================
// DIAGNOSIS/PREDICTION OPERATIONS
// ============================================

// Only use diagnosisAPI for diagnosis/prediction-specific operations:

// 1. Get user diagnoses
const diagnoses = await diagnosisAPI.getUserDiagnoses();

// 2. Search diagnoses
const searchResults = await diagnosisAPI.searchDiagnoses({
  status: 'COMPLETED',
  disease_id: 1
});

// 3. Get statistics
const stats = await diagnosisAPI.getQuickStats();
const analytics = await diagnosisAPI.getUserAnalytics();

// 4. Export data
const csvBlob = await diagnosisAPI.exportCSV();
const excelBlob = await diagnosisAPI.exportExcel();

// ============================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================

async function createCompleteClassifier() {
  try {
    // Step 1: Create disease (if needed)
    const disease = await diseaseAPI.createDisease({
      name: 'New Disease',
      description: 'Disease description',
      category: 'Infectious',
      available_modalities: ['Tabular']
    });

    // Step 2: Create classifier
    const classifier = await classifierAPI.createClassifier({
      name: 'Disease Classifier',
      description: 'ML classifier for disease prediction',
      disease_id: disease.id,
      modality: 'Tabular',
      model_type: 'RandomForest',
      accuracy: 0.92,
      version: 'v1.0.0',
      required_features: ['feature1', 'feature2', 'feature3']
    });

    // Step 3: Upload model files
    // Assuming you have File objects from file inputs
    const files = {
      features_file: featuresFile,
      scaler_file: scalerFile,
      imputer_file: imputerFile,
      model_file: modelFile,
      class_file: classFile
    };

    await classifierAPI.uploadModelFiles(classifier.id, files);

    console.log('✅ Classifier created and model files uploaded successfully!');
    return classifier;
  } catch (error) {
    console.error('Error creating classifier:', error);
    throw error;
  }
}

// ============================================
// FILE UPLOAD COMPONENT EXAMPLE
// ============================================

function ClassifierUploadForm() {
  const [files, setFiles] = useState({
    features_file: null,
    scaler_file: null,
    imputer_file: null,
    model_file: null,
    class_file: null
  });

  const handleFileChange = (fileType) => (event) => {
    setFiles({
      ...files,
      [fileType]: event.target.files[0]
    });
  };

  const handleSubmit = async () => {
    // Validate all files are present
    const allFilesPresent = Object.values(files).every(file => file !== null);
    if (!allFilesPresent) {
      alert('All 5 model files are required');
      return;
    }

    // Create classifier first
    const classifier = await classifierAPI.createClassifier({
      // ... classifier data
    });

    // Then upload files
    await classifierAPI.uploadModelFiles(classifier.id, files);
  };

  return (
    <div>
      <input type="file" accept=".pkl" onChange={handleFileChange('features_file')} />
      <input type="file" accept=".pkl" onChange={handleFileChange('scaler_file')} />
      <input type="file" accept=".pkl" onChange={handleFileChange('imputer_file')} />
      <input type="file" accept=".pkl" onChange={handleFileChange('model_file')} />
      <input type="file" accept=".pkl" onChange={handleFileChange('class_file')} />
      <button onClick={handleSubmit}>Upload</button>
    </div>
  );
}

// ============================================
// ERROR HANDLING
// ============================================

try {
  const disease = await diseaseAPI.createDisease(diseaseData);
} catch (error) {
  if (error.response?.status === 400) {
    console.error('Validation error:', error.response.data.detail);
  } else if (error.response?.status === 403) {
    console.error('Permission denied - admin access required');
  } else if (error.response?.status === 404) {
    console.error('Resource not found');
  } else {
    console.error('Unexpected error:', error);
  }
}
