const express = require('express');
const router = express.Router();
const db = require('./connection');

router.get("/genre", (req, res) =>{

    let genre = `SELECT * FROM genre`;
    db.query(genre, (err, genreList) =>{
      if(err) throw err;
      res.render("genre", { genreList });
    });
  });


  router.get("/genrebands", (req,res) =>{
   
    let genre =`SELECT * FROM album WHERE genre_id = ?`
     
    let genreid = req.query.genre_id;
  
    db.query(genre,[genreid], (err,rows) =>{
     
      res.render("genrebands", {rows});
      });
    });

  module.exports = router;