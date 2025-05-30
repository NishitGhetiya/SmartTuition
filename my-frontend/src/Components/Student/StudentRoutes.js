import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import Class from "./Class";
import ClassJoin from "./ClassJoin";
import ClassDetail from "./ClassDetail";
import Attendance from "./Attendance";
import Homework from "./Homework";
import Profile from "./Profile";

const StudentRoutes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/class" element={<Class />} />
        <Route path="/classjoin" element={<ClassJoin />} />
        <Route path="/class/:classId" element={<ClassDetail />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/homework" element={<Homework />} />
      </Routes>
      <Footer />
    </>
  );
};

export default StudentRoutes;
