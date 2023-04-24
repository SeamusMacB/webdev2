const express = require("express");
const app = express();
const path = require("path");
const PORT = "3000";
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const checkLogin = require("./middleware/authen");


const oneHour = 1000 * 60 * 60 * 1;

app.use(cookieParser());

app.use(sessions({
   secret: "myshows14385899",
   saveUninitialized: true,
   cookie: { maxAge: oneHour },
   resave: false
}));

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

let read = "SELECT * FROM artist";

db.query(read, (err, result) => {
  if (err) throw err;
  // console.table(result);
});

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "media")));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  let title = "home";
  res.render("home");
});

app.get("/band", (req, res) => {
  
    let artist = `SELECT * FROM artist`;
    db.query(artist, (err, artistList) => {
    if(err) throw err;
    res.render("band", { artistList });
  });
});


app.get("/banddetail", (req, res) =>{

     let artist = `SELECT * FROM artist WHERE artist_id = ?`

      let bandid= req.query.artist_id

    db.query(artist,[bandid], (err,rows) =>{
      //console.table(rows)
      res.render("banddetail", {rows});
    });
});

app.get("/genrebands", (req,res) =>{
   
  let genre =`SELECT * FROM album WHERE genre_id = ?`
   
  let genreid = req.query.genre_id;

  db.query(genre,[genreid], (err,rows) =>{
    console.log(rows);
    res.render("genrebands", {rows});
    });
  });

app.get("/fav", checkLogin, (req, res) => {
  
  res.send("Access Granted");
  
  
});

app.get("/members", (req, res) => {
  if(req.session.uid){
    res.render("dashboard")
  }else{
    res.render("members");
  }
});

app.post("/members", (req,res) =>{
  let user = req.body.username;
  let password = req.body.password;

  let checkuser = "SELECT * FROM member WHERE user_name = ? AND password = ? ";
  db.query(checkuser, [user, password], (err, rows) =>{
    if(err) throw err;
    let numrows = rows.length;
    if(numrows > 0 ){
      
      req.session.uid = rows[0].member_id;
      res.redirect("/dashboard");
    }else{
      res.render("failedlogin")
    }
  });

});

app.get("/contact", checkLogin, (req, res) => {
    res.render("contact");
  });

app.post("/contact", (req, res) => {
  
  const {email, message} = req.body;
  console.log(email);
  console.log(message);

  let userdata = req.body;

  res.render("contact", { sentdata: userdata });
  });

app.get("/genre", (req, res) =>{

  let genre = `SELECT * FROM genre`;
  db.query(genre, (err, genreList) =>{
    if(err) throw err;
    res.render("genre", { genreList });
  });
  
  

});



app.get("/addalbumreview", (req, res) =>{

  let album = `SELECT * FROM album INNER JOIN artist_album ON album.album_id=artist_album.album_id `;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("addalbumreview", { albumInfo });
    
  });

});

app.post("/addalbumreview", (req, res) =>{

  let memberid = req.session.uid;
  let artist_album_id = req.body.bandname;
  let review = req.body.review;
  let update = "INSERT INTO user_review( member_id, artist_album_id, review) VALUES (? , ? , ?)";
  db.query(update, [memberid, artist_album_id, review], (err, rows) =>{
    if(err) throw err;
    res.redirect("/");
  });
})

app.get("/addcollection", (req,res) =>{

  let album = `SELECT * FROM album`;

  db.query(album, (err, album) =>{
    if(err) throw err;
    res.render("addcollection", {album});
  });
});

app.post("/addcollection", (req,res) =>{

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

app.get("/addcollectionreview", (req,res) =>{

  let collections = `SELECT * FROM member_collection`
  db.query(collections, (err, col) =>{
    if(err) throw err;
    res.render("addcollectionreview", {col} );
  
  }); 
})

app.post("/addcollectionreview", (req,res) =>{
  
  let memberid = req.session.uid;
  let collection = req.body.collectionname;
  let liked = req.body.liked

  let update = "INSERT INTO member_collection_review (member_id, collection_id, liked) VALUES (? , ?, ?)"
  db.query(update,[memberid,collection, liked],(err,rows)=>{
    if(err) throw err;
    res.redirect("/")
    
  })

});

app.get("/signUp", (req, res) => {
  res.render("signup");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/dashboard2", (req, res) => {
  res.render("dashboard2");
});

app.post("/signUp",(req,res) =>{
  let username = req.body.username;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let email = req.body.email;
  let password = req.body.password;

  let memberreg = "INSERT INTO member(user_name, first_name, last_name, email, password) VALUES ( ? , ? , ? , ? , ? )";
  db.query(memberreg, [username, firstname,lastname,email,password], (err, rows) =>{
      if(err) throw err;
      res.redirect("/");
  });
});


app.get("/albums", (req, res) => {
  let album = `SELECT * FROM album `;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("albums", { albumInfo });
  });
});

