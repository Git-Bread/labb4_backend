const express = require("express");
const app = express();

//mongo db and dotenv stuff
const {MongoClient} = require("mongodb");
require("dotenv").config({path: "stuff.env"});

//opens to cross origin
const cors = require("cors");
app.use(cors());

//express middleware to convert json to javascript objects, neat
app.use(express.json());

//prefered port or 27017
const port = process.env.port | 27017;

//database connection
const url = process.env.DB_HOST + ":" + port + "/lab4";

//mongoose for schema and stuff
const mongoose = require("mongoose");
mongoose
    .connect(url)
    .then(() => {console.log("connected!")})
    .catch((error) => console.log("ERROR: " + error));

//schema
const loginSchema = mongoose.Schema({
    username: String,
    password: String,
    creationDate: Date,
    name: String,
    email: String
});

//console log
let apiPort = 3000;
app.listen(apiPort, () => {console.log("listening")});

//model
const login = mongoose.model("login", loginSchema);

//Login
app.post("/login", async (req, res) => {
    let val = await validate(req, 1)
    if (val != "") {
        res.send(val);
        return
    }
    val = await loginValidation(req);
    res.send({message: "Confirmed Login"});
})

app.post("/register", async (req, res) => {
    let test = await register(req);
    if(test) {
        res.send(test);
        return
    }
    res.send({message: "account registered"});
})

async function loginValidation(obj) {
    let uname = obj.body.username;
    let password = obj.body.password;
    let user = await login.find({username: uname});
    if (password == user[0].password) {
        return true;
    }
    else {
        return false
    }
}

async function register(obj){
    let val = await validate(obj, 2)
    if(val != "") {
        return val;
    }
    let newUser = new login({
        username: obj.body.username,
        password: obj.body.password,
        creationDate: new Date(),
        name: obj.body.name,
        email: obj.body.email
    });
    newUser.save();
    return
}

//comprehensive validation
async function validate(obj, mode) {
    let errors = [];
    if (!obj.body.username) {
        errors.push("No username")
    }
    if (!obj.body.password) {
        errors.push("No password")
    }
    switch (mode) {
        case 1:
            if (errors[0] != "") {
                return errors;   
            }
        
        case 2:
            let logins = await login.find();
            for (let index = 0; index < logins.length; index++) {
                if (obj.body.username == logins[index].username) {
                    errors.push("That username is already in use")
                }  
            }
            if (!obj.body.name) {
                errors.push("No name")
            }
            if (obj.body.username.lenght > 12) {
                errors.push("To long username")
            }
            if (obj.body.name.lenght > 30) {
                errors.push("To long name")
            }
            if (!obj.body.email) {
                errors.push("No email")
            }
            const regex = /^[a-zA-Z0–9._-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,4}$/;
            let valid = regex.test(obj.body.email);
            if (!valid) {
                errors.push("Invalid email")
            }
            for (let index = 0; index < logins.length; index++) {
                if (obj.body.email == logins[index].email) {
                    errors.push("That email is already in use")
                }  
            }
            const passRegex = /^(?=.*[A-Z])(?=.*[0-9].*[0-9]).{6}$/
            valid = passRegex.test(obj.body.password)
            if (!valid) {
                errors.push("password invalid, it needs to be atleast six symbols, one uppercase letter, two numbers")
            }

            if (errors[0] != "") {
                return errors;   
            }
        default:
            break;
    }
    return false
}

//DEBUG functions

//gets all content
app.get("/debug1", async (req, res) => {
    res.send(await login.find());
})
//clears
app.delete("/debug2", async (req, res) => {
    res.send(await login.deleteMany ({}));
})
