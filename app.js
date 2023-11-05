// password secreat 
            // const encrypt= require("mongoose-encryption")
            // const md5=require('md5')
            // const bcrypt=require("b")
// jshint esversion:6
const express=require('express')
const app=  express()
const ejs=require('ejs')
const bodyParser=require("body-parser")
const mongoose=require('mongoose')
require('dotenv').config()
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate")


app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
 

app.use(session(
    {
        secret:"i love this girl",
        resave:false,
        saveUninitialized:false
    }
))
app.use(passport.initialize())
app.use(passport.session())


mongoose.connect('mongodb://127.0.0.1:27017/DataBase01')
.then((db)=>{
   console.log('mongoose connect ')

})
.catch((err)=>{
   console.log(err)
})

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    googleId:String,
    secret:String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)




// const encryptionKey =process.env.secret;    
// userSchema.plugin(encrypt, {
    //   secret: encryptionKey,
    //   encryptedFields: ['password'] /
// });

 
// using md5

const User=new mongoose.model("User",userSchema)


 
passport.use(User.createStrategy())
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


    passport.use(new GoogleStrategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3002/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v1/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile)
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
        });
    }
    )); 


app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/login',(req,res)=>
{
    res.render('login')
})
app.get('/register',(req,res)=>{
    res.render('register')
})


app.post('/register',(req,res)=>{

// in passport js use rugister

User.register({ username: req.body.username }, req.body.password, function(err, user) {
    if (err) {
        console.log(err);
        res.redirect("/register");
    } else {
        passport.authenticate("local")(req, res, function() {
            res.redirect('/secrets');
        });
    }
});
}




//  const newUser=new User({
//      email:req.body.username,
//      password:req.body.password
//  })
//  newUser.save()
//   .then(() => {
//     // Handle the successful save
//     res.render("secrets")
//   })
//   .catch(err => {
//     // Handle the error
//     console.log(err)
//   });
// }
)
app.post('/login', async (req, res) => {

    const user=new User({
        username:req.body.username,
        password:req.body.username
    })
     req.login(user,function(err,user)
     {
        if(err){
            console.log(err)
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
            })
        }
     })   



    // const username = req.body.username;
    
    // const password =req.body.password ;
    // const user = await User.findOne({ email: username });
  
    // if (user) {
    //     if(password==user.password)
    //     {

    //         res.render('secrets'); // Render the "secrets" page
    //     }
    //     else
    //     {
    //     // alert("check your password")
    //         res.redirect('/login'); // Redirect to login page on error
    //     }
    // } else {
    //   console.log("User not found");
    //   res.redirect('/login'); // Redirect to login page on error

    // }
  });
  app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/login');
    });
});


app.get('/auth/google', passport.authenticate('google', { scope: ["profile"] }));


app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
  app.get("/secrets", async (req, res) => {
    try {
      const foundUsers = await User.find({ "secret": { $ne: null } }).exec();
  
      if (foundUsers) {
        console.log(foundUsers)
        const usersWithSecrets = foundUsers; // Assign the result to a variable
        res.render("secrets", { usersWithSecrets });
      } else {
        // Handle the case where foundUsers is falsy (e.g., an empty array)
        // You might want to provide a default value or handle it accordingly
      }
    } catch (err) {
      console.error(err);
      // Handle the error
    }
  });
  app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  });
  




app.post("/submit", async (req, res) => {
    const submittedSecret = req.body.secret;
    // console.log(req.user._id)
    // Make sure the user is authenticated
    if (req.isAuthenticated()) {
        try {
            // Find the user by their ID (req.user._id)
            const foundUser = await User.findById(req.user._id);
            
            if (foundUser) {
                foundUser.secret = submittedSecret;

                // Save the updated user's secret
                await foundUser.save();
                res.redirect("/secrets");
            } else {
                console.log("User not found");
                res.redirect("/login");
            }
        } catch (err) {
            console.log(err);
            res.redirect("/login");
        }
    } else {
        res.redirect("/login");
    }
});



app.listen(3002,()=>{
    console.log("app listen")
})