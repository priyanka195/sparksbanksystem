//jshint esversion:8
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
let alert = require('alert'); 
const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/bankDB",{ useNewUrlParser: true , useUnifiedTopology: true })
.then(()=>{ return console.log("Connected to Database..");
 })
.catch(err => console.log("Could not connect",err))


const customerSchema = new mongoose.Schema({
    name: String,
    email: String,
    address:String,
    currentBalance: Number
});

const Customer = new mongoose.model("Customer",customerSchema);


app.get("/",function(req,res){
    res.render("homePage");
});

app.get('/customer', (req, res) => {
    Customer.find({},function(err,customers){
        res.render("customer",{
            list:customers
            
        });
    });
    
});

app.post("/customer",(req,res)=>{
    
    Customer.findOne({email:"piyushshah26@gmail.com"},function(err,customer){
        if(err){
            res.json("Invalid!!");
        }
        else
        {
            let amount=parseInt(req.body.amount);

            if(amount > customer.currentBalance){
                res.send("\
                <div style=\"display: flex;justify-content: center;=\">\
                <img src=\"funds.png\">\
                </div>\"");        
            }
            else{
                customer.currentBalance -= amount;
                customer.save(function(err){
                    console.log(err);
                });

            Customer.findOne({email:req.body.email},function(err,customers){
                if(err || customers === null){
                    res.send("Account not found :( ");
                }
                else{

                console.log(customers);
                
                let old=customers.currentBalance;
                let updated=old + amount;

                customers.currentBalance = updated;
                alert("Sender: "+ customer.name +"\nRecipient: "+ customers.name + "\nTransferred Amount: "+ amount);
                customers.save(function(err){
                    console.log(err);
                });
                res.redirect("/customer");
            }
            });
        
        }  
        }
    });
})




app.listen(3000,function(){
    console.log("Server started on port 3000");
});