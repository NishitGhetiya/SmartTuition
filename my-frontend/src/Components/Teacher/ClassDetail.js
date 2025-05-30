import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
  });

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/class/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setClassInfo(res.data.class);
        setStudents(res.data.students); // Backend must send list of joined students
        setFormData({
          name: res.data.class.name,
          description: res.data.class.description,
          subject: res.data.class.subject,
        });
      } catch (error) {
        console.error("Error fetching class detail:", error);
      }
    };

    fetchClassDetail();
  }, [classId]);

  const handleTakeAttendance = () => {
    navigate(`/Teacher/attendance/${classId}`, { state: { students } });
  };

  const handleGiveHomework = () => {
    navigate(`/Teacher/homework/${classId}`, { state: { students } });
  };
  const handleEditClass = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/class/${classId}/edit`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Class updated successfully");
      setEditMode(false);
      window.location.reload();
    } catch (error) {
      console.error("Error editing class:", error);
      alert("Failed to update class");
    }
  };
  const handleDeleteClass = async () => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/class/${classId}/delete`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Class deleted successfully");
        navigate("/Teacher/class");
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete class");
      }
    }
  };
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/class/${classId}/remove-student/${studentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Student removed successfully");
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (error) {
      console.error("Error removing student:", error);
      alert("Failed to remove student from class");
    }
  };

  return (
    <>
      <div className="container mt-4">
        <Link to="/Teacher/class" className="text-black">
          <h5>
            <i class="bi bi-arrow-left"></i>
          </h5>
        </Link>
        <div className="text-end">
          <button
            className="btn btn-warning me-2"
            onClick={() => setEditMode(true)}
          >
            <i className="bi bi-pencil-square me-2"></i> Edit Class
          </button>
          <button className="btn btn-danger" onClick={handleDeleteClass}>
            <i className="bi bi-trash-fill me-2"></i> Delete Class
          </button>
        </div>
        {editMode && (
          <div
            className="modal d-block"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditMode(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Class Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Class Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  </div>
                  <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleEditClass}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <h3>{classInfo.name}</h3>
        <h6 className="mb-2 text-muted">Code: {classInfo.classCode}</h6>
        <p>{classInfo.description}</p>
        <p>
          <strong>Subject:</strong> {classInfo.subject}
        </p>
        <p>
          <strong>Students:</strong> {classInfo.studentCount}
        </p>
        <p>
          <strong>Teacher:</strong> {classInfo.teacherName}
        </p>
        <p>
          <strong>Date:</strong> {new Date(classInfo.dateTime).toLocaleString()}
        </p>
        <button
          className="btn btn-success my-3 me-4"
          onClick={handleTakeAttendance}
        >
          Take Attendance
        </button>
        <button className="btn btn-secondary my-3" onClick={handleGiveHomework}>
          Give Homework
        </button>

        <table className="table table-striped">
          <thead className="text-center">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile no.</th>
              <th>Remove from Class</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {students.map((student, idx) => (
              <tr key={student._id}>
                <td>{idx + 1}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.mobileNo}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveStudent(student._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ClassDetail;
