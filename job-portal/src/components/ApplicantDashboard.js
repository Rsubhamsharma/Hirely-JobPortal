import React, { useState, useEffect } from "react";
import applicationService from "../services/application.service";

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    applicationService.getAppliedJobs().then(
      (response) => {
        setApplications(response.data.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <div className="container">
      <h3>My Applications</h3>
      <ul className="list-group">
        {applications &&
          applications.map((application, index) => (
            <li className="list-group-item" key={index}>
              <h4>{application.job.title}</h4>
              <p>{application.job.company}</p>
              <p>Status: {application.status}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ApplicantDashboard;
