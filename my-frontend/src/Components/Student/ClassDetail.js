import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ClassDetail = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [homeworkList, setHomeworkList] = useState([]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClassData(response.data.class);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        alert("Failed to load class details");
      }
    };

    fetchClassDetails();
  }, [classId]);

  const handleToggleAttendance = async () => {
    setShowAttendance(!showAttendance);

    if (!showAttendance) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/attendance/class/${classId}/student`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch student attendance:", error);
        alert("Error loading your attendance");
      }
    }
  };

  const handleToggleHomework = async () => {
    setShowHomework(!showHomework);

    if (!showHomework) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/homework/student/homeworkhistory/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHomeworkList(response.data);
      } catch (error) {
        console.error("Failed to fetch homework:", error);
        alert("Error loading homework");
      }
    }
  };

  return (
    <>
    <div className="container mt-5">
      <Link to="/Student/class" className="text-decoration-none mb-3 d-inline-block text-black">
        <h5>
          <i className="bi bi-arrow-left"></i> Back to Classes
        </h5>
      </Link>

      <h2 className="text-center mb-4">Class Detail</h2>

      {classData ? (
        <div className="card p-4 shadow rounded-4">
          <h3 className="card-title">{classData.name}</h3>
          <h6 className="card-subtitle mb-2 text-muted">Code: {classData.classCode}</h6>
          <p className="card-text">
            {classData.description}
          </p>
          <p className="card-text">
            <strong>Subject:</strong> {classData.subject}
          </p>
          <p className="card-text mb-4">
            <strong>Teacher:</strong> {classData.teacherName}
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className="btn btn-primary flex-grow-1"
              onClick={handleToggleAttendance}
            >
              Attendance{" "}
              <i
                className={`bi ${showAttendance ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}
              ></i>
            </button>

            <button
              className="btn btn-secondary flex-grow-1"
              onClick={handleToggleHomework}
            >
              Homework{" "}
              <i
                className={`bi ${showHomework ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}
              ></i>
            </button>
          </div>

          {/* Attendance Section */}
          {showAttendance && (
            <div className="mt-4">
              <h5 className="mb-3">Your Attendance Records</h5>
              {attendanceRecords.length === 0 ? (
                <div className="alert alert-secondary">No attendance records found.</div>
              ) : (
                <ul className="list-group">
                  {attendanceRecords.map((record, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{new Date(record.date).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span
                          className={`badge ${
                            record.status === "Present"
                              ? "bg-success"
                              : "bg-danger"
                          } p-2`}
                        >
                          {record.status}
                        </span>
                      </div>
                      <div>
                        <small className="text-muted">
                          Marked By: {record.createdBy}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Homework Section */}
          {showHomework && (
            <div className="mt-5">
              <h5 className="mb-3">Your Homework</h5>
              {homeworkList.length === 0 ? (
                <div className="alert alert-secondary">No homework assigned for this class.</div>
              ) : (
                <ul className="list-group">
                  {homeworkList.map((hw, idx) => (
                    <li key={idx} className="list-group-item">
                      <h6 className="fw-bold">{hw.title}</h6>
                      <p>{hw.description}</p>
                      <p className="mb-1">
                        <strong>Due Date:</strong>{" "}
                        {new Date(hw.dueDate).toLocaleDateString()}
                      </p>
                      <p className="mb-0">
                        <strong>Assigned By:</strong> {hw.assignedBy.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading class details...</span>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ClassDetail;
