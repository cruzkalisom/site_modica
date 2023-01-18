//Requisições
const express = require("express");
const ejs = require('ejs');
const BodyParser = require('body-parser');
const db = require('mysql');
const session = require('express-session');

/* Validação de prazo

const teste = new Date()
teste2 = teste.getTime() + 86400000



setInterval(function(){
    teste3 = new Date()
    teste3 = teste2 - teste3.getTime()
    console.log(teste3)
}, 1000)*/

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

/* Quantos itens em um Array

var sqltest = `SELECT * FROM session`

connect.query(sqltest, function(err, result){
    if(err){
        return console.log(err.message)
    }

    var count = result

    console.log(count.length)
})*/

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
app.get('/painel', (req,res) => {
    res.render('admin/panel.ejs')
})

app.post('/data', (req,res) => {
    var sql = `SELECT * FROM reservations WHERE type=?`
    var sql2 = `SELECT * FROM reservations WHERE dateres=?`
    var date = new Date(req.session.bookingdate)
    var dateconvert = date.getTime()/100000
    var type = Number(req.body.bookingtype)

    if(!type || type == undefined) {
        return res.render('reserves/date_reserve', {erro: 'Opção inválida!'})
    }

    if(req.session.bookingdate && req.session.bookingdate != undefined){
        if(type != 3){
            connect.query(sql, [type], function(err, result){
                if(err){
                    return console.log(err.message)
                }
    
                if(!result[0]){
                    req.session.bookingtype = req.body.bookingtype
                    return res.render('reserves/typeevent', {erro: ''})
                }
    
                for(var i = 0; i < result.length; i++){
                    if(result[i].dateres == dateconvert && result[i].auth <= 2){
                        return res.render('reserves/date_reserve', {erro: 'Indisponível para a data escolhida!'})
                        break
                    }
                }
    
                req.session.bookingtype = req.body.bookingtype
                res.render('reserves/typeevent', {erro: ''})
            })
        } else {
            connect.query(sql2, [dateconvert], function(err, result){
                if(err){
                    console.log(err.message)
                }

                if(result[0]){
                    return res.render('reserves/date_reserve', {erro: 'Indisponível para a data escolhida!'})
                }

                res.render('reserves/typeevent', {erro: ''})
            })
        }
    } else {
        res.render('reserves/date_reserve', {erro: 'Data inválida!'})
    }
});

app.post('/bookingdate', (req, res) => {
    var date = new Date()
    var confirm_date = new Date(req.body.date)
    var valid_date = date.getTime() - confirm_date.getTime()
    var dateconvert = confirm_date.getTime()/100000
    var sql = `SELECT * FROM reservations WHERE dateres=?`
    var type_one = ''
    var type_two = ''
    var type_tree = ''
    var combo_type = ''

    if(valid_date > 0){
        return res.render('reserves/date_reserve', {erro: 'Data inválida!'})
    }

    connect.query(sql, [dateconvert], function(err, result){
        if(err){
            return console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            if(result[i].type == 1 && result[i].auth <= 2){
                type_one = 'indisponível'
                combo_type = 'indisponível'
            }

            if(result[i].type == 2 && result[i].auth <= 2){
                type_two = 'indisponível'
                combo_type = 'indisponível'
            }

            if(result[i].type == 3 && result[i].auth <= 2){
                type_tree = 'indisponível'
                break
            }
        }

        if(type_tree == 'indisponível'){
            return res.render('reserves/date_reserve', {erro: 'Reservas indisponíveis para a data escolhida!'})
        }

        if(type_one == 'indisponível' && type_two == 'indisponível'){
            return res.render('reserves/date_reserve', {erro: 'Reservas indisponíveis para a data escolhida!'})
        }
        req.session.bookingdate = req.body.date
        res.render('reserves/salonavaliable', {erro: '', typeone: type_one, typetwo: type_two, combotype: combo_type})
    })
});

app.get('/bookingdate', (req,res) => {
    res.render('reserves/date_reserve', {erro: ''})
});

