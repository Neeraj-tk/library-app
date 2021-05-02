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



app.get("/",function(req,res){
    res.render("welcome");
});

app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup",function(req,res){
const newUser=new User({username:req.body.username,email:req.body.email,password:req.body.password});
newUser.save();
});

app.post("/",function(req,res){
    const name=req.body.username;
    User.find({username:name},function(err,user){
       if(!user)
       {
           if(req.body.password===user.password)
           {
               res.render("/home");
           }
           else
           {
               res.render("/",{message:"Incorrect Password"});
           }
       }
       else
       {
           res.render("/",{message:"Incorrect username"});
       }
    });
});

app.listen(3000,function(){
    console.log("server started");
});
//https://images.app.goo.gl/81DKxV9otHQth87z9