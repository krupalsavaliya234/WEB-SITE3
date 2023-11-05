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


mongoose.connect('mongodb://127.0.0.1:27017/DataBase3')
.then((db)=>{
   console.log('mongoose connect ')

})
.catch((err)=>{
   console.log(err)
})

const userSchema=new mongoose.Schema({
    email:String,
    password:String
})

userSchema.plugin(passportLocalMongoose)





// const encryptionKey =process.env.secret;    
// userSchema.plugin(encrypt, {
    //   secret: encryptionKey,
    //   encryptedFields: ['password'] /
// });


// using md5

const User=new mongoose.model("User",userSchema)
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



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

app.get('/secrets',(req,res)=>
{
    if(req.isAuthenticated())
    {
    res.render("secrets")
    }
    else{
        res.redirect("login")   
    }

})

app.post('/register',(req,res)=>{

// in passport js use rugister

   User.register({username:req.body.username},req.body.password,function(err,user)  {
    if(err)
    {
        console.log(err)
        res.redirect("/register")
    }
    else{
        passport.authenticate("local")(req,res ,function(){
            res.redirect('/secrets')
        })
    }
   })
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
  app.get('/logout',(req,res)=>
  {
    req.logout()
    res.redirect( '/')

  })

app.listen(3002,()=>{
    console.log("app listen")
})