app.post('/register', (req,res) => {
    var sql = `SELECT * FROM users WHERE user=?`
    var sql2 = `INSERT INTO users (name, user, password, firstname) VALUES (?, ?, ?, ?)`

    if(!req.body.name || req.body.name == undefined){
        return res.render('user/register', {erro: 'Nome inválido!', terms: ''})
    }

    if(!req.body.firstname || req.body.firstname == undefined){
        return res.render('user/register', {erro: 'Sobrenome inválido', terms: ''})
    }

    if(!req.body.user || req.body.user == undefined){
        return res.render('user/register', {erro: 'E-mail inválido!', terms: ''})
    }

    if(!req.body.password || req.body.user == undefined){
        return res.render('user/register', {erro: 'Senha inválida!', terms: ''})
    }

    if(!req.body.confirm_password || req.body.confirm_password == undefined){
        return res.render('user/register', {erro: 'Senhas não são iguais!', terms: ''})
    }

    if(req.body.confirm_password != req.body.password){
        return res.render('user/register', {erro: 'Senhas não são iguais!', terms: ''})
    }

    if(!req.body.terms || req.body.terms == undefined){
        return res.render('user/register', {erro: '', terms: 'Concorde com os termos!'})
    }

    connect.query(sql, [req.body.user], function(err, result){
        if(err){
            return console.log("erro: " + err.message)
        }

        if(result[0]){
            return res.render('user/register', {erro: 'E-mail já registrado!', terms: ''})
        }

        connect.query(sql2, [req.body.name, req.body.user, req.body.password, req.body.firstname], function (err){
            if(err){
                return console.log(err.message)
            }

            res.send('Conta criada com sucesso')
        })
    })
});

app.get('/register', (req,res) => {
    res.render('user/register', {erro: '', terms: ''})
});

app.get('/login', (req,res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`

    if(!req.session.user){
        return res.render('user/login', {erro: ''})
    }

    connect.query(sql, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.render('user/login', {erro: ''})
        }

        if(req.session.key != result[0].voucher){
            return res.render('user/login', {erro: ''})
        }

        connect.query(sql2, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.render('user/login', {erro: ''})
            }

            res.render('home', {key: '1', name: result[0].name})
        })
    })
});

app.post('/login', (req,res) => {
    var sql = `SELECT * FROM users WHERE user=?`
    var sql2 = `SELECT * FROM session WHERE user_id=?`
    var sql3 = `INSERT INTO session(user_id) VALUES (?)`
    
    if(req.body.user && req.body.user != undefined){
        connect.query(sql, [req.body.user], function(err, result){
            if(err){
                return console.log(err.message)
            }
            
            if(!result[0]){
                return res.render('user/login', {erro:'Usuário não encontrado!'})
            }

            if(result[0].password != req.body.password){
                return res.render('user/login', {erro: 'Senha incorreta!'})
            }

            if(req.body.remember){
                connect.query(sql2, [result[0].id], function(err, result2){
                    if(err){
                        return console.log(err.message)
                    }

                    if(result2[0]){
                        req.session.key = result2[0].voucher
                        req.session.user = result[0].id
                        return res.render('home', {key: '1', name: result[0].name})
                    } else {
                        connect.query(sql3, [result[0].id], function(err){
                            if(err){
                                console.log(err.message)
                            }

                            connect.query(sql2, [result[0].id], function(err, result3){
                                if(err){
                                    console.log(err.message)
                                }

                                req.session.key = result3[0].voucher
                                req.session.user = result[0].id
                                return res.render('home', {key: '1', name: result[0].name})
                            })
                        })
                    }
                })
            } else {
                req.session.user = result[0].id
                res.render('home', {key: '1', name: result[0].name})
            }
        });
    } else {
        res.render('user/login', {erro: ''})
    }
});

app.get('/forgot-password',(req,res) => {
    res.send('Página de recuperação de senha')
});

/*app.get('/', (req, res) => {
    var sql = `SELECT * FROM session WHERE voucher='${req.session.key}'`
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
});*/

app.get('/dev', (req,res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`

    if(!req.session.user){
        return res.render('home', {key: ''})
    }

    connect.query(sql, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.render('home', {key: ''})
        }

        if(req.session.key != result[0].voucher){
            return res.render('home', {key: ''})
        }

        connect.query(sql2, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.render('home', {key: ''})
            }

            res.render('home', {key: '1', name: result[0].name})
        })
    })
});

app.get('/', (req,res) => {
    res.render('homedev')
});

app.get('/devtest', (req,res) => {
    var date = new Date(req.body.bookingdate)

    res.send(date.getTime())
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
})