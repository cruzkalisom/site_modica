//Requisições
const express = require("express");
const ejs = require('ejs');
const BodyParser = require('body-parser');
const db = require('mysql');
const session = require('express-session');

//Banco de dados
var connect = db.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test'
});

connect.connect(function(err){
    if(err){
        console.log('Erro de conexão:' + err);
        return
    }

    console.log('Conectado ao bando de dados Local')
});

//Criando App
const app = express();

app.use(BodyParser.urlencoded({extended: false}));
app.use(BodyParser.json());

//Sessões
app.use(session({
    secret:'TROCARASECRET',
    resave: true,
    saveUninitialized: true
}))

//Configs
var port = 30120
var login = 'admin'
var password = '123456'

/*Engine*/
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));

//Rotas
app.get('/', (req, res) => {
    if(req.session.login == login){
       res.render('user/loguser') 
    }
    else{
        res.render('home')
    }
    
});

app.post('/', (req,res) => {
    var sql = `SELECT * FROM session WHERE key='${req.session.key}'`
    connect.query(sql, function(err, result){
        if(err){
            return console.log('ocorreu um erro')
        }
    })
    if(req.body.login == login && req.body.password == password){
        req.session.key = login
        res.render('user/loguser')
    } else {
        res.render('home')
    }
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
});