const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

// Optional: Test connection on startup (already done in server.js, but can be useful here too)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error creating connection pool:", err);
    // Depending on the error, you might want to exit or handle differently
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    } else if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("Database access denied. Check credentials.");
    }
  } else {
    console.log("Database connection pool created successfully.");
    connection.release();
  }
});

module.exports = pool;

