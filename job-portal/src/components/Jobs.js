import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import jobService from "../services/job.service";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    jobService.getAllJobs().then(
      (response) => {
        setJobs(response.data.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <div className="container">
      <ul className="list-group">
        {jobs &&
          jobs.map((job, index) => (
            <li className="list-group-item" key={index}>
              <Link to={`/jobs/${job._id}`}>
                <h4>{job.title}</h4>
              </Link>
              <p>{job.company}</p>
              <p>{job.location}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Jobs;
