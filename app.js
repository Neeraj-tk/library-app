const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");

const app=express();

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));



app.get("/",function(req,res){
   // res.sendFile(__dirname+"/views/welcome.ejs");
    res.render("welcome");
});


app.listen(3000,function(){
    console.log("server started");
});
//https://images.app.goo.gl/81DKxV9otHQth87z9