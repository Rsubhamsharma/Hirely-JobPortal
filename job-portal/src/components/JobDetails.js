import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jobService from "../services/job.service";
import applicationService from "../services/application.service";
import authService from "../services/auth.service";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    jobService.getJobById(id).then(
      (response) => {
        setJob(response.data.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }, [id]);

  const handleApply = () => {
    applicationService.applyToJob(id).then(
      (response) => {
        setMessage("Applied successfully!");
      },
      (error) => {
        setMessage(error.response.data.message);
      }
    );
  };

  return (
    <div className="container">
      {job && (
        <div>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>{job.location}</p>
          <p>{job.description}</p>
          <p>Salary: {job.salary}</p>
          <p>Job Type: {job.jobType}</p>
          {currentUser && currentUser.data.user.role === "applicant" && (
            <button className="btn btn-primary" onClick={handleApply}>
              Apply
            </button>
          )}
          {message && (
            <div className="alert alert-info mt-2">{message}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetails;
