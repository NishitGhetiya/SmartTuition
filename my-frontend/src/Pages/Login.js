import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" }, []);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect user to the correct dashboard if already logged in
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // Store role in localStorage

    if (token && role === "Teacher") {
      navigate("/Teacher");
    } else if (token && role === "Student") {
      navigate("/Student");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      //alert("Login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // Navigate based on role
      if (res.data.user.role === "Teacher") {
        navigate("/Teacher");
      } else {
        navigate("/Student");
      }
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  
  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <h2 className="title">Smart Tuition</h2>
          <h4>Login</h4>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              className="form-control form-input w-100"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
            />
            <input
              type="password"
              name="password"
              className="form-control form-input w-100"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
            />
            <button type="submit" className="btn btn-success w-100">
              Login
            </button>
          </form>
          <p className="redirect-text">
            Don't have an account? <Link to="/Signup">Signup</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
