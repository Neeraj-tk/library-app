const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const axios=require("axios");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const { Passport } = require("passport");

const app=express();

app.set('view engine','ejs');
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/librarydb",{ useNewUrlParser: true , useUnifiedTopology: true });

const userSchema= new mongoose.Schema({username:String,
password:String,
email:String});
userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

message="";
user="";
searchResult=[];

app.get("/",function(req,res){
    res.render("welcome");
});

app.post("/",function(req,res){
  const newUser=new User({username:req.body.username,password:req.body.password});
  req.login(newUser,function(err){
    if(err)
    {
      console.log(err);
      res.redirect("/");
    }
    else
    {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/home");
      }); 
    }
  })
});


app.get("/signup",function(req,res){
    res.render("signup");
});

app.post("/signup",function(req,res){
    User.register({username:req.body.username,email:req.body.email},req.body.password,function(err,user){
     if(err)
     {
       console.log(err);
       res.redirect("/signup");
     }
     else
     {
       passport.authenticate("local")(req,res,function(){
         res.redirect("/home");
       });
     }

   });
});
favArray=[];
        toReadArray=[];
app.get("/home",function(req,res){
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
    if(req.isAuthenticated())
    {
      User.findById(req.user.id,function(err,foundUser){
        if(err)
        {
          console.log(err);
        }
        else
        {
          res.render("home",{username:foundUser.username,favourites:favArray,toRead:toReadArray});
        }
      });
    }
    else
    {
      res.redirect("/");
    }
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
});

app.post("/home",function(req,res){
    const search=req.body.search; 
    axios.get('https://www.googleapis.com/books/v1/volumes?q='+search+'&maxResults=10')
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
    res.render("search",{ result:searchResult});
});

app.post("/search", function(req, res){
  console.log(req.body);
});

app.listen(3000,function(){
    console.log("server started");
});