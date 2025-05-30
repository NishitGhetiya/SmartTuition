import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Homework = () => {
  const { classId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const students = location.state?.students || [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [selectedStudents, setSelectedStudents] = useState(
    students.map((student) => ({
      ...student,
      selected: true,
    }))
  );

  const [selectAll, setSelectAll] = useState(true);

  const toggleCheckbox = (index) => {
    const updated = [...selectedStudents];
    updated[index].selected = !updated[index].selected;
    setSelectedStudents(updated);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updated = selectedStudents.map((student) => ({
      ...student,
      selected: newSelectAll,
    }));
    setSelectedStudents(updated);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const assignedTo = selectedStudents
      .filter((student) => student.selected)
      .map((student) => student._id);

    if (!title || !description || !dueDate || assignedTo.length === 0) {
      alert("Please fill all fields and select at least one student.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/homework/assign",
        {
          classId,
          title,
          description,
          dueDate,
          assignedTo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Homework assigned successfully!");
      navigate("/Teacher/homework");
    } catch (error) {
      console.error("Error assigning homework:", error);
      alert("Failed to assign homework.");
    }
  };

  return (
    <div className="container mt-4">
      <Link to={`/Teacher/class/${classId}`} className="text-black">
        <h5>
          <i className="bi bi-arrow-left"></i>
        </h5>
      </Link>

      <h3>Assign Homework</h3>

      <div className="mb-3">
        <label className="form-label fw-bold">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter homework title"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter homework description"
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Due Date</label>
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-check mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          id="selectAll"
          checked={selectAll}
          onChange={handleSelectAll}
        />
        <label className="form-check-label fw-bold" htmlFor="selectAll">
          Select All Students
        </label>
      </div>

      <table className="table table-bordered text-center">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile No</th>
          </tr>
        </thead>
        <tbody>
          {selectedStudents.map((student, index) => (
            <tr key={student._id}>
              <td>
                <input
                  type="checkbox"
                  checked={student.selected}
                  onChange={() => toggleCheckbox(index)}
                />
              </td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.mobileNo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success" onClick={handleSubmit}>
        Submit Homework
      </button>
    </div>
  );
};

export default Homework;
