const express = require('express');
const router = express.Router();
const checkLogin = require("../middleware/authen")
const db = require('./connection');


router.get("/collectionreview", (req,res) =>{

  let colreviews = `SELECT * FROM collection INNER JOIN album_collection ON collection.collection_id=album_collection.collection_id INNER JOIN album ON album_collection.album_id=album.album_id;`

  db.query(colreviews, (err, row) =>{
    if(err) throw err;
   
    res.render("collectionreview", {row})
  });
});

router.get("/addcollectionreview", (req,res) =>{

    let collections = `SELECT * FROM member_collection`
    db.query(collections, (err, col) =>{
      if(err) throw err;
      res.render("addcollectionreview", {col} );
    
    }); 
  })
  

  
  router.post("/addcollectionreview", (req,res) =>{
    
    let memberid = req.session.uid;
    let collection = req.body.collectionname;
    let liked = req.body.liked
  
    let update = "INSERT INTO member_collection_review (member_id, collection_id, liked) VALUES (? , ?, ?)"
    db.query(update,[memberid,collection, liked],(err,rows)=>{
      if(err) throw err;
      res.redirect("/")
      })
  });

router.get("/mycollections", checkLogin, (req,res) =>{

    let memberid = req.session.uid;
  
    let result = `SELECT * FROM album
    INNER JOIN album_collection
    ON album.album_id=album_collection.album_id
    INNER JOIN collection ON album_collection.collection_id=collection.collection_id INNER JOIN member ON collection.member_id=member.member_id WHERE member.member_id =?`;
    
  
    db.query(result, [memberid], (err, rows)=>{
      if(err) throw err;
      res.render("mycollections",{rows})
    });
  });
  
  router.get("/deletecollection", checkLogin,(req,res) =>{
  
    let memeberid = req.session.uid;
  
    let result = `SELECT * FROM collection WHERE member_id = ?`;
  
    db.query(result,[memeberid], (err,rows) =>{
      if(err) throw err;
      res.render("deletecollection", {rows});
    });
  });
  
  router.post("/deletecollection", checkLogin, (req,res) =>{
    
    let userCollection = req.body.userc;
  
    console.log(userCollection);
    let deleterecord = `DELETE FROM member_collection WHERE member_collection_id = ?`
  
    db.query(deleterecord,[userCollection], (err, rows) =>{
      if(err) throw err;
      res.redirect("/dashboard");
    });
  })

router.get("/addcollection", checkLogin, (req,res) =>{

    let album = `SELECT * FROM album INNER JOIN artist_album ON album.album_id=artist_album.album_id INNER JOIN artist ON artist_album.artist_id=artist.artist_id`;
  
    db.query(album, (err, album) =>{
      if(err) throw err;
      res.render("addcollection", {album});
    });
  });


  
  router.post("/addcollection", (req,res) =>{
  
    let title = req.body.collectiontitle;
    let user = req.session.uid;
  
    console.log(req.body)
    
    let vinylIDCount = []
    for (key in req.body){
      if(key.startsWith("Vinyl")) {
        vinylIDCount.push(req.body[key])
      }
    }
  console.log(vinylIDCount);
  
    let update = "INSERT INTO collection (title, member_id) VALUES (?,?)"
  
    db.query(update, [title,user], (err,rows) =>{
      if(err) throw err;
  
      const collectionid = rows.insertId
  
      vinylIDCount.forEach((record) => {
        let insert = "INSERT INTO album_collection (collection_id, album_id) VALUES(?,?)"
        db.query(insert,[collectionid, record], (err, rows) =>{
          if(err) throw err;
        })
      });
  
      res.redirect("/dashboard");
    });
  });


  router.get("/addcollection2", checkLogin, (req,res) =>{

    let album = `SELECT * FROM album INNER JOIN artist_album ON album.album_id=artist_album.album_id INNER JOIN artist ON artist_album.artist_id=artist.artist_id`;
  
    db.query(album, (err, album) =>{
      if(err) throw err;
      res.render("addcollection2", {album});
    });
  });


  module.exports = router;