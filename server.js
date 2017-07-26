var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var app = express();
// CONNECT TO DB \\
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dreamthinktankbeta');
// CONTROLLERS \\
var passportConfig = require('./config/passport');
var authenticationController = require('./controllers/authController');
var userApiController = require('./controllers/userApiController'); 
var goalApiController = require('./controllers/goalApiController');
// SESSION SETUP \\
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize()); 
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// FOLDER DEPENDENCIES \\
app.use('/node_modules', express.static(__dirname + "/node_modules"));
app.use('/uploads', express.static(__dirname + "/uploads"));
app.use('/goalPics', express.static(__dirname + "/goalPics"));
app.use('/images', express.static(__dirname + "/images"));
// AUTHENTICATION ROUTES \\
app.get('/auth/login', authenticationController.login);
app.post('/auth/login', authenticationController.processLogin);
app.post('/auth/signup', authenticationController.processSignup);
app.get('/auth/logout', authenticationController.logout);
// AUTHENTICATE AND GET USER \\
app.use(passportConfig.ensureAuthenticated);
app.get('/', function(req, res){
  res.sendFile('/html/index.html', {root : './public'})
});
// USER ROUTES \\
app.get('/api/me', function(req, res){
  res.send(req.user)
});
app.get('/api/users/get', userApiController.getAllUsers);
app.post('/api/profile/updateFirstName', userApiController.updateFirstName);
app.post('/api/profile/updateLastName', userApiController.updateLastName);
app.post('/api/profile/updateCity', userApiController.updateCity);
app.post('/api/profile/updateState', userApiController.updateState);
app.post('/api/profile/updateDream', userApiController.updateDream);
app.post('/api/profile/updateLocation', userApiController.updateLocation);
app.post('/api/profile/updatePhoto', multipartMiddleware, userApiController.updatePhoto);
// GOAL ROUTES \\
app.post('/api/goals/post', multipartMiddleware, goalApiController.postGoal);
app.get('/api/goals/get/:userId', goalApiController.getUserGoals);
app.get('/api/goals/get', goalApiController.getAllGoals);
app.post('/api/rate', goalApiController.rate);
app.post('/api/goals/accomplished', goalApiController.accomplishedGoal)
app.delete('/api/goals/delete/:id', goalApiController.deleteGoal);
// SERVER \\
//var port = 8080
var port = process.env.PORT || 8080;
app.listen(port, function(){
  console.log('Server running on port ' + port);
});






























