import { useState, useEffect } from "react";
import "./index.css";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
    };

    const fetchDepartments = async () => {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data);
    };

    fetchEmployees();
    fetchDepartments();
  }, []);

  return (
    <div className="App">
      <h1>ACME HR Directory</h1>
      <div className="directory">
        <div>
          <h2>Departments</h2>
          <ul className="list">
            {departments.map((department) => (
              <li key={department.id} className="list-item">
                {department.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Employees</h2>
          <ul className="list">
            {employees.map((employee) => (
              <li key={employee.id} className="list-item">
                {employee.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
