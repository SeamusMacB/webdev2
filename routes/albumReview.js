const express = require('express');
const router = express.Router();
const checkLogin = require("../middleware/authen")
const db = require('./connection');



router.get("/albumreview", (req, res) => {
  let album =`SELECT * FROM member
  INNER JOIN user_review
  ON member.member_id=user_review.member_id
  INNER JOIN artist_album 
  ON user_review.artist_album_id=artist_album.artist_album_id 
  INNER JOIN album 
  ON artist_album.album_id=album.album_id 
  ORDER BY album.album_title`;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("albumreview", { albumInfo });
  });
});

router.get("/addalbumreview", (req, res) =>{

    let album = `SELECT * FROM album INNER JOIN artist_album ON album.album_id=artist_album.album_id `;
  
    db.query(album, (err, albumInfo) => {
      if (err) throw err;
      res.render("addalbumreview", { albumInfo });
      
    });
  
  });
  
  router.post("/addalbumreview", (req, res) =>{
  
    let memberid = req.session.uid;
    let artist_album_id = req.body.bandname;
    let review = req.body.review;
    let update = "INSERT INTO user_review( member_id, artist_album_id, review) VALUES (? , ? , ?)";
    db.query(update, [memberid, artist_album_id, review], (err, rows) =>{
      if(err) throw err;
      res.redirect("/dashboard");
    });
  })

  router.get("/deletealbumreview", checkLogin, (req, res) =>{

    let memberid = req.session.uid;
  
    let result = `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;
  
    console.table(result);
    db.query(result, [memberid], (err,rows) =>{
      if(err) throw err; 
      res.render("deletealbumreview",{rows});
    });
   });
  
  router.post("/deletealbumreview", (req,res) =>{
  
    let user_review = req.body.review
    console.log(user_review)
    let deleterecord = `DELETE FROM user_review WHERE user_review_id = ${user_review}`;
  
    db.query(deleterecord, (err, rows) =>{
      if(err) throw err;
      res.redirect("/dashboard");
  
    });
  });

  router.get("/updatealbumreview",checkLogin, (req,res) =>{
  
    let memberid = req.session.uid;
  
    let result =  `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;
  
   
      db.query(result,[memberid], (err,reviews) =>{
          if(err) throw err;
          res.render("Updatealbumreview", {reviews});
      }); 
  });
  
  router.post("/updatealbumreview",(req,res) =>{
  
    let updatedrow = req.body.review;
    let updatereview = req.body.updatedReview;
  
  
    let update = `UPDATE user_review SET review = ? WHERE user_review_id = ?`
  
    db.query(update,[updatereview,updatedrow], (err,update) =>{
        if(err) throw err;
        res.redirect("/dashboard");
    });
  
  });

  router.get("/reviews", (req, res) => {
    let album = `SELECT * FROM user_review`;
  
    db.query(album, (err, albumInfo) => {
      if (err) throw err;
      res.render("reviews", { albumInfo });
    });
  });
  
  router.post('/reviews', (req, res) =>{
  
    let album = req.body.album_name;
    let album_review = req.body.album_review;
  
    let review = "INSERT INTO dummy_table (album, review) VALUES( ? , ? )";
  
    db.query(review,[album, album_review], (err, rows) =>{
      if(err) throw err;
      res.redirect("/"); 
      //res.send(`You have now added a review for <p>${album}</p> stating that : <p>${album_review} </p>`);
      })
   });

module.exports = router;