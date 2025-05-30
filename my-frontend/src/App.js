import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherRoutes from "./Components/Teacher/TeacherRoutes";
import StudentRoutes from "./Components/Student/StudentRoutes";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ProtectedRoute from "./Pages/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />

          {/* Protected Routes for Students */}
          <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
            <Route path="/Student/*" element={<StudentRoutes />} />
          </Route>

          {/* Protected Routes for Teachers */}
          <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
            <Route path="/Teacher/*" element={<TeacherRoutes />} />
          </Route>

          {/* Default Route */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
