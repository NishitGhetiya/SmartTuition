import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [classCount, setClassCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch classes
        const classResponse = await axios.get(
          "http://localhost:5000/api/class/student/classes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClassCount(classResponse.data.length);

        // Fetch attendance history
        const attendanceResponse = await axios.get(
          "http://localhost:5000/api/attendance/student/attendancehistory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAttendanceCount(attendanceResponse.data.length);

        // Fetch homework history
        const homeworkResponse = await axios.get(
          "http://localhost:5000/api/homework/student/homeworkhistory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHomeworkCount(homeworkResponse.data.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-center mb-4">Home</h2>

      <div className="container mt-5">
        <div className="row justify-content-center">
          {/* Classes Count */}
          <Link
            to="/Student/class"
            className="col-md-4 col-lg-3 text-decoration-none mb-4"
          >
            <div className="card shadow-lg p-4 mb-4 bg-white rounded h-100">
              <div className="card-body text-center">
                <h4 className="card-text">Total Joined Classes</h4>
                <h1 className="display-4 text-primary">{classCount}</h1>
              </div>
            </div>
          </Link>

          {/* Attendance Count */}
          <Link
            to="/Student/attendance"
            className="col-md-4 col-lg-3 text-decoration-none mb-4"
          >
            <div className="card shadow-lg p-4 mb-4 bg-white rounded h-100">
              <div className="card-body text-center">
                <h4 className="card-text">Total Attendances Records</h4>
                <h1 className="display-4 text-success">{attendanceCount}</h1>
              </div>
            </div>
          </Link>

          {/* Homework Count */}
          <Link
            to="/Student/homework"
            className="col-md-4 col-lg-3 text-decoration-none mb-4"
          >
            <div className="card shadow-lg p-4 mb-4 bg-white rounded h-100">
              <div className="card-body text-center">
                <h4 className="card-text">Total Assigned Homework</h4>
                <h1 className="display-4 text-info">{homeworkCount}</h1>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
