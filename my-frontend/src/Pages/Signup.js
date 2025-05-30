import React,{useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    role: "Student",
  },[]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData
      );
      alert(res.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-box">
          <h2 className="title">Smart Tuition</h2>
          <h4>Sign Up</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control form-input"
                placeholder="Enter your name"
                onChange={handleChange}
                value={formData.name}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control form-input"
                placeholder="Enter your email"
                onChange={handleChange}
                value={formData.email}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control form-input"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile No</label>
              <input
                type="text"
                name="mobileNo"
                className="form-control form-input"
                placeholder="Mobile number must be exactly 10 digits"
                onChange={handleChange}
                value={formData.mobileNo}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-select form-input" onChange={handleChange} value={formData.role}>
              <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100">
              Sign Up
            </button>
          </form>
          <p className="redirect-text">
            Already have an account? <Link to="/Login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
