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

/*Engine*/
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));

//Rotas
app.post('/login', (req,res) => {
    res.render('user/login')
})

app.get('/', (req, res) => {
    var sql = `SELECT * FROM session WHERE chave='${req.session.key}'`
    connect.query(sql, function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(result[0]){
            console.log(result[0].chave)
            return res.render('user/loguser')
        }

        res.render('home')
    })
    
});

app.post('/', (req,res) => {
    var sql = `INSERT INTO session (chave) VALUES (?)`

    
    if(req.body.login != undefined && req.body.login != '' && req.body.password != undefined && req.body.password != ""){
        connect.query(sql, [req.body.login], function(err){
            if(err){
                return console.log('Ocorreu um erro')
            }

            req.session.key = req.body.login
            res.render('user/loguser')
        })
        
    } else {
        res.render('home')
    }
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
});