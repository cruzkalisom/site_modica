//Requisições
const express = require("express");
const ejs = require('ejs');
const BodyParser = require('body-parser');
const db = require('mysql');
const session = require('express-session');
const { type } = require("jquery");

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

setInterval(function(){
    console.log('Checando Session')
    var sql = `SELECT * FROM session`
    var sql2 = `DELETE FROM session WHERE voucher=?`
    var date = new Date()
    var dateconvert = new Date(date).getTime()/100000

    connect.query(sql, function(err, result){
        if(err){
            console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            var checkdate = result[i].date - dateconvert
            if(checkdate <= 0){
                connect.query(sql2, [result[i].voucher], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }
        }
    })
}, 5*60000)

connect.connect(function(err){
    if(err){
        console.log('Erro de conexão: ' + err);
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
    secret:'oiajfoinhsaduijsdipuofjadijfpasiçodfe0hewugo-0fjíeghfcu',
    resave: true,
    saveUninitialized: true
}))

//Configs
var port = 30120

/*Engine*/
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));

//Rotas
app.get('/my_datas', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users  WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM address WHERE user_id=?`

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/login')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/login')
                }

                var name = result[0].name
                var firstname = result[0].firstname
                var age = result[0].age
                var admin = ''
                var address = ''

                connect.query(sql4, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(result[0]){
                        address = `Rua ${result[0].street}, N° ${result[0].number}, ${result[0].district} ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                    }
                })

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.render('user/mydatas', {address: address, age: age, admin: admin, name: result})
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = 'on'
                            break
                        }
                    }

                    res.render('user/mydatas', {address: address, admin: admin, name: name, firstname: firstname})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/painel', (req,res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM reservations WHERE user_id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var datareserves = []
    var contreserves = 0

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/login')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/login')
                }

                var name = result[0].name
                var firstname = result[0].firstname
                var age = result[0].age
                var country = result[0].nationality
                var admin = ''
                var address = ''

                connect.query(sql4, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    contreserves = result.length

                    for(var i = 0; i < result.length; i++){
                        var converttype = ''
                        var statustype = ''
                        var badgetype = ''
                        if(result[i].type == 1){
                            converttype = 'Adulto'
                        }
                        if(result[i].type == 2){
                            converttype = 'Kids'
                        }
                        if(result[i].type == 3){
                            converttype = 'Combo'
                        }

                        if(result[i].auth == 1){
                            statustype = 'Aguardando'
                            badgetype = 'badge-warning'
                        }
                        if(result[i].auth == 2){
                            statustype = 'Aprovado'
                            badgetype = 'badge-success'
                        }
                        if(result[i].auth == 3){
                            statustype = 'Expirado'
                            badgetype = 'badge-danger'
                        }
                        if(result[i].auth == 4){
                            statustype = 'Finalizado'
                            badgetype = 'badge-secondary'
                        }

                        var date_reserves = new Date(result[i].dateres*100000)
                        var datereserves_convert = `${date_reserves.getDate()}/${date_reserves.getMonth() + 1}/${date_reserves.getFullYear()}`
                        var cachereserve = {id: result[i].id, status: statustype, type: converttype, date: datereserves_convert, badge: badgetype}
                        datareserves.push(cachereserve)
                    }
                })

                connect.query(sql5, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err)
                    }

                    if(result[0]){
                        address = `Rua ${result[0].street}, N° ${result[0].number}, ${result[0].district} ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                    }
                })

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.render('admin/panel', {address: address, country: country, reserves: contreserves, age: age, name: name, firstname: firstname, admin: admin, datas: datareserves})
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = 'on'
                            break
                        }
                    }

                    res.render('admin/panel', {address: address, country: country, reserves: contreserves, age: age, name: name, firstname: firstname, admin: admin, datas: datareserves})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

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
    var date = new Date()
    var dateconvert = new Date(date).getTime() + 86400000
    var calcdate = dateconvert/100000
    var sql = `SELECT * FROM users WHERE user=?`
    var sql2 = `SELECT * FROM session WHERE user_id=?`
    var sql3 = `INSERT INTO session(user_id, date) VALUES (?,?)`
    
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

            connect.query(sql2, [result[0].id], function(err, result2){
                if(err){
                    return console.log(err.message)
                }

                if(result2[0]){
                    req.session.key = result2[0].voucher
                    req.session.user = result[0].id
                    return res.redirect('/dev')
                } else {
                    connect.query(sql3, [result[0].id, calcdate], function(err){
                        if(err){
                            console.log(err.message)
                        }

                        connect.query(sql2, [result[0].id], function(err, result3){
                            if(err){
                                console.log(err.message)
                            }

                            req.session.key = result3[0].voucher
                            req.session.user = result[0].id
                            return res.redirect('/dev')
                        })
                    })
                }
            })
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
    res.render('developer/homedev')
});

app.get('/devtest', (req,res) => {
    var date = new Date()
    var date = new Date(date).getTime() + 86400000

    res.send(String(date/100000))
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
})