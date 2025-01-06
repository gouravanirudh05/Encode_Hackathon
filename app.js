import pool from './db.js';
import sqlCode from './gemini.js';
async function runSQL(sqlCode) {
  try {
    const [rows] = await pool.execute(sqlCode); // Executes the SQL query
    console.log(rows);
  } catch (error) {
    console.error('Error executing query:', error.message);
  }
  finally {
    await pool.end(); // Close the connection pool
    console.log('Database connection closed.');
}
}

//const sqlCode="SELECT name, price FROM Products ORDER BY price ASC LIMIT 1;";
runSQL(sqlCode);
