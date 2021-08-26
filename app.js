const session = require("express-session");
var genuuid = require("uuid").v4
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const userdetails = require("./models/user");
const colorpdetails = require("./models/colorps");
const express = require("express")
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(session({
    name: "SessionCookie",
    genid: function(req) {
        console.log('session id created');
        return genuuid();
    }, 
    secret: "djbfkjdhfuefhfhdkbcf",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}))
app.set("view engine", "ejs")

const dbURI =  "mongodb+srv://noprofilepicguy:science26223@backend.bafvo.mongodb.net/colorPalleteDB?retryWrites=true&w=majority"
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        app.listen(3000)
        console.log("Listening on port 3000")
    })
    .catch((err) => console.log(err));


app.get("/", (req, res)=>{
    res.send("Om namo narayanaya namaha")
})

app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", (req, res)=>{
    userdetails.findOne({username: req.body.username}, (err, data)=>{
        if(err){
            console.log(err)
        } else {
            if(data){
                bcrypt.compare(req.body.password, data.password)
                    .then(result => {
                        if(result){
                            req.session.userid = data._id
                            console.log(data._id)
                            console.log(req.session.userid)
                            res.redirect("/home")
                        } else {
                            res.send("Incorrect password")
                        }
                    })
            } else {
                res.send("User not found")
            }

        }
    })
})

app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", (req, res)=>{
    bcrypt.hash(req.body.password, 10)
                        .then(hash => {
                            let user = new userdetails({
                                username: req.body.username,
                                password: hash
                            })
                            user.save()
                                .then(result => {
                                    console.log(result)
                                    res.redirect("/login")
                                })
                                .catch(err => console.log(err))})
                        .catch(err => console.log(err))
})

app.get("/home", (req, res)=>{
    if(req.session.userid){
        console.log("gethome")
        console.log(req.session.userid)
        let colorplist;
        userdetails.findOne({_id: req.session.userid}, (err, data)=>{
            if(err){
                console.log(err)
            } else {
                colorplist = data.colorps
                console.log("else")
                console.log(data.colorps)
                console.log("out")
                console.log(colorplist)
                res.render("home", {colorlist: colorplist})
            }
        })
    } else {
        res.redirect("/login")
    }
})

app.get("/whiteboard", (req, res)=>{
    if(req.session.userid){
        res.render("whiteboard")
    } else {
        res.redirect("/login")
    }
})

app.post("/colorpalAPI", (req, res)=>{
    let colorpal = new colorpdetails({
        creator: req.session.userid,
        colors: req.body.colors
    })
    colorpal.save()
        .then(result => {
            console.log(req.session.userid)
            userdetails.findOne({_id: req.session.userid}, (err,data)=>{
                if(err){
                    console.log(err)
                } else {
                    console.log(data)
                    console.log(data.colorps)
                    data.colorps.push(colorpal._id)
                    data.save()
                        .then(result => {
                            res.redirect("/home")
                        })
                        .catch(err => console.log(err))
                }
            })
        })
        .catch(err => console.log(err))
})

app.get("/display/:id", (req, res)=>{
    if(req.session.userid){
        colorpdetails.findOne({_id: req.query.oid}, (err, data)=>{
            if(err){
                console.log(err)
            } else {
                console.log(data.colors)
                res.render("display", {colorpalcolors: data.colors})
            }
        })
    } else {
        res.redirect("/login")
    }
})

app.get("/logout", (req, res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
        } else {
            res.redirect("/login")
        }
    })
})
