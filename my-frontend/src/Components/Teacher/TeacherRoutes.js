import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Dashboard from "./Dashboard";
import Class from "./Class";
import ClassForm from "./ClassForm";
import ClassDetail from "./ClassDetail";
import Attendance from "./Attendance";
import ShowAttendance from "./ShowAttendance";
import Homework from "./Homework";
import ShowHomework from "./ShowHomework";
import Profile from "./Profile";

const TeacherRoutes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/class" element={<Class />} />
        <Route path="/classform" element={<ClassForm />} />
        <Route path="/class/:classId" element={<ClassDetail />} />
        <Route path="/attendance/:classId" element={<Attendance />} />
        <Route path="/attendance" element={<ShowAttendance />} />
        <Route path="/homework/:classId" element={<Homework />} />
        <Route path="/homework" element={<ShowHomework />} />
      </Routes>
      <Footer />
    </>
  );
};

export default TeacherRoutes;
