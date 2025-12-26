const express = require("express");
const app = express();
const PORT = 3000;

const sqlite3 = require("sqlite3").verbose();

app.use(express.static("public"));
app.use(express.json());

main().catch((error) => console.log(error));

async function main() {
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

  app.post("/courses", (req, res) => {
    const course = req.body;
    const code = course.code;
    const name = course.name;
    const instructor = course.instructor;
    const credit = course.credit;
    const courseSql = `INSERT INTO Courses(code, name, instructor, credit) VALUES("${code}", "${name}", "${instructor}", ${credit})`;
    db.run(courseSql, function (error) {
      if (error) {
        console.log(error);
        res.status(400).send(error);
      }
      const courseId = this.lastID;
      console.log(`A row has been inserted to Courses with rowid ${courseId}`);
      const schedules = course.schedule;
      schedules.forEach((schedule) => {
        const CRN = schedule.CRN;
        const classroom = schedule.classroom;
        const classType = schedule.classType;
        const day = schedule.day;
        const time = schedule.time;
        const scheduleSql = `INSERT INTO Schedules(CRN, classroom, classType, day, time, courseID) VALUES(${CRN}, "${classroom}", "${classType}", "${day}", "${time}", ${courseId})`;
        db.run(scheduleSql, function (error) {
          if (error) {
            console.log(error);
            res.status(400).send(error);
          }
          const scheduleId = this.lastID;
          console.log(
            `A row has been inserted to Schedules with rowid ${scheduleId}`
          );
        });
      });
    });
    res.status(200).send("sucessfully added");
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
}
