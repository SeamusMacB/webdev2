const express = require('express');
const router = express.Router();
const db = require('./connection');

router.get("/members", (req, res) => {
    if(req.session.uid){
      res.render("dashboard")
    }else{
      res.render("members");
    }
  });
  
  router.post("/members", (req,res) =>{
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


router.get("/signUp", (req, res) => {
    res.render("signup");
  });

  router.post("/signUp",(req,res) =>{
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

router.get("/logout", (req,res) =>{

    req.session.destroy();
    res.redirect("/");
    
    });

  module.exports = router;