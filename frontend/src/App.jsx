// eslint-disable-next-line no-unused-vars
import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LazyComponents, PerformanceMonitor } from "./config/performance";

// Critical components that should load immediately
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./components/auth/AuthCallback";
import AuthDebugPanel from "./components/auth/AuthDebugPanel";
import { AuthProvider } from "./context/AuthContext";

// add constants for API and AUTH configuration
import { FEATURES } from "./config/constants";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

function Signout() {
  localStorage.clear();
  return <Navigate to="/signin" />;
}

function App() {
  useEffect(() => {
    PerformanceMonitor.init();
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          {/* Global AuthDebugPanel for development */}
          {FEATURES.ENABLE_DEBUG_CONSOLE && <AuthDebugPanel />}
          <Routes>
            {/* Main application routes */}
            <Route path="/" element={<LazyComponents.Home />} />{" "}
            {/* New Diagnosis Platform Routes */}
            <Route
              path="/diagnosis"
              element={
                <ProtectedRoute>
                  <LazyComponents.DiagnosisMain />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/diagnosis/:diseaseId/modality"
              element={
                <ProtectedRoute>
                  <LazyComponents.ModalitySelector />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/diagnosis/:diseaseId/models/:modality"
              element={
                <ProtectedRoute>
                  <LazyComponents.ModelSelector />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/diagnosis/:diseaseId/predict"
              element={
                <ProtectedRoute>
                  <LazyComponents.PredictionForm />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/diagnosis/results/:predictionId"
              element={
                <ProtectedRoute>
                  <LazyComponents.ResultsPage />
                </ProtectedRoute>
              }
            />{" "}
            {/* Legacy Diagnosis Route (keep for backward compatibility) */}
            <Route
              path="/diagnosis-legacy"
              element={
                <ProtectedRoute>
                  <LazyComponents.Diagnosis />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <LazyComponents.Analytics />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/my-health-dashboard"
              element={
                <ProtectedRoute>
                  <LazyComponents.ProfileDashboard />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <LazyComponents.ProfilePage />
                </ProtectedRoute>
              }
            />{" "}
            {/* Admin Section Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/system"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/debug"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminDebugConsole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/diagnosis-management"
              element={
                <ProtectedRoute>
                  <LazyComponents.AdminDiagnosisManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <LazyComponents.AIAssistant />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="/patient-education"
              element={<LazyComponents.PatientEducation />}
            />
            <Route path="/research" element={<LazyComponents.Research />} />
            <Route path="/faq" element={<LazyComponents.FAQ />} />
            <Route
              path="/community"
              element={<LazyComponents.CommunityForum />}
            />
            <Route path="/about" element={<LazyComponents.About />} />
            <Route path="/contact" element={<LazyComponents.Contact />} />
            <Route
              path="/methodology"
              element={<LazyComponents.Methodology />}
            />
            {/* Authentication routes */}
            <Route path="/signin" element={<LazyComponents.SignIn />} />
            <Route path="/signup" element={<LazyComponents.SignUp />} />
            <Route path="/signout" element={<Signout />} />
            <Route
              path="/reset-password"
              element={<LazyComponents.ResetPassword />}
            />
            <Route
              path="/resetpassword"
              element={<LazyComponents.ResetPassword />}
            />
            <Route
              path="/resetpassword/confirm"
              element={<LazyComponents.ResetPasswordConfirm />}
            />
            <Route
              path="/verify-email"
              element={<LazyComponents.VerifyEmail />}
            />
            <Route
              path="/change-password"
              element={<LazyComponents.ChangePassword />}
            />
            <Route path="/auth/google/callback" element={<AuthCallback />} />
            <Route path="*" element={<LazyComponents.NotFound />}></Route>{" "}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
