const express = require("express");
const app = express();
const pg = require("pg");
const path = require("path");
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(require("morgan")("dev"));

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory_db"
);

// Department Model
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from departments
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

// Employee Model
app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from employees ORDER BY created_at DESC;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO employees(name, department_id)
      VALUES($1, $2)
      RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
    ]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
      UPDATE employees
      SET name=$1, department_id=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
      DELETE from employees
      WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const init = async () => {
  await client.connect();
  let SQL = `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100)
    );
    CREATE TABLE employees(
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      name VARCHAR(255) NOT NULL,
      department_id INTEGER REFERENCES departments(id) NOT NULL
    );
  `;
  await client.query(SQL);
  console.log("tables created");
  SQL = `
    INSERT INTO departments(name) VALUES('HR');
    INSERT INTO departments(name) VALUES('Engineering');
    INSERT INTO departments(name) VALUES('Marketing');
    INSERT INTO employees(name, department_id) VALUES('John Doe', (SELECT id FROM departments WHERE name='HR'));
    INSERT INTO employees(name, department_id) VALUES('Jane Doe', (SELECT id FROM departments WHERE name='Engineering'));
    INSERT INTO employees(name, department_id) VALUES('Jim Doe', (SELECT id FROM departments WHERE name='Marketing'));
  `;
  await client.query(SQL);
  console.log("data seeded");
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
