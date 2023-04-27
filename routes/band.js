const express = require('express');
const router = express.Router();
const db = require('./connection');

router.get("/band", (req, res) => {
  
    let artist = `SELECT * FROM artist`;
    db.query(artist, (err, artistList) => {
    if(err) throw err;
    res.render("band", { artistList });
  });
});


router.get("/banddetail", (req, res) =>{

    let artist = `SELECT * FROM artist WHERE artist_id = ?`

     let bandid= req.query.artist_id

   db.query(artist,[bandid], (err,rows) =>{
     //console.table(rows)
     res.render("banddetail", {rows});
   });
});




  module.exports = router;