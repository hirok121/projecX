/**
 * Custom hooks for diagnosis-related data fetching
 */
import { useState, useEffect } from "react";
import { diagnosisAPI } from "../services/diagnosisAPI";
import logger from "../utils/logger";

/**
 * Hook to fetch all user diagnoses
 */
export const useUserDiagnoses = (params = {}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize params for dependency comparison
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        setIsLoading(true);
        logger.log("Fetching all user diagnoses...");
        const response = await diagnosisAPI.getUserDiagnoses();
        logger.log("User diagnoses response:", response);
        setData(response.data || response || []);
        setError(null);
      } catch (err) {
        logger.error("Error fetching user diagnoses:", err);
        setError(err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnoses();
  }, [paramsString]);

  return { data, isLoading, error };
};
