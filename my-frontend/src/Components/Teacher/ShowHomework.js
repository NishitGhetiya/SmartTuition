import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const ShowHomework = () => {
  const [homeworkHistory, setHomeworkHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

  const token = localStorage.getItem("token");

  const fetchHomework = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/homework/teacher/homeworkhistory",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHomeworkHistory(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching homework history:", error);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEdit = async (entry) => {
    console.log("Edit clicked for:", entry);
    try {
      const classId = entry.classId?._id;
      const res = await axios.get(`http://localhost:5000/api/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const students = res.data.students; // ✅ fix here
      console.log("Fetched students for class:", students);
  
      const updatedStudents = students.map((student) => ({
        ...student,
        checked: entry.assignedTo.some((s) => s._id === student._id),
      }));
  
      setEditingHomework({
        ...entry,
        dueDate: entry.dueDate?.split("T")[0] || "",
      });
      setClassStudents(updatedStudents);
      setEditMode(true);
    } catch (err) {
      console.error("Error fetching students for class:", err);
    }
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/homework/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHomework();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete homework.");
    }
  };

  const saveEdit = async () => {
    console.log("Saving edit:", editingHomework);
    const { _id, title, description, dueDate } = editingHomework;
    const selectedStudents = classStudents.filter((s) => s.checked);

    try {
      await axios.put(
        `http://localhost:5000/api/homework/edit/${_id}`,
        {
          title,
          description,
          dueDate,
          assignedTo: selectedStudents.map((s) => s._id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditMode(false);
      setEditingHomework(null);
      fetchHomework();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update homework.");
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingHomework(null);
    setClassStudents([]);
  };

  const handleCheckboxChange = (studentId) => {
    setClassStudents((prev) =>
      prev.map((student) =>
        student._id === studentId
          ? { ...student, checked: !student.checked }
          : student
      )
    );
  };

  if (loading)
    return <div className="text-center my-3">Loading homework history...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Homework History</h2>
      {homeworkHistory.length === 0 ? (
        <p className="alert alert-secondary">No homework history available.</p>
      ) : (
        homeworkHistory.map((entry) => (
          <div key={entry._id} className="mb-4 border rounded p-3 shadow-sm">
            <h3
              className="d-flex justify-content-between align-items-center mb-3"
              onClick={() => toggleExpand(entry._id)}
              style={{ cursor: "pointer" }}
            >
              <span>
                {entry.classId?.name || "Unknown Class"} , Due -{" "}
                {new Date(entry.dueDate).toLocaleDateString()}
              </span>
              <span className="fs-5">
                {expandedIds.includes(entry._id) ? "▲" : "▼"}
              </span>
            </h3>

            <div className="alert alert-info d-flex justify-content-between align-items-center">
              <div>
                <strong>Title:</strong> {entry.title} <br />
                <strong>Description:</strong> {entry.description}
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => handleEdit(entry)}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(entry._id)}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>

            {expandedIds.includes(entry._id) && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.assignedTo.map((student, idx) => (
                      <tr key={idx}>
                        <td>{student?.name || "N/A"}</td>
                        <td>{student?.email || "N/A"}</td>
                        <td>{student?.mobileNo || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {/* EDIT MODAL */}
      {editMode && editingHomework && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Homework</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={cancelEdit}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingHomework.title}
                    onChange={(e) =>
                      setEditingHomework({
                        ...editingHomework,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={editingHomework.description}
                    onChange={(e) =>
                      setEditingHomework({
                        ...editingHomework,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingHomework.dueDate}
                    onChange={(e) =>
                      setEditingHomework({
                        ...editingHomework,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Assign To Students</label>
                  <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Name</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student) => (
                          <tr key={student._id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={student.checked}
                                onChange={() => handleCheckboxChange(student._id)}
                              />
                            </td>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowHomework;
