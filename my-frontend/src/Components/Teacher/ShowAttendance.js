import React, { useEffect, useState,useCallback } from "react";
import axios from "axios";

const ShowAttendance = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [updatedRecords, setUpdatedRecords] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/attendance/teacher/attendancehistory",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceHistory(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEdit = (entry) => {
    // Deep clone the records to avoid changing the original before saving
    const deepClonedRecords = entry.records.map((rec) => ({
      ...rec,
      student: { ...rec.student },
    }));

    setEditingAttendance(entry);
    setUpdatedRecords(deepClonedRecords);
    setEditMode(true);
  };

  const handleStatusChange = (index, status) => {
    const updated = [...updatedRecords];
    updated[index].status = status;
    setUpdatedRecords(updated);
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/attendance/edit/${editingAttendance._id}`,
        { records: updatedRecords },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditMode(false);
      setEditingAttendance(null);
      fetchAttendance();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to edit attendance.");
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingAttendance(null);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this attendance record?")
    )
      return;

    try {
      await axios.delete(`http://localhost:5000/api/attendance/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAttendance();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete attendance.");
    }
  };

  if (loading)
    return (
      <div className="text-center my-3">Loading attendance history...</div>
    );

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Attendance History</h2>
      {attendanceHistory.length === 0 ? (
        <p className="alert alert-secondary">
          No attendance history available.
        </p>
      ) : (
        attendanceHistory.map((entry) => {
          const total = entry.records.length;
          const presentCount = entry.records.filter(
            (r) => r.status === "Present"
          ).length;
          const absentCount = total - presentCount;
          const presentPercent = ((presentCount / total) * 100).toFixed(1);
          const absentPercent = ((absentCount / total) * 100).toFixed(1);

          return (
            <div key={entry._id} className="mb-4 border rounded p-3 shadow-sm">
              <h3
                className="d-flex justify-content-between align-items-center mb-3 cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => toggleExpand(entry._id)}
              >
                <span>
                  {entry.classId?.name || "Unknown Class"} -{" "}
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span className="fs-5">
                  {expandedIds.includes(entry._id) ? "▲" : "▼"}
                </span>
              </h3>

              <div className="alert alert-info d-flex justify-content-between align-items-center">
                <div>
                  <strong className="text-primary">Total: {total}</strong>,{" "}
                  <strong className="text-success">
                    Present: {presentCount} ({presentPercent}%)
                  </strong>
                  ,{" "}
                  <strong className="text-danger">
                    Absent: {absentCount} ({absentPercent}%)
                  </strong>
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
                        <th>Status</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.records.map((record, idx) => (
                        <tr key={idx}>
                          <td
                            className={
                              record.status === "Present"
                                ? "text-success fw-bold"
                                : "text-danger fw-bold"
                            }
                          >
                            {record.status}
                          </td>
                          <td>{record.student?.name || "N/A"}</td>
                          <td>{record.student?.email || "N/A"}</td>
                          <td>{record.student?.mobileNo || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* EDIT MODAL */}
      {editMode && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Attendance</h5>
                <button className="btn-close" onClick={cancelEdit}></button>
              </div>
              <div className="modal-body">
                <table className="table table-bordered text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedRecords.map((rec, i) => (
                      <tr key={i}>
                        <td>{rec.student?.name || "N/A"}</td>
                        <td>{rec.student?.email || "N/A"}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={rec.status === "Present"}
                            onChange={(e) =>
                              handleStatusChange(
                                i,
                                e.target.checked ? "Present" : "Absent"
                              )
                            }
                          />
                          {rec.status === "Present" ? "Present" : "Absent"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default ShowAttendance;
