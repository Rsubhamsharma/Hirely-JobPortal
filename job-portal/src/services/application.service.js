import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/v1/applications/";

const applyToJob = (jobId) => {
  return axios.post(API_URL + "apply/" + jobId, {}, { headers: authHeader() });
};

const getAppliedJobs = () => {
  return axios.get(API_URL + "applied-jobs", { headers: authHeader() });
};

const getApplicationsForJob = (jobId) => {
  return axios.get(API_URL + "job/" + jobId, { headers: authHeader() });
};

const updateApplicationStatus = (applicationId, status) => {
  return axios.patch(
    API_URL + applicationId,
    { status },
    { headers: authHeader() }
  );
};

const applicationService = {
  applyToJob,
  getAppliedJobs,
  getApplicationsForJob,
  updateApplicationStatus,
};

export default applicationService;
