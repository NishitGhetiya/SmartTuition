import React, { useEffect, useState } from "react";
import axios from "axios";

const Homework = () => {
  const [classes, setClasses] = useState([]);
  const [homeworkData, setHomeworkData] = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get("http://localhost:5000/api/class/student/classes", config);
      setClasses(res.data);

      res.data.forEach(async (cls) => {
        try {
          const hwRes = await axios.get(`http://localhost:5000/api/homework/student/homeworkhistory/${cls.id}`, config);
          setHomeworkData((prev) => ({ ...prev, [cls.id]: hwRes.data }));
        } catch (hwErr) {
          console.error(`Error fetching homework for class ${cls.id}:`, hwErr);
        }
      });
    } catch (err) {
      console.error("Error fetching classes or homework", err);
    }
  };

  const toggleClass = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const isAllEmpty = classes.every(
    (cls) => !homeworkData[cls.id] || homeworkData[cls.id].length === 0
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Homework</h2>

      {classes.length === 0 ? (
        <div className="alert alert-secondary">
          You are not enrolled in any classes.
        </div>
      ) : isAllEmpty ? (
        <div className="alert alert-secondary">
          No homework available for any class.
        </div>
      ) : (
        classes.map((cls) => {
          const homeworkList = homeworkData[cls.id] || [];

          return (
            <div key={cls.id} className="card mb-3">
              <div
                className="card-header d-flex justify-content-between align-items-center"
                onClick={() => toggleClass(cls.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="fw-bold">{cls.name}</div>
                <div>{expanded === cls.id ? "▲" : "▼"}</div>
              </div>

              {expanded === cls.id && (
                <div className="card-body">
                  {homeworkList.length === 0 ? (
                    <p>No homework assigned for this class.</p>
                  ) : (
                    <ul className="list-group">
                      {homeworkList.map((hw, i) => (
                        <li key={i} className="list-group-item">
                          <h5 className="mb-1">{hw.title}</h5>
                          <p className="mb-1">{hw.description}</p>
                          <p className="mb-1">
                            <strong>Due Date:</strong>{" "}
                            {new Date(hw.dueDate).toLocaleDateString()}
                          </p>
                          <p className="mb-0">
                            <strong>Assigned By:</strong> {hw.assignedBy.name}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Homework;
