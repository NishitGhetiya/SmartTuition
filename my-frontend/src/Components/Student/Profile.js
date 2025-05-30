import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/myid", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({ ...res.data });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/user/myid",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data.user);
      setMessage(res.data.message);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirm) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/user/myid", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/Login";
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  if (!user)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div>Loading profile...</div>
      </div>
    );

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="card-title text-center mb-3">Profile</h3>
        {message && <div className="alert alert-success">{message}</div>}
        <div className="card-body">
          {["name", "email", "mobileNo"].map((field, idx) => (
            <p key={idx}>
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{" "}
              {editMode ? (
                <input
                  className="form-control"
                  //type={field === "password" ? "password" : "text"}
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                />
              ) : (
                user[field]
              )}
            </p>
          ))}
          <div className="mt-4 d-flex justify-content-between">
            {editMode ? (
              <div>
              <button className="btn btn-primary me-2" onClick={handleUpdate}>
                <i className="bi bi-check-circle me-2"></i>Save Changes
              </button>
              <button
              className="btn btn-secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-warning"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit Account
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash-fill me-2"></i>Delete Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
