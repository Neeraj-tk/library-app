const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const axios=require("axios");

mongoose.connect("mongodb://localhost:27017/librarydb");

const userSchema= new mongoose.Schema({username:String,
password:String,
email:String});

const User=mongoose.model("User",userSchema);

const app=express();

app.set('view engine','ejs');
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

message="";
user="";
searchResult=[];

app.get("/",function(req,res){
    res.render("welcome");
});

app.post("/",function(req,res){
    const name=req.body.username;
    User.findOne({username:name},function(err,user){
       if(user)
       {
           if(req.body.password===user.password)
           {
               res.redirect("/home/"+user.username);
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


app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup",function(req,res){
   const newUser=new User({username:req.body.username,email:req.body.email,password:req.body.password});
   newUser.save();
   res.redirect("/");
});

app.get("/home/:username",function(req,res){
    // User.findOne({username:req.params.username},function(err,user){
    //     if(user)
    //     {
    //         var favourites=user.favourites;
    //         var toRead=user.toRead;
    //     }
    //     else
    //     {
    //         console.log("no user found in /home");
    //     }
    // });
        favArray=[];
        toReadArray=[];
    // favourites.forEach(function(element){
    //     https.get("https://www.googleapis.com/books/v1/volumes/"+element,function(res){
    //         res.on("data",function(data){
    //         var volume=JSON.parse(data);
    //         const obj={title:volume.volumeInfo.title,
    //         subtitle:volume.volumeInfo.subtitle,
    //         authors:volume.volumeInfo.authors,
    //         rating:volume.volumeInfo.averageRating,
    //         image:volume.volumeInfo.imageLinks.thumbnail};
    //         });
    //         favArray.append(obj);
    //     });
    // });
    res.render("home",{username:req.params.username,favourites:favArray,toRead:toReadArray});
});

app.post("/home",function(req,res){
    const search=req.body.search; 
    axios.get('https://www.googleapis.com/books/v1/volumes?q='+search+'&maxResults=1')
    .then(response => {
    const data=response.data;
    searchResult=data.items;
    user=req.body.username;
    res.redirect("/search");
  })
  .catch(error => {
    console.log(error);
  });
});

app.get("/search", function(req,res){
    
    console.log("AAAAAAAAAAAAAaa");
    res.render("search",{username:user, result:searchResult});
})

app.listen(3000,function(){
    console.log("server started");
});