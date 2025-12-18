import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Box,
} from "@mui/material";
import BasicInfoStep from "./steps/BasicInfoStep";
import TabularFileUploadStep from "./steps/TabularFileUploadStep";
import ImageFileUploadStep from "./steps/ImageFileUploadStep";
import TabularMetadataStep from "./steps/TabularMetadataStep";
import ImageMetadataStep from "./steps/ImageMetadataStep";

function ClassifierWizard({
  open,
  onClose,
  classifier,
  diseases,
  onSubmit,
  loading,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    disease_id: "",
    modality: "",
    model_type: "",
    version: "",
    authors: "",
    blog_link: "",
    paper_link: "",
    required_features: [],
    feature_metadata: {},
    classifier_config: {},
    accuracy: "",
    precision: "",
    recall: "",
    f1_score: "",
    auc_roc: "",
    sensitivity: "",
    specificity: "",
    training_date: "",
    training_samples: "",
  });

  // Update form data when classifier prop changes
  useEffect(() => {
    if (classifier) {
      setFormData({
        name: classifier.name || "",
        title: classifier.title || "",
        description: classifier.description || "",
        disease_id: classifier.disease_id || "",
        modality: classifier.modality || "",
        model_type: classifier.model_type || "",
        version: classifier.version || "",
        authors: classifier.authors || "",
        blog_link: classifier.blog_link || "",
        paper_link: classifier.paper_link || "",
        required_features: classifier.required_features || [],
        feature_metadata: classifier.feature_metadata || {},
        classifier_config: classifier.classifier_config || {},
        accuracy: classifier.accuracy || "",
        precision: classifier.precision || "",
        recall: classifier.recall || "",
        f1_score: classifier.f1_score || "",
        auc_roc: classifier.auc_roc || "",
        sensitivity: classifier.sensitivity || "",
        specificity: classifier.specificity || "",
        training_date: classifier.training_date || "",
        training_samples: classifier.training_samples || "",
      });
      setExtractedFeatures(classifier.required_features || []);
    } else {
      // Reset form for new classifier
      setFormData({
        name: "",
        title: "",
        description: "",
        disease_id: "",
        modality: "",
        model_type: "",
        version: "",
        authors: "",
        blog_link: "",
        paper_link: "",
        required_features: [],
        feature_metadata: {},
        classifier_config: {},
        accuracy: "",
        precision: "",
        recall: "",
        f1_score: "",
        auc_roc: "",
        sensitivity: "",
        specificity: "",
        training_date: "",
        training_samples: "",
      });
      setExtractedFeatures([]);
    }
    setActiveStep(0); // Reset to first step when opening
  }, [classifier, open]);

  const [modelFiles, setModelFiles] = useState({
    features_file: null,
    scaler_file: null,
    imputer_file: null,
    model_file: null,
    class_file: null,
  });

  const [imageModelFile, setImageModelFile] = useState(null);
  const [extractedFeatures, setExtractedFeatures] = useState([]);

  const isTabular = formData.modality === "Tabular";
  const isEditMode = !!classifier;

  const steps = [
    "Basic Information",
    isTabular ? "Upload Model Files" : "Upload Model",
    isTabular ? "Feature Metadata & Metrics" : "Configuration & Metrics",
  ];

  const handleNext = async () => {
    // If moving from step 0 to step 1 and not editing, create the classifier first
    if (activeStep === 0 && !isEditMode && !createdClassifierId) {
      try {
        setSubmitLoading(true);
        const { classifierAPI } = await import("../../../services/classifierAPI");
        
        const basicData = {
          name: formData.name,
          title: formData.title,
          description: formData.description,
          disease_id: parseInt(formData.disease_id),
          modality: formData.modality,
          model_type: formData.model_type,
          version: formData.version,
          authors: formData.authors,
          blog_link: formData.blog_link,
          paper_link: formData.paper_link,
        };
        
        const newClassifier = await classifierAPI.createClassifier(basicData);
        setCreatedClassifierId(newClassifier.id);
      } catch (error) {
        console.error("Failed to create classifier:", error);
        alert("Failed to create classifier. Please try again.");
        return;
      } finally {
        setSubmitLoading(false);
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleFormChange = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileChange = (fileKey, file) => {
    setModelFiles((prev) => ({ ...prev, [fileKey]: file }));
  };

  const [createdClassifierId, setCreatedClassifierId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleFinalSubmit = async (metadata, isTabular) => {
    try {
      setSubmitLoading(true);
      const { classifierAPI } = await import("../../../services/classifierAPI");
      
      const classifierId = createdClassifierId || classifier?.id;
      
      if (isTabular) {
        // Update tabular metadata
        await classifierAPI.updateTabularMetadata(classifierId, metadata);
      } else {
        // Update image metadata
        await classifierAPI.updateImageMetadata(classifierId, metadata);
      }
      
      // Reload classifiers list
      await onSubmit();
      
      // Close wizard
      onClose();
    } catch (error) {
      console.error("Failed to save metadata:", error);
      throw error;
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={handleFormChange}
            diseases={diseases}
            onNext={handleNext}
            onCancel={onClose}
            isEditMode={isEditMode}
          />
        );
      case 1:
        if (isTabular) {
          return (
            <TabularFileUploadStep
              modelFiles={modelFiles}
              onFileChange={handleFileChange}
              extractedFeatures={extractedFeatures}
              onFeaturesExtracted={(features) => {
                setExtractedFeatures(features);
                handleFormChange({ required_features: features });
              }}
              classifierId={createdClassifierId || classifier?.id}
              onNext={handleNext}
              onCancel={onClose}
              isEditMode={isEditMode}
            />
          );
        } else {
          return (
            <ImageFileUploadStep
              imageModelFile={imageModelFile}
              onFileChange={setImageModelFile}
              classifierId={createdClassifierId || classifier?.id}
              onNext={handleNext}
              onCancel={onClose}
              isEditMode={isEditMode}
            />
          );
        }
      case 2:
        if (isTabular) {
          return (
            <TabularMetadataStep
              formData={formData}
              onChange={handleFormChange}
              extractedFeatures={extractedFeatures}
              classifierId={createdClassifierId || classifier?.id}
              onSubmit={handleFinalSubmit}
              onCancel={onClose}
              loading={submitLoading}
              isEditMode={isEditMode}
            />
          );
        } else {
          return (
            <ImageMetadataStep
              formData={formData}
              onChange={handleFormChange}
              classifierId={createdClassifierId || classifier?.id}
              onSubmit={handleFinalSubmit}
              onCancel={onClose}
              loading={submitLoading}
              isEditMode={isEditMode}
            />
          );
        }
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <DialogContent sx={{ p: 0 }}>{renderStep()}</DialogContent>
      </Box>
    </Dialog>
  );
}

export default ClassifierWizard;
