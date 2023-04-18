const express = require("express");
const app = express();
const path = require("path");
const PORT = "3000";
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

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
  database: "stax",
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

app.get("/fav", (req, res) => {
  let sessionobj = req.session;
  if(sessionobj.uid){
  //let title = "home";
  res.send("Access Granted");
  console.log(sessionobj.uid);
  }else{
    res.send("Denied");
  }
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
      res.send("<code>Access Denied</code>");
    }
  });

});

app.get("/contact", (req, res) => {
  if(req.session.uid){
  res.render("contact");
  }else{ 
    res.send("Please sign in")
  }
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
    console.log(genreList)
    res.render("genre", { genreList });
  });
  
  

});

app.post("/genre", (req, res) =>{
  const {genre} = req.body;
  console.log(genre);
  res.render("/genre");
});

app.get("/addalbumreview", (req, res) =>{

  let album = `SELECT * FROM album`;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("addalbumreview", { albumInfo });
    console.log(albumInfo[0]);
  });

});

app.post("/addalbumreview", (req, res) =>{

  let memberid = req.session.uid;
  let artist_album_id = req.body.bandname;
  let review = req.body.review;
  let update = "INSERT INTO user_review( member_id, artist_album_id, review) VALUES (? , ? ,?)";
  db.query(update, [memberid, artist_album_id, review], (err, rows) =>{
    if(err) throw err;
    res.redirect("/");
  });
})


app.get("/signUp", (req, res) => {
  res.render("signup");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
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
  let album = `SELECT * FROM album`;

  db.query(album, (err, albumInfo) => {
    if (err) throw err;
    res.render("albums", { albumInfo });
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

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
