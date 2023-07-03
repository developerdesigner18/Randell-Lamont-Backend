const pgp = require('pg-promise')();

// Update the connection string with your PostgreSQL database details
const connection = {
  host: 'localhost',
  port: 5432,
  database: 'marvella',
  user: 'postgres',
  password: 'Test@1001'  
};

const db = pgp(connection);

// Table creation query
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    salutation VARCHAR(10) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    mobilenumber VARCHAR(20) NOT NULL,
    add1 VARCHAR(100) NOT NULL,
    add2 VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    proofImg VARCHAR(255) NOT NULL,
    password VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    otp VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

`;

// Create the users table if it doesn't exist
db.none(createTableQuery)
  .then(() => {
    console.log('Users table created');
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });

module.exports = db;
