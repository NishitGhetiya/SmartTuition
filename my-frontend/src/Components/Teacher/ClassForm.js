import React, { useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";

const ClassForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/class/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        text: `✅ Class created successfully! Class Code: ${res.data.classCode}`,
      });

      // Clear form
      setFormData({
        name: "",
        subject: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };
  const handleOk = () => {
    navigate("/Teacher/class");
  };
  return (
    <>
      <div className="container mt-5" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 text-center">Create a New Class</h2>

        {/* {message && (
          <div className={`alert alert-${message.type}`} role="alert">
            {message.text}
          </div>
        )} */}
        {message && (
          <div className={`alert alert-${message.type}`} role="alert">
            <p>{message.text}</p>
            {message.type === "success" && (
              <div className="text-end">
                <button onClick={handleOk} className="btn btn-secondary btn-sm">
                  OK
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-3 p-4 rounded">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Class Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter class name"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="subject" className="form-label">
              Subject
            </label>
            <input
              type="text"
              className="form-control"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description (optional)
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a brief description"
            />
          </div>

          <div className="d-flex justify-content-center gap-2">
            <button type="submit" className="btn btn-primary">
              Create Class
            </button>
            <Link to="/Teacher/class" className="btn btn-secondary">
              Cancle
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ClassForm;
