const express = require("express");
const app = express();
const path = require("path");
const PORT = "3000";
const bodyParser = require("body-parser");

const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const checkLogin = require("./middleware/authen");
const routes = require('./routes/');
const db = require('./routes/connection');
const band = require('./routes/band');
const genre = require('./routes/genre')
const album = require('./routes/album');
const collection = require('./routes/collections');
const albumReview = require('./routes/albumReview');
const members = require('./routes/members');




app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

//app.use('/', routes);
//app.use('/band', band)

const oneHour = 1000 * 60 * 60 * 1;

app.use(cookieParser());

app.use(sessions({
   secret: "myshows14385899",
   saveUninitialized: true,
   cookie: { maxAge: oneHour },
   resave: false
}));

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "media")));
app.use(express.static(path.join(__dirname, "styles")));
app.use(bodyParser.urlencoded({ extended: true }));


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

app.get("/dashboard",checkLogin, (req, res) => {
  res.render("dashboard");
});



app.use('/', routes,genre,band,album,collection, albumReview, members);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
