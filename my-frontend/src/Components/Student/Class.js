import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Class = () => {
  const [joinedClasses, setJoinedClasses] = useState([]);

  useEffect(() => {
    const fetchJoinedClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/class/student/classes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJoinedClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch joined classes", err);
      }
    };

    fetchJoinedClasses();
  }, []);

  return (
    <div className="container mt-4">
      <Link to="/Student/classjoin" className="btn btn-success mb-3">Join Class</Link>
  
      {joinedClasses.length > 0 ? (
        <>
          <h5>Your Joined Classes :</h5>
          <div className="row">
            {joinedClasses.map(cls => (
              <Link to={`/Student/class/${cls.id}`} className="col-md-4 text-decoration-none" key={cls.id}>
                <div className="card mb-3 shadow">
                  <div className="card-body">
                    <h5 className="card-title">{cls.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">Code: {cls.classCode}</h6>
                    <p className="card-text">{cls.description}</p>
                    <p className="card-text">
                      <strong>Subject:</strong> {cls.subject}
                    </p>
                    <p className="card-text">
                      <strong>Teacher:</strong> {cls.teacherName}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="alert alert-secondary" role="alert">
          You haven't joined any classes yet. Your joined classes will be displayed here once you join one.
        </div>
      )}
    </div>
  );
  
};

export default Class;
