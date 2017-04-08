'use strict';

require('dotenv').load();

var express = require('express'),
    app = express(),
    routes = require('./app/routes/index.js'),
	urli = 'mongodb://' + process.env.DB_LOGIN + ':' + process.env.DB_PASS + '@ds113580.mlab.com:13580/freecodecamp_1',
	passport = require('passport'),
	session = require('express-session'),
	MongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID,
	GitHubStrategy = require('passport-github').Strategy,
	bodyParser = require('body-parser'),
	books = require('google-books-search');

require('./app/config/passport')(passport, session, urli, MongoClient, ObjectId, GitHubStrategy);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));
app.use(session({
	secret: process.env.SESSION_KEY,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

routes(app, passport, session, urli, MongoClient, ObjectId, books, bodyParser);

// Listen port
app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  	console.log('Node app is running on port', app.get('port'));
});