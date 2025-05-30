import React, { useState } from "react";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";

const ClassJoin = () => {
  const [classCode, setClassCode] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/class/join",
        { classCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({ type: "success", text: res.data.message });
      setClassCode("");
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleOk = () => {
    navigate("/Student/class");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Join a Class</h2>

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
          <label htmlFor="classCode" className="form-label">
            Class Code
          </label>
          <input
            type="text"
            className="form-control"
            id="classCode"
            name="classCode"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="Enter class code"
            required
          />
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button type="submit" className="btn btn-primary">
            Join Class
          </button>
          <Link to="/Student/class" className="btn btn-secondary">
            Cancle
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ClassJoin;
