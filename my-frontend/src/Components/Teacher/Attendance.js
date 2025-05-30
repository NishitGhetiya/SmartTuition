import React, { useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Attendance = () => {
  const { classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const students = location.state?.students || [];

  const [attendanceRecords, setAttendanceRecords] = useState(
    students.map((student) => ({
      student: student._id,
      status: "Present",
      name: student.name,
      email: student.email,
      mobileNo: student.mobileNo,
    }))
  );

  const [selectAll, setSelectAll] = useState(true);

  const toggleCheckbox = (index) => {
    const updated = [...attendanceRecords];
    updated[index].status =
      updated[index].status === "Present" ? "Absent" : "Present";
    setAttendanceRecords(updated);
  };

  const handleSelectAll = () => {
    const newStatus = !selectAll;
    setSelectAll(newStatus);
    const updated = attendanceRecords.map((record) => ({
      ...record,
      status: newStatus ? "Present" : "Absent",
    }));
    setAttendanceRecords(updated);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          classId,
          records: attendanceRecords.map(({ student, status }) => ({
            student,
            status,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Attendance marked successfully!");
      navigate("/Teacher/attendance");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message === "Attendance already marked for today"
      ) {
        alert("Attendance has already been marked for today.");
      } else {
        alert("Failed to submit attendance.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <Link to={`/Teacher/class/${classId}`} className="text-black">
        <h5>
          <i className="bi bi-arrow-left"></i>
        </h5>
      </Link>

      <h3>Mark Attendance</h3>

      <div
        className="alert alert-secondary d-flex align-items-center gap-2"
        role="alert"
      >
        <input type="checkbox" checked readOnly />
        <span className="mb-0">
          Checked means <strong className="text-success">Present</strong>, unchecked means{" "}
          <strong className="text-danger">Absent</strong>.
        </span>
      </div>

      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          id="selectAll"
          checked={selectAll}
          onChange={handleSelectAll}
        />
        <label className="form-check-label fw-bold" htmlFor="selectAll">
          Select All Students
        </label>
      </div>

      <table className="table table-bordered">
        <thead className="text-center">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile No</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {attendanceRecords.map((record, index) => (
            <tr key={record.student}>
              <td>
                <input
                  type="checkbox"
                  checked={record.status === "Present"}
                  onChange={() => toggleCheckbox(index)}
                />
              </td>
              <td>{record.name}</td>
              <td>{record.email}</td>
              <td>{record.mobileNo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success" onClick={handleSubmit}>
        Submit Attendance
      </button>
    </div>
  );
};

export default Attendance;
