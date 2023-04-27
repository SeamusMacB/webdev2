const express = require('express');
const router = express.Router();
const mysql = require("mysql");


let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stax3",
    multipleStatements: true
  });
  
  db.connect((err) => {
    if (err) throw err;
    console.log("database connected successfully");
  });
  
  module.exports = db;  