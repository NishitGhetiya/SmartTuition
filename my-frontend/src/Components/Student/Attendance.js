import React, { useEffect, useState } from "react";
import axios from "axios";

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(
        "http://localhost:5000/api/class/student/classes",
        config
      );
      setClasses(res.data);

      res.data.forEach(async (cls) => {
        try {
          const attRes = await axios.get(
            `http://localhost:5000/api/attendance/class/${cls.id}/student`,
            config
          );
          setAttendanceData((prev) => ({ ...prev, [cls.id]: attRes.data }));
        } catch (attErr) {
          console.error(
            `Error fetching attendance for class ${cls.id}:`,
            attErr
          );
        }
      });
    } catch (err) {
      console.error("Error fetching classes or attendance", err);
    }
  };

  const toggleClass = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const calculateSummary = (records) => {
    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = total - present;
    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(1);
    return { total, present, absent, percentage };
  };

  const isAllEmpty = classes.every(
    (cls) => !attendanceData[cls.id] || attendanceData[cls.id].length === 0
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Attendance</h2>

      {classes.length === 0 ? (
        <div className="alert alert-secondary">
          You are not enrolled in any classes.
        </div>
      ) : isAllEmpty ? (
        <div className="alert alert-secondary">
          No attendance is available for any class.
        </div>
      ) : (
        classes.map((cls) => {
          const records = attendanceData[cls.id] || [];
          const { present, absent, percentage } = calculateSummary(records);

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
                  <p className="text-success">
                    <strong>Present:</strong> {present}
                  </p>
                  <p className="text-danger">
                    <strong>Absent:</strong> {absent}
                  </p>
                  <p
                    className={percentage > 75 ? "text-success" : "text-danger"}
                  >
                    <strong>Attendance %:</strong> {percentage}%
                  </p>

                  <hr />
                  <ul className="list-group">
                    {records.map((r, i) => (
                      <li
                        key={i}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <strong>{new Date(r.date).toLocaleDateString()}</strong>
                        <strong
                          className={
                            r.status === "Present"
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {r.status}
                        </strong>
                        <span>
                          <strong>Mark By : </strong>
                          {r.createdBy}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Attendance;
