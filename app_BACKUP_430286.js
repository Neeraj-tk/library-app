const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/librarydb");

const userSchema= new mongoose.Schema({username:String,
password:String,
email:String});

const User=mongoose.model("User",userSchema);

const app=express();

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

message="";

app.get("/",function(req,res){
    res.render("welcome");
});

app.post("/",function(req,res){
    const name=req.body.username;
    User.findOne({username:name},function(err,user){
       if(user)
       {
           console.log(req.body.password);
           console.log(user.username);
           if(req.body.password===user.password)
           {
               res.render("home");
           }
           else
           {
               res.render("welcome",{message:"Incorrect Password. Try Again."});
           }
       }
       else
       {
           res.render("welcome",{message:"Incorrect username. Try Again."});
       }
    });
});


<<<<<<< HEAD
=======
app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup",function(req,res){
const newUser=new User({username:req.body.username,email:req.body.email,password:req.body.password});
newUser.save();
res.redirect("/");
});
>>>>>>> 6cd0fa28dfc7c26652ff3656537f26716c7d73c0

app.listen(3000,function(){
    console.log("server started");
});
//https://images.app.goo.gl/81DKxV9otHQth87z9