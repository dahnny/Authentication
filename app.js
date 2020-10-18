//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require('ejs');
const encrypt = require('mongoose-encryption');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('port', process.env.PORT || 4000);

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret : process.env.SECRET , encryptedFields : ["password"]});

const User = new mongoose.model('User', userSchema);

app.get("/", function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets');
            }
        }
    });
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.post('/register', function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.render('secrets');
        }
    })
});


app.use(function (req, res) {
    res.status(404);
    res.render('404');

});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});


app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});