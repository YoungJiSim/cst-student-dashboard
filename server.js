const sqlite3 = require("sqlite3").verbose();

// open database
let db = new sqlite3.Database("./db/cst-dashboard.db", (error) => {
  if (error) console.error(error.message);
  console.log("Connected to the cst-dashboard database.");
});

// close the database connection
db.close((error) => {
  if (error) return console.error(error.message);
  console.log("Close the database connection.");
});
