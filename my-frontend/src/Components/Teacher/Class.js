import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Class = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token"); // ensure token is stored on login
        const response = await axios.get("http://localhost:5000/api/class/teacher/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClasses(response.data);
      } catch (err) {
        console.error("Error fetching classes", err);
      }
    };

    fetchClasses();
  }, []);

  return (
    <>
      <div className="container mt-4">
        <Link to="/Teacher/classform" className="btn btn-success mb-3">
          Create New Class
        </Link>

        {classes.length === 0 ? (
          <div className="alert alert-secondary">
            You have not created any classes yet. Once you create a class, it will appear here.
          </div>
        ) : (
          <div className="row">
            {classes.map((cls) => (
              <Link to={`/Teacher/class/${cls.id}`} className="col-md-4 text-decoration-none" key={cls.id}>
                <div className="card mb-3 shadow">
                  <div className="card-body">
                    <h5 className="card-title">{cls.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">Code: {cls.classCode}</h6>
                    <p className="card-text">{cls.description}</p>
                    <p className="card-text">
                      <strong>Subject:</strong> {cls.subject}
                    </p>
                    <p className="card-text">
                      <strong>Students:</strong> {cls.studentCount}
                    </p>
                    <p className="card-text">
                      <strong>Teacher:</strong> {cls.teacherName}
                    </p>
                    <p className="card-text">
                      <strong>Date:</strong> {new Date(cls.dateTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Class;
