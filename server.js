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
app.get('/', (req, res) => {
    res.render('home')
});

app.post('/login', (req,res) => {
    let login = req.body.login
    let password = req.body.password

    res.render('user/loguser', req.body)
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
});