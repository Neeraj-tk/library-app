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
email:String,
fav:[String]});
userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
app.get("/home",function(req,res){  
  if(req.isAuthenticated())
    {
      User.findById(req.user.id,function(err,foundUser){
        if(err)
        {
          console.log(err);
        }
        else
        {
          var favArray=[];
          if(foundUser.fav.length!=0)
          {
            for(var i=0;i<foundUser.fav.length;i++){
              axios.get("https://www.googleapis.com/books/v1/volumes/"+foundUser.fav[i])
              .then(response => {
              favArray.push(response.data);
              if(favArray.length===foundUser.fav.length)
              {
                res.render("home",{username:foundUser.username,favourites:favArray});
              }
            })
            .catch(error => {
              console.log(error);
            });
          }
          }
          else
          {
            res.render("home",{username:foundUser.username,favourites:favArray});
          }
        }
      });
    }
    else
    {
      res.redirect("/");
    }
});

app.post("/home",function(req,res){
    if(req.isAuthenticated())
    {
      const search=req.body.search;
      res.redirect("/search/"+search); 
    }
    else
    {
      res.redirect("/");
    }
});

app.get("/search/:search", function(req,res){
  if(req.isAuthenticated())
  {
    const search=req.params.search;
    axios.get('https://www.googleapis.com/books/v1/volumes?q='+search+'&maxResults=10')
    .then(response => {
    const data=response.data;
    res.render("search",{result:data.items,fav:req.user.fav});
  })
  .catch(error => {
    console.log(error);
  });
  }
  else
  {
    res.redirect("/");
  }
});

app.post("/search", function(req, res){
  if(req.body.add===1)
  {
    User.updateOne({_id:req.user.id},{$push:{fav:req.body.id}},function(err){
      if(err)
      {
        console.log(err);
      }
    });
  }
  else
  {
    User.updateOne({_id:req.user.id},{$pull:{fav:req.body.id}},function(err){
      if(err)
      {
        console.log(err);
      }
    });
  }
});

app.listen(3000,function(){
    console.log("server started");
});