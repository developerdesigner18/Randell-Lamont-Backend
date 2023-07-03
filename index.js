const express = require('express');
require('dotenv').config()
const app = express();
const bodyParser = require("body-parser");

app.use(express.json());
app.use(express.static(__dirname + "/src/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userRoutes = require('./src/route/user.js');
app.use('/api/users', userRoutes);

// Start the server
const port = 3000; // Change this to the desired port number
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
