const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// open database
const db = new sqlite3.Database("./db/cst-dashboard.db", (error) => {
  if (error) console.error(error.message);
  console.log("Connected to the cst-dashboard database.");
});

app.get("/courses", (req, res) => {
  const sql = "SELECT * FROM Courses";

  db.all(sql, (error, rows) => {
    if (error) console.log(error.message);
    res.send(rows);
  });
});

app.get("/courseSchedules", (req, res) => {
  const sql =
    "SELECT * FROM Courses, Schedules where Schedules.courseId = Courses.ID";

  db.all(sql, (error, rows) => {
    if (error) console.log(error.message);
    res.send(rows);
  });
});

process.on("SIGINT", () => {
  // close the database connection
  db.close((error) => {
    if (error) return console.error(error.message);
    console.log("Close the database connection.");
    process.exit(error ? 1 : 0);
  });
});
