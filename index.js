var express = require('express');
var app = express();
const path = require('path');
var pool = require('./connection');

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));

app.get('/',function(req, res){
    res.sendFile(__dirname + '/register.html');
});

app.post('/', function(req,res){
    var firstname = req.body.fname;
    var lastname = req.body.lname;
    var gender = req.body.gender;
    var email = req.body.email;
    var pass = req.body.pwd;
    var phone = req.body.num;

    pool.getConnection(function(error){
        if(error) {
            console.error('error connecting ' + error.stack);
            return;
        }
        if(firstname && gender && lastname && email && pass && phone){
            var sqlQuery = "INSERT INTO registration(FirstName,Gender,LastName,email,password,phone) Values (?,?,?,?,?,?)";
            console.log("Im in register post method")
            pool.query(sqlQuery, [firstname, gender, lastname,email, pass,phone],function(error,result){
                if(error) throw error;
                console.log("Saved details to DB")
                res.redirect('/login');    
                res.end();
            })
        }
       
    });
    
});

app.get('/login',function(req, res){
    console.log("Yes Im here")
    res.sendFile(path.join(__dirname + '/login.html'));
    
});

app.post('/login', function(req,res){
    console.log("Im working");
    var email = req.body.uname;
    var password = req.body.password;
    console.log(email, password);
   
    pool.getConnection(function(error){
        if(error){
            console.error('error connecting' + error.stack);
        }
        if(email && password) {
            var query2 = "select *from registration where email = ? AND password = ?"
            pool.query(query2, [email,password], function(error, result){
                if(error) throw error;
                if(result.length > 0 ){
                    //req.session.loggedin = true;
                    console.log("Valid creds")
                    console.log(result);
    
                }else{
                    res.send("Incorrect Email or Password")
                }
                res.end();
            });
        }else{
            res.send("Enter Email and Password");
            res.end();
        }
        
    });
    res.sendFile(path.join(__dirname +'/timesheet.html'))

});
app.post('/timesheet', function(req, res) {
    pool.getConnection(function(error){
        if(error){
            console.log("Error " +error.stack)
        }
    });
    var query = "insert into timesheet(Whichday, timeIn, timeout) values (?,?,?);"
    var whichday = req.body.start;
    var timein = req.body.in;
    var timeout = req.body.out;

    pool.query(query, [whichday, timein, timeout],function(error,result){
        if(error) throw error;
        res.send('Successfully updated ClockIn and Clockout to DB');
        console.log("Success");
    });

});
app.listen(3000);

module.exports = app;