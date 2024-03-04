import { useState, useEffect } from "react";
import "./App.css";

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
    <div>
      <h1>ACME HR Directory</h1>
      <h2>Departments</h2>
      {departments.map((department) => (
        <div key={department.id}>
          <h3>{department.name}</h3>
        </div>
      ))}
      <h2>Employees</h2>
      {employees.map((employee) => (
        <div key={employee.id}>
          <h3>{employee.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default App;
