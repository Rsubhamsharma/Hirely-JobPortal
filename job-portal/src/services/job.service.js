import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api/v1/jobs/";

const getAllJobs = () => {
  return axios.get(API_URL);
};

const getJobById = (id) => {
  return axios.get(API_URL + id);
};

const createJob = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};

const updateJob = (id, data) => {
  return axios.patch(API_URL + id, data, { headers: authHeader() });
};

const deleteJob = (id) => {
  return axios.delete(API_URL + id, { headers: authHeader() });
};

const jobService = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};

export default jobService;
