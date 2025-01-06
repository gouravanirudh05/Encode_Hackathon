import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sqlpassword',
  database: 'electronicStore',
});

export default pool;
