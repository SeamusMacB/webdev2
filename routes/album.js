const express = require('express');
const router = express.Router();
const db = require('./connection');

router.get("/albums", (req, res) => {
  let album = `SELECT * FROM album`;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("albums", { albumInfo });
  });
});

router.get("/addalbum", (req, res) => {
  let genre = `SELECT * FROM genre`;

  db.query(genre, (err, genre) => {
    if (err) throw err;
  });

  res.render("addalbum", { genre });
});

router.get("/myalbumreviews", (req, res) => {
  let memberid = req.session.uid;

  let result = `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;
  db.query(result, [memberid], (err, rows) => {
    if (err) throw err;

    res.render("myalbumreviews", { rows });
  });
});


module.exports = router;