app.get("/myalbumreviews", (req,res) =>{

    let memberid = req.session.uid;

    let result = `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;
    db.query(result,[memberid], (err,rows) =>{
        if(err) throw err;
        
        res.render("myalbumreviews", {rows});
    });
   

  });


app.get("/reviews", (req, res) => {
  let album = `SELECT * FROM user_review`;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("reviews", { albumInfo });
  });
});

app.post('/reviews', (req, res) =>{

  let album = req.body.album_name;
  let album_review = req.body.album_review;

  let review = "INSERT INTO dummy_table (album, review) VALUES( ? , ? )";

  db.query(review,[album, album_review], (err, rows) =>{
    if(err) throw err;
    res.redirect("/"); 
    //res.send(`You have now added a review for <p>${album}</p> stating that : <p>${album_review} </p>`);
    })
 });

 
 app.get("/albumreview", (req, res) => {
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

app.get("/collectionreview", (req,res) =>{

  let colreviews = `SELECT album_1,album_title,collection_title FROM member_collection
  INNER JOIN album
  ON member_collection.album_1=album.album_id;
  SELECT album_2, album_title FROM member_collection
  INNER JOIN album
  ON member_collection.album_2=album.album_id;
  SELECT album_3, album_title FROM member_collection
  INNER JOIN album
  ON member_collection.album_3=album.album_id`

  db.query(colreviews, (err, row) =>{
    if(err) throw err;
    console.log(row)
    res.render("collectionreview", {row})
  });
});


app.get("/updatealbumreview",checkLogin, (req,res) =>{
  
  let memberid = req.session.uid;

  let result =  `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;

 
    db.query(result,[memberid], (err,reviews) =>{
        if(err) throw err;
        res.render("Updatealbumreview", {reviews});
    }); 
});

app.post("/updatealbumreview",(req,res) =>{

  let updatedrow = req.body.review;
  let updatereview = req.body.updatedReview;


  let update = `UPDATE user_review SET review = ? WHERE user_review_id = ?`

  db.query(update,[updatereview,updatedrow], (err,update) =>{
      if(err) throw err;
      res.redirect("/dashboard");
  });

});


app.get("/deletealbumreview", checkLogin, (req, res) =>{

  let memberid = req.session.uid;

  let result = `SELECT * FROM user_review INNER JOIN artist_album ON user_review.artist_album_id=artist_album.artist_album_id INNER JOIN album ON artist_album.album_id=album.album_id WHERE member_id = ?`;

  console.table(result);
  db.query(result, [memberid], (err,rows) =>{
    if(err) throw err; 
    res.render("deletealbumreview",{rows});
  });
 });

app.post("/deletealbumreview", (req,res) =>{

  let user_review = req.body.review
  console.log(user_review)
  let deleterecord = `DELETE FROM user_review WHERE user_review_id = ${user_review}`;

  db.query(deleterecord, (err, rows) =>{
    if(err) throw err;
    res.redirect("/dashboard");

  });
});

app.get("/mycollections", checkLogin, (req,res) =>{


  let memberid = req.session.uid;

  let result = `SELECT * FROM member_collection WHERE member_id = ?;SELECT * FROM member_collection INNER JOIN album ON member_collection.album_1=album.album_id WHERE member_id = ?`;
  console.log(result)
  console.table(result);

  db.query(result, [memberid, memberid], (err, rows)=>{
    if(err) throw err;
    res.render("mycollections",{rows})
  });
});

app.get("/deletecollection", checkLogin,(req,res) =>{

  let memeberid = req.session.uid;

  let result = `SELECT * FROM member_collection WHERE member_id = ?`;

  db.query(result,[memeberid], (err,rows) =>{
    if(err) throw err;
    res.render("deletecollection", {rows});
  });

 
});

app.post("/deletecollection", checkLogin, (req,res) =>{
  
  let userCollection = req.body.userc;

  console.log(userCollection);
  let deleterecord = `DELETE FROM member_collection WHERE member_collection_id = ?`

  db.query(deleterecord,[userCollection], (err, rows) =>{
    if(err) throw err;
    res.redirect("/dashboard");
  });



})



 app.get("/failedlogin", (req, res) =>{

  res.render("failedlogin")
 });


app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
