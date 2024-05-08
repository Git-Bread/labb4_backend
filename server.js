const express = require("express");
const app = express();

//mongo db and dotenv stuff
require("dotenv").config({path: "stuff.env"});

//opens to cross origin
const cors = require("cors");
app.use(cors());

//hashing
const bcrypt = require("bcrypt");

//JWT
const jwt = require("jsonwebtoken");

//express middleware to convert json to javascript objects, neat
app.use(express.json());

//prefered port or 27017
const port = process.env.port | 27017;

//salt generation for hashing, uses env file but converts it to number since all env files are string
const salt = Number(process.env.salt);

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

//hashes password before adding it, have no clue why it says await does nothing when it clearly does something
loginSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, salt); 
    console.log(await bcrypt.hash(this.password, salt));
    next()
})

//console log
let apiPort = 3000;
app.listen(apiPort, () => {console.log("listening")});

//model
const login = mongoose.model("login", loginSchema);

//Login
app.post("/login", async (req, res) => {
    //validate for input errors
    let val = await validate(req, 1)
    if (val != "") {
        console.log(val);
        res.status(400).send({error: val});
        return
    }

    //checks for correct information and returns auth token
    val = await loginValidation(req);
    if (val) {
        const payload = {username: req.username};
        const token = jwt.sign(payload, process.env.STANDARD_TOKEN, {expiresIn: '2h' })
        console.log(token);
        res.status(200).send({message: "Confirmed Login", token: token});
    }
    else {
        res.status(400).send({error: ["Wrong password please try again"]});
    }
})

//register acount
app.post("/register", async (req, res) => {
    //runs an extra function, this might be uneccesary
    let test = await register(req);
    if(test) {
        res.status(400).send({error: test});
        return
    }
    res.status(200).send({message: "Account registered"});
})

//validates password
async function loginValidation(obj) {
    let uname = obj.body.username;
    let password = obj.body.password;
    let user = await login.find({username: uname});

    //hash compare
    try {
        if (await bcrypt.compare(password, user[0].password)) {
            console.log("Correct password for user: " + uname);
            return true;
        }
        else {
            return false
        }   
    } catch (error) {
        console.log("it broke");
        return false;
    }
}

//registration
async function register(obj){
    console.log(obj.body);
    let val = await validate(obj, 2)
    if(val != "") {
        return val;
    }

    //new schema object
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
    //holds all errors for comprehensive output
    let errors = [];

    //checks for standard empty
    if (!obj.body.username) {
        errors.push("No username")
    }
    if (!obj.body.password) {
        errors.push("No password")
    }

    let logins = await login.find();

    //diffrent validation modes for login/register, more efficient with an if but this is more expandable, and a login system will be really easy to re-use for future projects
    switch (mode) {
        case 1:
            //checks if user exists
            let match = false;
            for (let index = 0; index < logins.length; index++) {
                if (obj.body.username == logins[index].username) {
                    match = true;
                }
            }
            if (!match) {
                errors.push("invalid username")
            }
            if (errors[0] != "") {
                return errors;   
            }
        
        case 2:
            //compares usernames to check for duplicate, sort of bad praxis due to the whole "you know an account exists"
            for (let index = 0; index < logins.length; index++) {
                if (obj.body.username == logins[index].username) {
                    errors.push("Invalid username")
                }  
            }
 
            //some lenght and "exist" checks
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
            //regex for email format, makes sure it is two parts and an @ aswell as an 2-4 ending such as .com
            const regex = /^[a-zA-Z0–9._-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,4}$/;
            let valid = regex.test(obj.body.email);
            if (!valid) {
                errors.push("Invalid email")
            }
            
            //another kind of bad praxis, but cant have duplicate emails so whats to do about it
            for (let index = 0; index < logins.length; index++) {
                if (obj.body.email == logins[index].email) {
                    errors.push("That email is unavailable")
                }  
            }
                        
            //makes sure password contains a capital letter, one numbers and atleast 6 symbols
            const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
            valid = passRegex.test(obj.body.password)
            if (!valid) {
                errors.push("password invalid, it needs to be atleast six symbols, one uppercase letter, two numbers")
            }

            //sends all the errors back
            if (errors[0] != "") {
                return errors;   
            }
        default:
            break;
    }
    return false
}

//debug for testing auth, outprints all data in database provided proper token is supplied
app.get("/secret", async (req, res) => {
    if(auth(req)){
        return res.status(200).send(true);
    };
    return res.status(403).send({boundry: "ACCESS DENIED"});
})


//DEBUG functions, comment out when done, if they are not commented out then it might become a dumpsterfire
/*
//gets all content
app.get("/debug1", async (req, res) => {
    res.send(await login.find());
})
//clears
app.delete("/debug2", async (req, res) => {
    res.send(await login.deleteMany ({}));
})
//printtts
app.get("/debug1", async (req, res) => {
    res.send(await login.find());
})
*/



app.post("/data", async (req, res) => {
    console.log(req.body);
    if (auth(req)) {
        res.send(await login.find({username: req.body.username}));   
    }
})

//token auth, in try catch so server dosent explode if invalid token is sent
function auth(req) {
    try {
        const head = req.headers['authorization'];
        const token = head && head.split(' ')[1]; //gets first space or Bearer TOKEN
        if (token == null || token == undefined) {return false}
        if(jwt.verify(token, process.env.STANDARD_TOKEN)) {
            return true;
        }
        return false;   
    } catch (error) {
        return false;
    }
}