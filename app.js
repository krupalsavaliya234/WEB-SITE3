// password secreat 
            // const encrypt= require("mongoose-encryption")
                const md5=require('md5')
//jshint esversion:6
const express=require('express')
const app=  express()
const ejs=require('ejs')
const bodyParser=require("body-parser")
const mongoose=require('mongoose')
require('dotenv').config()
const bcrypt=require("")



app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
 

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




// const encryptionKey =process.env.secret;    
// userSchema.plugin(encrypt, {
//   secret: encryptionKey,
//   encryptedFields: ['password'] /
// });


// using md5

const User=new mongoose.model("User",userSchema)

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
 const newUser=new User({
     email:req.body.username,
     password:md5(req.body.password)
 })
 newUser.save()
  .then(() => {
    // Handle the successful save
    res.render("secrets")
  })
  .catch(err => {
    // Handle the error
    console.log(err)
  });
}
)
app.post('/login', async (req, res) => {
    const username = req.body.username;
    
    const password =md5( req.body.password);
    const user = await User.findOne({ email: username });
  
    if (user) {
        if(password==user.password)
        {

            res.render('secrets'); // Render the "secrets" page
        }
        else
        {
        // alert("check your password")
            res.redirect('/login'); // Redirect to login page on error
        }
    } else {
      console.log("User not found");
      res.redirect('/login'); // Redirect to login page on error

    }
  });

app.listen(3002,()=>{
    console.log("app listen")
})