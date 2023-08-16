import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
require ('dotenv').config();
import { UserModel } from "./database/User";
import bcrypt from "bcryptjs";

import passport from "passport";


const dummyapp = express();


// middlewares
dummyapp.use(express.json());
dummyapp.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
dummyapp.use(express.urlencoded({ extended: false }));

dummyapp.get("/", (req, res) => res.json("Setup Success"));

dummyapp.use(passport.initialize());
dummyapp.use(passport.session());


// local strategy
passport.use('local', new LocalStrategy(
    async function (username, password, done) {
        const checkUserByUsername = await UserModel.findOne({username: username});
       const doesPasswordMatch = await bcrypt.compare(password, checkUserByUsername.password)
       UserModel.findOne({ username: username }).then((user)=>{
            if (!user) { return done(null, false, { message: "incorrect username" }); }
            if (!doesPasswordMatch) { return done(null, false, { message: "incorrect password" }); }
            else{
                return done(null, user,);
            }    
       }).catch((err)=>{
        if (err) { return done(err); }
       })
    }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user);
    });
});


//Signup or Register Route
dummyapp.post('/register',async(req, res, done)=>{
    const bcryptSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, bcryptSalt);
    await UserModel.findOne({username:req.body.username}).then((user)=>{
        if(user) {
            res.send("User already exists with this username");
        }    
        else {
            UserModel.create({username: req.body.username, password:hashedPassword}).then((user)=>{
                console.log("User registered successfully");
                res.send(user);
                done(null,user);
                
            }).catch((err)=>{if(err) return done(null, false);})
        }
    } )
    return hashedPassword;
}
);


//Login route
dummyapp.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        console.log("User logged in succesfully");
        res.json(req.user);
        
    });



    
// Forgot Password Route
dummyapp.post('/forgot', (req, res) => {
    UserModel.findOne({username:req.body.username}).then((user)=>{
    if (!user) {
            res.send("User not found");
    }
    }).catch((err)=> console.log("error"));
  
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'jhasanatan1997@gmail.com',
          pass: 'bjljkukwjjqpdrrb'
        }
      });
    

    const mailOptions = {
        from: 'user@gmail.com',
        to: req.body.username,
        subject: 'Password Reset',
        text: 'Click the link to reset your password: http://localhost:4000/reset'
    };

    console.log("sending email now");
    // console.log(process.env.myUsername);
    // console.log(process.env.myPassword);
    transporter.sendMail(mailOptions).then(()=>res.json("Password reset email sent")).catch((error)=>console.log("email not sent " + error));
  });


//opening port

dummyapp.listen(4000, () => console.log("Server is running "));



// Connecting to Database.......

async function dbconnection() {

    return mongoose
    .connect(process.env.MONGO_URL)
    
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((err) => {
        console.error(`Database connection failure due to ${err}`);
    });
}

dbconnection();

