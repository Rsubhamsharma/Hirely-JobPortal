import React, { useState, useEffect } from "react";
import jobService from "../services/job.service";
import applicationService from "../services/application.service";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});

  useEffect(() => {
    // This is not ideal, we should have a dedicated endpoint to get jobs by recruiter
    jobService.getAllJobs().then(
      (response) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const recruiterJobs = response.data.data.filter(
          (job) => job.postedBy === user.data.user._id
        );
        setJobs(recruiterJobs);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  const getApplications = (jobId) => {
    applicationService.getApplicationsForJob(jobId).then(
      (response) => {
        setApplications((prev) => ({
          ...prev,
          [jobId]: response.data.data,
        }));
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <div className="container">
      <h3>My Job Postings</h3>
      {jobs.map((job) => (
        <div key={job._id} className="card mt-3">
          <div className="card-body">
            <h4 className="card-title">{job.title}</h4>
            <button
              className="btn btn-primary"
              onClick={() => getApplications(job._id)}
            >
              View Applications
            </button>
            {applications[job._id] && (
              <ul className="list-group mt-3">
                {applications[job._id].map((app) => (
                  <li key={app._id} className="list-group-item">
                    <p>Applicant: {app.applicant.name}</p>
                    <p>Status: {app.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecruiterDashboard;
