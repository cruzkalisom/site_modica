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
}, 30*60000)

setInterval(function(){
    console.log('Checando prazo de pagamento')
    var sql = `SELECT * FROM reservations`
    var sql2 = `UPDATE reservations SET auth = 3 WHERE id=?`

    var date_atual = new Date()
    date_atual = date_atual.getTime()

    connect.query(sql, function(err, result){
        if(err){
            return console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            var convert_pag = result[i].timepag*100000
            if(convert_pag - date_atual <= 0 && result[i].auth == 1){
                connect.query(sql2, [result[i].id], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }
        }
    })

}, 30*60000)

setInterval(function(){
    console.log('Checando valores por temporada')
    var sql = `SELECT * FROM values_temp`
    var sql9 = `DELETE FROM values_temp WHERE id=?`
    var date = new Date()
    date = new Date(date)

    connect.query(sql, function(err, result){
        if(err){
            return console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            var date_reserve = new Date(result[i].finish*100000)

            if(date.getTime() > date_reserve.getTime() + 86400000){
                connect.query(sql9, [result[i].id], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }
        }
    })
}, 30*60000)

connect.connect(function(err){
    if(err){
        console.log('Erro de conexão: ' + err);
        return
    }

    console.log('Conectado ao banco de dados Local')
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
var port = 50553

/*Engine*/
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));

//Rotas
app.get('/values_reserves', (req, res) => {
    res.render('values')
})

app.get('/not_date', (req, res) => {
    res.render('reserves/not_date')
})

app.get('/invalid_date', (req, res) => {
    res.render('reserves/invalid_date')
})

app.get('/invalid_fdate', (req, res) => {
    res.render('reserves/invalid_fdate')
})

app.post('/request_reservation', (req, res) => {
    var date = new Date()
    var confirm_date = new Date(req.body.idate)
    var finish_date = new Date(req.body.fdate)
    var valid_date = date.getTime() - confirm_date.getTime()
    var sql = `SELECT * FROM reservations`
    var sql2 = `SELECT * FROM block_date`
    var type_one = ''
    var type_two = ''
    var type_tree = ''
    var combo_type = ''

    if(valid_date > 0){
        return res.redirect('/invalid_date')
    }

    if(confirm_date.getTime() > finish_date.getTime()){
        return res.redirect('/invalid_fdate')
    }

    connect.query(sql2, function(err, result){
        var block_date = false
        if(err){
            return console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            var iblock = new Date(parseInt(result[i].init))
            var fblock = new Date(parseInt(result[i].finish))

            if(iblock.getTime() >= confirm_date.getTime() + 86400000 && iblock <= finish_date.getTime() + 86400000){
                block_date = true
                break
            }

            if(confirm_date.getTime() + 86400000 >= iblock.getTime() && confirm_date.getTime() + 86400000 <= fblock.getTime()){
                block_date = true
                break
            }
        }

        if(block_date){
            return res.redirect('/not_date')
        }

        connect.query(sql, function(err, result){
            if(err){
                return console.log(err.message)
            }
    
            for(var i = 0; i < result.length; i++){
                var cachedate = new Date(parseInt(result[i].dateres))
                var fdate = new Date(parseInt(result[i].datef))
    
                if(cachedate.getTime() >= confirm_date.getTime() + 86400000 && cachedate.getTime() <= finish_date.getTime() + 86400000){
                    if(result[i].type == 1 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_one = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_one = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 2 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_two = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_two = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 3 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_tree = 'Pendente'
                        } else {
                            type_tree = 'Indisponível'
                        }
                        break
                    }
                }
    
                if(confirm_date.getTime() + 86400000 >= cachedate.getTime() && confirm_date.getTime() + 86400000 <= fdate.getTime()){
                    if(result[i].type == 1 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_one = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_one = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 2 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_two = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_two = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 3 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_tree = 'Pendente'
                        } else {
                            type_tree = 'Indisponível'
                        }
                        break
                    }
                }
            }
    
            if(type_tree == 'indisponível'){
                return res.redirect('/not_date')
            }
    
            if(type_one == 'indisponível' && type_two == 'indisponível'){
                return res.redirect('/not_date')
            }

            var convert_idate = new Date(confirm_date.getTime() + 86400000)
            var convert_fdate = new Date(finish_date.getTime() + 86400000)

            convert_idate = `${convert_idate.getDate()}/${convert_idate.getMonth() + 1}/${convert_idate.getFullYear()}`
            convert_fdate = `${convert_fdate.getDate()}/${convert_fdate.getMonth() + 1}/${convert_fdate.getFullYear()}`
            res.redirect(`https://api.whatsapp.com/send?phone=5577999886660&text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20de%20reserva%20entre%20as%20datas%20${convert_idate}%20e%20${convert_fdate}`)
        })
    })
})

app.get('/calendar', (req, res) => {
    var sql = `SELECT * FROM reservations`
    var sql2 = `SELECT * FROM block_date`
    var reserves = []
    var block_date = []

    connect.query(sql, function(err, result){
        if(err){
            return console.log(err.message)
        }

        

        for(var i = 0; i < result.length; i++){
            var background = ''
            var border = ''
            var title = ''

            var idate = new Date(parseInt(result[i].dateres))
            var fdate = new Date(parseInt(result[i].datef))
            if(result[i].type == 1){
                if(result[i].auth <= 2){
                    if(result[i].auth == 1){
                        title = 'Salão adulto pendente'
                        background = '#DAA520'
                        border = '#FFFF00'
                    }
    
                    if(result[i].auth == 2){
                        title = 'Salão Adulto indisponível'
                        background = '#f56954'
                        border = 'red'
                    }
    
                    var cache_reserves = {background: background, border: border, title: title, init: idate, finish: fdate}
                    reserves.push(cache_reserves)
                }
            }

            if(result[i].type == 2){
                if(result[i].auth <= 2){
                    if(result[i].auth == 1){
                        title = 'Salão Kids pendente'
                        background = '#DAA520'
                        border = '#FFFF00'
                    }
    
                    if(result[i].auth == 2){
                        title = 'Salão Kids indisponível'
                        background = '#f56954'
                        border = 'red'
                    }
    
                    var cache_reserves = {background: background, border: border, title: title, init: idate, finish: fdate}
                    reserves.push(cache_reserves)
                }
            }

            if(result[i].type == 3){
                if(result[i].auth <= 2){
                    if(result[i].auth == 1){
                        title = 'Pendente'
                        background = '#DAA520'
                        border = '#FFFF00'
                    }
    
                    if(result[i].auth == 2){
                        title = 'Indisponível'
                        background = '#f56954'
                        border = 'red'
                    }
    
                    var cache_reserves = {background: background, border: border, title: title, init: idate, finish: fdate}
                    reserves.push(cache_reserves)
                }
            }
        }

        connect.query(sql2, function(err, result2){
            if(err){
                return console.log(err.message)
            }

            for(var i = 0; i < result2.length; i++){
                var iblock = new Date(parseInt(result2[i].init))
                var fblock = new Date(parseInt(result2[i].finish))

                var cache_block = {init: iblock, finish: fblock}
                block_date.push(cache_block)
            }

            res.render('reserves/calendar', {reserves: reserves, block_date: block_date})
        })
    })
})

app.post('/admin/value_date', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `INSERT INTO values_date (date, value_date) VALUES (?,?)`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            var date = new Date(req.body.date)
            date = date.getTime()/100000
            connect.query(sql3, [date, req.body.value], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/values')
            })
        })
    })
})

app.post('/admin/value_temp', (req, res) => {
    var sql = `INSERT INTO values_temp (init, finish, value_temp) VALUES (?, ?, ?)`
    var sql2 = `SELECT * FROM session WHERE user_id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

    connect.query(sql2, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.redirect('/login')
        }

        if(req.session.key != result[0].voucher){
            return res.redirect('/login')
        }

        connect.query(sql3, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            var date_init = new Date(req.body.init)
            var date_finish = new Date(req.body.finish)
            date_init = date_init.getTime()/100000
            date_finish = date_finish.getTime()/100000

            connect.query(sql, [date_init, date_finish, req.body.value], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/values')
            })
        })
    })
})

app.post('/create_users', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE user=?`
    var sql4 = `INSERT INTO users (name, contact, firstname, cpf, rg, age, genre, marital, user, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            connect.query(sql3, [req.body.email], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(result[0]){
                    return res.redirect('/create_users')
                }

                if(req.body.password != req.body.confirm_password){
                    return res.redirect('/create_users')
                }

                var age = new Date(req.body.age)
                connect.query(sql4, [req.body.name, req.body.contact, req.body.firstname, req.body.cpf, req.body.rg, age.getTime()/100000, req.body.genre, req.body.marital, req.body.email, req.body.password], function(err){
                    if(err){
                        return console.log(err.message)
                    }

                    res.redirect('/users')
                })
            })
        })
    })
})

app.get('/create_users', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE id=?` 
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            connect.query(sql3, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/')
                }

                var name = result[0].name
                var firstname =  result[0].firstname

                res.render('admin/adminchange', {name: name, firstname: firstname})
            })
        })
    })
})

app.get('/admin_register_reserve', (req, res) => {
    var datereserve = new Date(req.session.bookingdate)
    var datereservef = new Date(req.session.finish_date)
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM values_reserve`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM values_temp`
    var converttype = ''
    var convertevent = ''
    var valueres = 0
    var admin = false

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

            connect.query(sql3, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin'){
                        admin = true
                        break
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                if(req.session.bookingtype == 1){
                    converttype = 'Adulto'
                }
                if(req.session.bookingtype == 2){
                    converttype = 'Kids'
                }
                if(req.session.bookingtype == 3){
                    converttype = 'Combo'
                }
    
                if(req.body.bookingtype == 1){
                    convertevent = 'Aniversário'
                }
                if(req.body.bookingtype == 2){
                    convertevent = 'Confraternização'
                }
                if(req.body.bookingtype == 3){
                    convertevent = 'Show'
                }
                if(req.body.bookingtype == 4){
                    convertevent = 'Casamento'
                }
                if(req.body.bookingtype == 5){
                    convertevent = 'Chá de Revelação'
                }
                if(req.body.bookingtype == 6){
                    convertevent = 'Outros'
                }
    
                connect.query(sql2, function(err, result2){
                    if(err){
                        return console.log(err.message)
                    }
    
                    var value_cont = 0

                    connect.query(sql4, function(err, result3){
                        if(err){
                            return console.log(err.message)
                        }

                        var value_temp = 0
                        for(var i = datereserve.getTime(); i <= datereservef.getTime(); i += 86400000){
                            var reserve_cont_date = new Date(i)
            
                            for(var a = 0; a < result3.length; a++){
                                var date = new Date(result3[a].finish*100000)
                                console.log(reserve_cont_date.getTime())
                                console.log(result3[a].init*100000)
                                if(reserve_cont_date.getTime() >= result3[a].init*100000 && reserve_cont_date.getTime() <= result3[a].finish*100000){
                                    
                                    value_temp += result3[a].value_temp
                                    break
                                }
    
                                if(reserve_cont_date.getDate() == date.getDate() && reserve_cont_date.getMonth() == date.getMonth() && reserve_cont_date.getFullYear == date.getFullYear()){
                                    value_temp += result3[a].value_temp
                                    break
                                }
                            }

                            if(value_temp > 0){
                                value_cont += value_temp
                                value_temp = 0
                            } else {
                                if(reserve_cont_date.getDay() == 0){
                                    value_cont += result2[0].monday
                                }
            
                                if(reserve_cont_date.getDay() == 1){
                                    value_cont += result2[0].tuesday
                                }
            
                                if(reserve_cont_date.getDay() == 2){
                                    value_cont += result2[0].wednesday
                                }
            
                                if(reserve_cont_date.getDay() == 3){
                                    value_cont += result2[0].thursday
                                }
            
                                if(reserve_cont_date.getDay() == 4){
                                    value_cont += result2[0].friday
                                }
            
                                if(reserve_cont_date.getDay() == 5){
                                    value_cont += result2[0].saturday
                                }
            
                                if(reserve_cont_date.getDay() == 6){
                                    value_cont += result2[0].sunday
                                }
                            }
                        }

                        req.session.valuesess = value_cont
                        datereserve = `${datereserve.getDate() + 1}/${datereserve.getMonth() + 1}/${datereserve.getFullYear()}` 
                        datereservef = `${datereservef.getDate() + 1}/${datereservef.getMonth() + 1}/ ${datereservef.getFullYear()}`    
                        req.session.typeevent = req.body.bookingtype
                        res.render('admin/registerreserve', {erro: 'Usuário inválido!', datef: datereservef, value: value_cont, event: convertevent, date: datereserve, type: converttype}) 
                    })
                })
            })
        })
    } else {
        res.redirect('login')
    }
});

app.post('/admin_confirm_reserve', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `INSERT INTO reservations (value, type, user_id, auth, timepag, dateres, datef, datereq, description, rate, discounts) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`
    var sql4 = `SELECT * FROM users WHERE id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            var date = new Date()
            date = new Date(date)
            var timepag = date.getTime() + 86400000
            timepag = timepag/100000
            var datereq = date.getTime()/100000
            var initdate = new Date(req.session.bookingdate)
            initdate = initdate.getTime() + 86400000
            var finish_date = new Date(req.session.finish_date)
            finish_date = finish_date.getTime() + 86400000

            connect.query(sql4, [req.body.nuser], function(err, result2){
                if(err){
                    return console.log(err.message)
                }
            
                if(!result2[0]){
                    return res.redirect('/admin_register_reserve')
                }

                var name = `${result2[0].name} ${result2[0].firstname}`
                var user_id = result2[0].id
                var email = result2[0].user
                var dateres = new Date(req.session.bookingdate)
                var datef = new Date(req.session.finish_date)
                var convertdatef = `${datef.getDate() + 1}/${datef.getMonth() + 1}/${datef.getFullYear()}`
                var convertdateres = `${dateres.getDate() + 1}/${dateres.getMonth() + 1}/${dateres.getFullYear()}`
                var convertdatereq = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                var converttype = ``
                var totalcalc = parseInt(req.body.rate) + parseInt(req.body.discounts) + parseInt(req.body.value)

                if(req.session.bookingtype == 1){
                    converttype = 'Adulto'
                }
                if(req.session.bookingtype == 2){
                    converttype = 'Kids'
                }
                if(req.session.bookingtype == 3){
                    converttype = 'Combo'
                }

                connect.query(sql3, [req.body.value, req.session.bookingtype, req.body.nuser, timepag, String(initdate), String(finish_date), datereq, req.body.description, req.body.rate, req.body.discounts], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }
    
                    var insertid = result.insertId

                    connect.query(sql5, [req.body.nuser], function(err, result3){
                        if(err){
                            return console.log(err.message)
                        }

                        if(!result3[0]){
                            return res.render('admin/finishreserve', {rate: req.body.rate, discount: req.body.discounts,  total: totalcalc, user_id: user_id, ID: insertid, subtotal: req.body.value, description: req.body.description, datef: convertdatef, dateres: convertdateres, type: converttype, email:email, datereq: convertdatereq, name: name, address: ''})
                        }

                        var address = `${result3[0].street}, ${result3[0].number}, ${result3[0].district} ${result3[0].complement}, ${result3[0].cep}, ${result3[0].city} - ${result3[0].state}`
                        res.render('admin/finishreserve', {rate: req.body.rate, discount: req.body.discounts, total: totalcalc, user_id: user_id, ID: insertid, subtotal: req.body.value, description: req.body.description, datef: convertdatef, dateres: convertdateres, type: converttype, email:email, datereq: convertdatereq, name: name, address: address})
                    })
                })
            })
        })
    })
})

app.post('/admin_register_reserve', (req, res) => {
    var datereserve = new Date(req.session.bookingdate)
    var datereservef = new Date(req.session.finish_date)
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM values_reserve`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM values_temp`
    var converttype = ''
    var convertevent = ''
    var valueres = 0
    var admin = false

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

            connect.query(sql3, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin'){
                        admin = true
                        break
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                if(req.session.bookingtype == 1){
                    converttype = 'Adulto'
                }
                if(req.session.bookingtype == 2){
                    converttype = 'Kids'
                }
                if(req.session.bookingtype == 3){
                    converttype = 'Combo'
                }
    
                if(req.body.bookingtype == 1){
                    convertevent = 'Aniversário'
                }
                if(req.body.bookingtype == 2){
                    convertevent = 'Confraternização'
                }
                if(req.body.bookingtype == 3){
                    convertevent = 'Show'
                }
                if(req.body.bookingtype == 4){
                    convertevent = 'Casamento'
                }
                if(req.body.bookingtype == 5){
                    convertevent = 'Chá de Revelação'
                }
                if(req.body.bookingtype == 6){
                    convertevent = 'Outros'
                }
    
                connect.query(sql2, function(err, result2){
                    if(err){
                        return console.log(err.message)
                    }
    
                    var value_cont = 0

                    connect.query(sql4, function(err, result3){
                        if(err){
                            return console.log(err.message)
                        }

                        var value_temp = 0
                        for(var i = datereserve.getTime(); i <= datereservef.getTime(); i += 86400000){
                            var reserve_cont_date = new Date(i)
            
                            for(var a = 0; a < result3.length; a++){
                                var date = new Date(result3[a].finish*100000)
                                if(reserve_cont_date.getTime() >= result3[a].init*100000 && reserve_cont_date.getTime() <= result3[a].finish*100000){
                                    
                                    value_temp += result3[a].value_temp
                                    break
                                }
                            }

                            if(value_temp > 0){
                                value_cont += value_temp
                                value_temp = 0
                            } else {
                                if(reserve_cont_date.getDay() == 0){
                                    value_cont += result2[0].monday
                                }
            
                                if(reserve_cont_date.getDay() == 1){
                                    value_cont += result2[0].tuesday
                                }
            
                                if(reserve_cont_date.getDay() == 2){
                                    value_cont += result2[0].wednesday
                                }
            
                                if(reserve_cont_date.getDay() == 3){
                                    value_cont += result2[0].thursday
                                }
            
                                if(reserve_cont_date.getDay() == 4){
                                    value_cont += result2[0].friday
                                }
            
                                if(reserve_cont_date.getDay() == 5){
                                    value_cont += result2[0].saturday
                                }
            
                                if(reserve_cont_date.getDay() == 6){
                                    value_cont += result2[0].sunday
                                }
                            }
                        }

                        req.session.valuesess = value_cont
                        datereserve = `${datereserve.getDate() + 1}/${datereserve.getMonth() + 1}/${datereserve.getFullYear()}` 
                        datereservef = `${datereservef.getDate() + 1}/${datereservef.getMonth() + 1}/ ${datereservef.getFullYear()}`    
                        req.session.typeevent = req.body.bookingtype
                        res.render('admin/registerreserve', {erro: '', datef: datereservef, value: value_cont, event: convertevent, date: datereserve, type: converttype}) 
                    })
                })
            })
        })
    } else {
        res.redirect('login')
    }
});

app.post('/salon_create', (req,res) => {
    var sql = `SELECT * FROM reservations WHERE type=?`
    var sql2 = `SELECT * FROM reservations`
    var sql3 = `SELECT * FROM session WHERE user_id=?`
    var sql4 = `SELECT * FROM permissions WHERE user_id=?`
    var date = new Date(req.session.bookingdate)
    var finish_date = new Date(req.session.finish_date)
    var type = Number(req.body.bookingtype)
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

    connect.query(sql3, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.redirect('/login')
        }

        if(req.session.key != result[0].voucher){
            return res.redirect('/login')
        }

        if(!type || type == undefined) {
            return res.render('admin/date_create', {erro: 'Opção inválida!'})
        }

        connect.query(sql4, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                }
            }

            if(!admin){
                return res.redirect('/')
            }


            if(req.session.bookingdate && req.session.bookingdate != undefined){
                if(type != 3){
                    connect.query(sql, [type], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }
            
                        if(!result[0]){
                            req.session.bookingtype = req.body.bookingtype
                            return res.render('admin/typeevent', {erro: ''})
                        }
            
                        for(var i = 0; i < result.length; i++){
                            var convertdateres = parseInt(result[i].dateres)
                            var fdate = parseInt(result[i].datef)
                            if(convertdateres >= date.getTime() + 86400000 && convertdateres <= finish_date.getTime() + 86400000 && result[i].auth <= 2){
                                return res.render('admin/date_create', {erro: 'Indisponível para a data escolhida!'})
                                break
                            }
        
                            if(date.getTime() + 86400000 >= convertdateres && date.getTime() + 86400000 <= fdate && result[i].auth <= 2){
                                return res.render('admin/date_create', {erro: 'Indisponível para a data escolhida!'})
                                break
                            }
                        }
            
                        req.session.bookingtype = req.body.bookingtype
                        res.render('admin/typeevent', {erro: ''})
                    })
        
                } else {
                    connect.query(sql2, function(err, result){
                        if(err){
                            console.log(err.message)
                        }
        
                        for(var i = 0; i < result.length; i++){
                            var date_reserve = new Date(parseInt(result[i].dateres))
        
                            if(date_reserve.getTime() >= date.getTime() + 86400000 && date_reserve.getTime() <= finish_date.getTime() + 86400000  && result[i].auth <= 2){
                                return res.render('admin/date_create', {erro: 'Indisponível para a data escolhida!'})
                                break
                            }
                        }
        
                        res.render('admin/typeevent', {erro: ''})
                    })
                }
            } else {
                res.render('admin/date_create', {erro: 'Data inválida!'})
            }
        })
    })
});

app.post('/date_create', (req, res) => {
    var date = new Date()
    var confirm_date = new Date(req.body.idate)
    var finish_date = new Date(req.body.fdate)
    var valid_date = date.getTime() - confirm_date.getTime()
    var sql = `SELECT * FROM reservations`
    var sql2 = `SELECT * FROM session WHERE user_id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM block_date`
    var type_one = ''
    var type_two = ''
    var type_tree = ''
    var combo_type = ''
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

    connect.query(sql2, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.redirect('/login')
        }

        if(req.session.key != result[0].voucher){
            return res.redirect('/login')
        }

        connect.query(sql3, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            if(valid_date > 0){
                return res.render('admin/date_create', {erro: 'Data inválida!'})
            }
        
            connect.query(sql4, function(err, result){
                var block_date = false
                if(err){
                    return console.log(err.message)
                }
        
                for(var i = 0; i < result.length; i++){
                    var iblock = new Date(parseInt(result[i].init))
                    var fblock = new Date(parseInt(result[i].finish))
        
                    if(iblock.getTime() >= confirm_date.getTime() + 86400000 && iblock <= finish_date.getTime() + 86400000){
                        block_date = true
                        break
                    }
        
                    if(confirm_date.getTime() + 86400000 >= iblock.getTime() && confirm_date.getTime() + 86400000 <= fblock.getTime()){
                        block_date = true
                        break
                    }
                }
        
                if(block_date){
                    return res.render('admin/date_create', {erro: 'Reservas indisponíveis para a data escolhida!'})
                }
        
                connect.query(sql, function(err, result){
                    if(err){
                        return console.log(err.message)
                    }
            
                    for(var i = 0; i < result.length; i++){
                        var cachedate = new Date(parseInt(result[i].dateres))
                        var fdate = new Date(parseInt(result[i].datef))
                        console.log(cachedate)

                        if(cachedate.getTime() >= confirm_date.getTime() + 86400000 && cachedate.getTime() <= finish_date.getTime() + 86400000){
                            if(result[i].type == 1 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_one = 'Pendente'
                                    combo_type = 'Pendente'
                                } else {
                                    type_one = 'Indisponível'
                                    combo_type = 'Indisponível'
                                }
                            }
                
                            if(result[i].type == 2 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_two = 'Pendente'
                                    combo_type = 'Pendente'
                                } else {
                                    type_two = 'Indisponível'
                                    combo_type = 'Indisponível'
                                }
                            }
                
                            if(result[i].type == 3 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_tree = 'Pendente'
                                } else {
                                    type_tree = 'Indisponível'
                                }
                                break
                            }
                        }
            
                        if(confirm_date.getTime() + 86400000 >= cachedate.getTime() && confirm_date.getTime() + 86400000 <= fdate.getTime()){
                            if(result[i].type == 1 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_one = 'Pendente'
                                    combo_type = 'Pendente'
                                } else {
                                    type_one = 'Indisponível'
                                    combo_type = 'Indisponível'
                                }
                            }
                
                            if(result[i].type == 2 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_two = 'Pendente'
                                    combo_type = 'Pendente'
                                } else {
                                    type_two = 'Indisponível'
                                    combo_type = 'Indisponível'
                                }
                            }
                
                            if(result[i].type == 3 && result[i].auth <= 2){
                                if(result[i].auth == 1){
                                    type_tree = 'Pendente'
                                } else {
                                    type_tree = 'Indisponível'
                                }
                                break
                            }
                        }
                    }
            
                    if(type_tree == 'indisponível'){
                        return res.render('admin/date_create', {erro: 'Reservas indisponíveis para a data escolhida!'})
                    }
            
                    if(type_one == 'indisponível' && type_two == 'indisponível'){
                        return res.render('admin/date_create', {erro: 'Reservas indisponíveis para a data escolhida!'})
                    }
                    req.session.finish_date = req.body.fdate
                    req.session.bookingdate = req.body.idate
                    res.render('admin/salonavaliable', {erro: '', typeone: type_one, typetwo: type_two, combotype: combo_type})
                })
            })
        })
    })
});

app.get('/createreserve', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

    connect.query(sql, [req.session.user], function(err, result){
        if(err){
            return console.log(err.message)
        }

        if(!result[0]){
            return res.redirect('login')
        }

        if(req.session.key != result[0].voucher){
            return res.redirect('/login')
        }

        connect.query(sql2, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true 
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            res.render('admin/date_create', {erro: ''})
        })
    })
});

app.get('/admin/view_users/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_Id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM address WHERE user_id=?`
    var sql5 = `SELECT * FROM reservations WHERE user_id=?`
    var admin = false

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

            connect.query(sql3, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin'){
                        admin = true
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql2, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.redirect('/login')
                    }

                    var name =  result[0].name 
                    var firstname =  result[0].firstname

                    connect.query(sql2, [req.params.id], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        if(!result[0]){
                            return res.redirect('/users')
                        }

                        connect.query(sql4, [req.params.id], function(err, result2){
                            if(err){
                                return console.log(err.message)
                            }

                            if(result2[0]){
                                var convert_address = `Rua ${result2[0].street}, N° ${result2[0].number}, ${result2[0].district} ${result2[0].complement}, ${result2[0].cep}, ${result2[0].city} - ${result2[0].state}`

                                connect.query(sql5, [req.params.id], function(err, result3){
                                    var cachereserves = ``
                                    if(err){
                                        return console.log(err.message)
                                    }

                                    for(var i = 0; i < result3.length; i++){
                                        if(i < result3.length - 1){
                                            cachereserves += `${result3[i].id}, `
                                        } else {
                                            cachereserves += `${result3[i].id}` 
                                        }
                                    }

                                    res.render('admin/viewusers', {reserves: cachereserves, address: convert_address, name: name, firstname: firstname, nuser: result})
                                })
                            } else {
                                connect.query(sql5, [req.params.id], function(err, result3){
                                    var cachereserves = ``
                                    if(err){
                                        return console.log(err.message)
                                    }

                                    for(var i = 0; i < result3.length; i++){
                                        if(i < result3.length - 1){
                                            cachereserves += `${result3[i].id}, `
                                        } else {
                                            cachereserves += `${result3[i].id}` 
                                        }
                                    }
                                    res.render('admin/viewusers', {reserves: cachereserves, address: '', name: name, firstname: firstname, nuser: result})
                                })
                            }

                            
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/to_remove_admin/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `DELETE FROM permissions WHERE user_id=?`
    var admin = false

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

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin'){
                        admin = true
                        break
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql2, [req.params.id], function(err, result2){
                    var isadmin = false
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result2.length; i++){
                        if(result[i].name == 'admin'){
                            isadmin = true
                            break
                        }
                    }

                    if(!isadmin){
                        return res.redirect('/users')
                    }

                    connect.query(sql3, [req.params.id], function(err){
                        if(err){
                            return console.log(err.message)
                        }

                        res.redirect('/users')
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/users', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM users`
    var admin = false

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

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = true
                            break
                        }
                    }

                    if(!admin){
                        return res.redirect('/')
                    }

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        if(!req.body.search || req.body.search == undefined){
                            return res.render('admin/adminusers', {data: [], users: result, name: name, firstname: firstname})
                        }

                        connect.query(sql2, [req.body.search], function(err, result2){
                            if(err){
                                return console.log(err.message)
                            }

                            if(!result[0]){
                                return res.render('admin/adminusers', {data: [], users: result, name: name, firstname: firstname})
                            }

                            res.render('admin/adminusers', {data: result2, users: result, name: name, firstname: firstname})
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/promote_admin/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `INSERT INTO permissions (name, user_id) VALUES ('admin', ?)`
    var admin = false

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

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin'){
                        admin = true
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql2, [req.params.id], function(err, result){
                    var isadmin = false
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            isadmin = true
                        }
                    }

                    if(isadmin){
                        return res.redirect('/users')
                    }

                    connect.query(sql3, [req.params.id], function(err){
                        if(err){
                            return console.log(err.message)
                        }

                        res.redirect('/users')
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/users', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM users`
    var admin = false

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

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = true
                            break
                        }
                    }

                    if(!admin){
                        return res.redirect('/')
                    }

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        res.render('admin/adminusers', {data: [], users: result, name: name, firstname: firstname})
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/reserves', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE id=?`
    var sql4 = `SELECT * FROM reservations`
    var sql5 = `SELECT * FROM reservations WHERE id=?`
    var sql6 = `SELECT * FROM block_date`
    var admin = false
    var dataresult = []
    var block_date = []

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/admin')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    if(result[0].name == 'admin'){
                        admin = true
                        break
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql3, [req.session.user],  function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.redirect('/login')
                    }

                    var name = result[0].name
                    var firstname = result[0].firstname

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        for(var i = 0; i < result.length; i++){
                            var converttype = ''
                            var convertstatus = ''
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
                                convertstatus = 'Aguardando'
                                badgetype = 'badge-warning'
                            }
                            if(result[i].auth == 2){
                                convertstatus = 'Aprovado'
                                badgetype = 'badge-success'
                            }
                            if(result[i].auth == 3){
                                convertstatus = 'Expirado'
                                badgetype = 'badge-danger'
                            }
                            if(result[i].auth == 4){
                                convertstatus = 'Finalizado'
                                badgetype = 'badge-secondary'
                            }

                            var convertdate = new Date(parseInt(result[i].dateres))
                            var fdate = new Date(parseInt(result[i].datef))
                            var convertdate = `${convertdate.getDate()}/${convertdate.getMonth() + 1}/${convertdate.getFullYear()}`
                            fdate = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                            var cachedata = {fdate: fdate, badge: badgetype, name: name, firstname: firstname, id: result[i].id, user_id: result[i].user_id, type: converttype, date: convertdate, status: convertstatus}
                            dataresult.push(cachedata)
                        }

                        if(req.body.search && req.body.search != undefined){
                            connect.query(sql5, [req.body.search], function(err, result){
                                var converttype2 = ''
                                var convertstatus2 = ''
                                var badgetype2 = ''
                                if(err){
                                    return console.log(err.message)
                                }

                                if(!result[0]){
                                    return res.render('admin/reserves', {data: [], all: dataresult, name: name, firstname: firstname})
                                }

                                if(result[0].type == 1){
                                    converttype2 = 'Adulto'
                                }
                                if(result[0].type == 2){
                                    converttype2 = 'Kids'
                                }
                                if(result[0].type == 3){
                                    converttype2 = 'Combo'
                                }

                                if(result[0].auth == 1){
                                    convertstatus2 = 'Aguardando'
                                    badgetype2 = 'badge-warning'
                                }
                                if(result[0].auth == 2){
                                    convertstatus2 = 'Aprovado'
                                    badgetype2 = 'badge-success'
                                }
                                if(result[0].auth == 3){
                                    convertstatus2 = 'Expirado'
                                    badgetype2 = 'badge-danger'
                                }
                                if(result[0].auth == 4){
                                    convertstatus2 = 'Finalizado'
                                    badgetype2 = 'badge-secondary'
                                }

                                connect.query(sql6, function(err, result2){
                                    if(err){
                                        return console.log(err.message)
                                    }
        
                                    for(var i = 0; i < result2.length; i++){
                                        var init = new Date(parseInt(result2[i].init))
                                        var finish = new Date(parseInt(result2[i].finish))
                                        
                                        init = `${init.getDate()}/${init.getMonth() +1}/${init.getFullYear()}`
                                        finish = `${finish.getDate()}/${finish.getMonth() +1}/${finish.getFullYear()}`
                                        var block_temp = {finish: finish, init: init, id: result2[i].id}
                                        block_date.push(block_temp)
                                    }

                                    var convertdate2 = new Date(parseInt(result[0].dateres))
                                    var fdate2 = new Date(parseInt(result[0].datef))
                                    convertdate2 = `${convertdate2.getDate()}/${convertdate2.getMonth() + 1}/${convertdate2.getFullYear()}`
                                    fdate2 = `${fdate2.getDate()}/${fdate2.getMonth() + 1}/${fdate2.getFullYear()}`
                                    var cachedata2 = {fdate: fdate2, id: result[0].id, user_id: result[0].user_id, type: converttype2, date: convertdate2, status: convertstatus2, badge: badgetype2}
                                    res.render('admin/reserves', {block_date: block_date, data: cachedata2, all: dataresult, name: name, firstname: firstname})
                                })
                            })
                        } else {
                            res.render('admin/reserves', {block_date: block_date, data: [], all: dataresult, name: name, firstname: firstname})
                        }
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/delete/block_date/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `DELETE FROM block_date WHERE id=?`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            connect.query(sql3, [req.params.id], function(err){
                if(err){
                    return console.log(err.message)
                }

                return res.redirect('/reserves')
            })
        })
    })
})

app.post('/admin/add/block_date', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `INSERT INTO block_date (init, finish) VALUES (?,?)`
    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

    connect.query(sql, [req.session.user], function(err, result){
        if(err){
            return console,log(err.message)
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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            var init = new Date(req.body.init)
            var finish = new Date(req.body.finish)
            connect.query(sql3, [init.getTime() + 86400000, finish.getTime() + 86400000], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/reserves')
            })
        })
    })
})

app.get('/reserves', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE id=?`
    var sql4 = `SELECT * FROM reservations`
    var sql5 = `SELECT * FROM block_date`
    var admin = false
    var dataresult = []
    var block_date = []

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/admin')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    if(result[0].name == 'admin'){
                        admin = true
                        break
                    }
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql3, [req.session.user],  function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.redirect('/login')
                    }

                    var name = result[0].name
                    var firstname = result[0].firstname

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        for(var i = 0; i < result.length; i++){
                            var converttype = ''
                            var convertstatus = ''
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
                                convertstatus = 'Aguardando'
                                badgetype = 'badge-warning'
                            }
                            if(result[i].auth == 2){
                                convertstatus = 'Aprovado'
                                badgetype = 'badge-success'
                            }
                            if(result[i].auth == 3){
                                convertstatus = 'Expirado'
                                badgetype = 'badge-danger'
                            }
                            if(result[i].auth == 4){
                                convertstatus = 'Finalizado'
                                badgetype = 'badge-secondary'
                            }

                            var convertdate = new Date(parseInt(result[i].dateres))
                            var fdate = new Date(parseInt(result[i].datef))
                            var convertdate = `${convertdate.getDate()}/${convertdate.getMonth() + 1}/${convertdate.getFullYear()}`
                            fdate = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                            var cachedata = {fdate: fdate, badge: badgetype, name: name, firstname: firstname, id: result[i].id, user_id: result[i].user_id, type: converttype, date: convertdate, status: convertstatus}
                            dataresult.push(cachedata)
                        }

                        connect.query(sql5, function(err, result){
                            if(err){
                                return console.log(err.message)
                            }

                            for(var i = 0; i < result.length; i++){
                                var init = new Date(parseInt(result[i].init))
                                var finish = new Date(parseInt(result[i].finish))
                                
                                init = `${init.getDate()}/${init.getMonth() +1}/${init.getFullYear()}`
                                finish = `${finish.getDate()}/${finish.getMonth() +1}/${finish.getFullYear()}`
                                var block_temp = {finish: finish, init: init, id: result[i].id}
                                block_date.push(block_temp)
                            }

                            res.render('admin/reserves', {block_date: block_date, data: [], all: dataresult, name: name, firstname: firstname})
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/admin/edit/value/:day', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql_monday = `UPDATE values_reserve SET monday=?`
    var sql_tuesday = `UPDATE values_reserve SET tuesday=?`
    var sql_wednesday = `UPDATE values_reserve SET wednesday=?`
    var sql_thursday = `UPDATE values_reserve SET thursday=?`
    var sql_friday = `UPDATE values_reserve SET friday=?`
    var sql_saturday = `UPDATE values_reserve SET saturday=?`
    var sql_sunday = `UPDATE values_reserve SET sunday=?`

    var sql_monday_temp = `UPDATE values_reserve_temp SET monday=?`
    var sql_tuesday_temp = `UPDATE values_reserve_temp SET tuesday=?`
    var sql_wednesday_temp = `UPDATE values_reserve_temp SET wednesday=?`
    var sql_thursday_temp = `UPDATE values_reserve_temp SET thursday=?`
    var sql_friday_temp = `UPDATE values_reserve_temp SET friday=?`
    var sql_saturday_temp = `UPDATE values_reserve_temp SET saturday=?`
    var sql_sunday_temp = `UPDATE values_reserve_temp SET sunday=?`

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

            if(req.params.day == 'monday'){
                if(!req.body.monday || req.body.monday == undefined){
                    return
                }
                connect.query(sql_monday, [req.body.monday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_monday_temp, [req.body.monday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            if(req.params.day == 'tuesday'){
                if(!req.body.tuesday || req.body.tuesday == undefined){
                    return
                }
                connect.query(sql_tuesday, [req.body.tuesday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_tuesday_temp, [req.body.tuesday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            if(req.params.day == 'wednesday'){
                if(!req.body.wednesday || req.body.wednesday == undefined){
                    return
                }
                connect.query(sql_wednesday, [req.body.wednesday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_wednesday_temp, [req.body.wednesday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

            }

            if(req.params.day == 'thursday'){
                if(!req.body.thursday || req.body.thursday == undefined){
                    return
                }
                connect.query(sql_thursday, [req.body.thursday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_thursday_temp, [req.body.thursday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            if(req.params.day == 'friday'){
                if(!req.body.friday || req.body.friday == undefined){
                    return
                }
                connect.query(sql_friday, [req.body.friday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_friday_temp, [req.body.friday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            if(req.params.day == 'saturday'){
                if(!req.body.saturday || req.body.saturday == undefined){
                    return
                }
                connect.query(sql_saturday, [req.body.saturday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_saturday_temp, [req.body.saturday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            if(req.params.day == 'sunday'){
                if(!req.body.sunday || req.body.sunday == undefined){
                    return
                }
                connect.query(sql_sunday, [req.body.sunday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })

                connect.query(sql_sunday_temp, [req.body.sunday], function(err){
                    if(err){
                        return console.log(err.message)
                    }
                })
            }

            res.redirect('/values')
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/delete/value_temp/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `DELETE FROM values_temp WHERE id=?`

    var admin = false

    if(!req.session.key || req.session.key == undefined){
        return res.redirect('/login')
    }

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

            for(var i = 0; i < result.length; i++){
                if(result[i].name == 'admin'){
                    admin = true
                    break
                }
            }

            if(!admin){
                return res.redirect('/')
            }

            connect.query(sql3, [parseInt(req.params.id)], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/values')
            })
        })
    })
})

app.get('/values', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM permissions WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE id=?`
    var sql4 = `SELECT * FROM values_reserve`
    var sql5 = `SELECT * FROM values_temp`

    var admin = false

    var values_data = []

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                console.log(err.message)
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
                    return res.redirect('/')
                }

                for(var i = 0; i < result.length; i++){
                    if(result[i].name == 'admin')
                    admin = true
                    break
                }

                if(!admin){
                    return res.redirect('/')
                }

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.redirect('/login')
                    }

                    var name = result[0].name
                    var firstname = result[0].firstname

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        connect.query(sql5, function(err, result2){
                            if(err){
                                return console.log(err.message)
                            }

                            for(var i = 0; i < result2.length; i++){
                                var date_from = new Date(result2[i].init*100000)
                                var date_to = new Date(result2[i].finish*100000)
                                var value = result2[i].value_temp

                                date_from = `${date_from.getDate() + 1}/${date_from.getMonth() + 1}/${date_from.getFullYear()}`
                                date_to = `${date_to.getDate() + 1}/${date_to.getMonth() + 1}/${date_to.getFullYear()}`
                                var values_cache = {init: date_from, finish: date_to, value: value, id: result2[i].id}
                                values_data.push(values_cache)
                            }

                            res.render('admin/valuesreserve', {values_temp: values_data, name: name, firstname: firstname, values: result})
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('login')
    }
});

app.get('/admin/view/reserve/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM reservations WHERE id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var admin = false
    var newdate = new Date()
    var nuser_data = []

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

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = true
                            break
                        }
                    }

                    if(!admin){
                        return res.redirect('/')
                    }

                    connect.query(sql4, [req.params.id], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        if(!result[0]){
                            res.redirect('/')
                        }

                        var type = ''
                        var status = ''

                        if(result[0].type == 1){
                            type = 'Adulto'
                        }
                        if(result[0].type == 2){
                            type = 'Kids'
                        }
                        if(result[0].type == 3){
                            type = 'Combo'
                        }

                        if(result[0].auth == 1){
                            status = 'Aguardando'
                        }
                        if(result[0].auth == 2){
                            status = 'Aprovado'
                        }
                        if(result[0].auth == 3){
                            status = 'Expirado'
                        }
                        if(result[0].auth == 4){
                            status = 'Finalizado'
                        }

                        var description = result[0].description
                        var id = result[0].id

                        var convertdate = new Date(result[0].dateres*100000)
                        convertdate = `${convertdate.getDate() + 1}/${convertdate.getMonth() + 1}/${convertdate.getFullYear()}`

                        connect.query(sql2, [result[0].user_id], function(err, result){
                            if(err){
                                return console.log(err.message)
                            }

                            if(result[0]){
                                var nuser_cachename = `${result[0].name} ${result[0].firstname}`
                                var nuser_id = result[0].id
                                var nuser_contact = result[0].contact
                                var nuser_email = result[0].user
                                var cache_nuser = {nuser_contact: nuser_contact, nuser_email: nuser_email, nuser_id: nuser_id, nuser_name: nuser_cachename}
                                nuser_data.push(cache_nuser)

                                connect.query(sql5, [result[0].id], function(err, result){
                                    if(err){
                                        return console.log(err.message)
                                    }

                                    if(result[0]){
                                        var convert_nuser_address = `Rua ${result[0].street}, N° ${result[0].number}, ${result[0].district} ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                                        res.render('admin/viewreserve', {nuser_address: convert_nuser_address, nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                                    } else {
                                        res.render('admin/viewreserve', {nuser_address: 'Endereço não registrado', nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                                    }
                                })
                            } else {
                                res.render('admin/editreserve', {nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                            }
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/cancel/reserve/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `UPDATE reservations SET auth=4 WHERE id=?`

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

            connect.query(sql2, [req.params.id], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/admin')
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/admin/approve/reserve/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `UPDATE reservations SET auth=2 WHERE id=?`

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

            connect.query(sql2, [req.params.id], function(err){
                if(err){
                    return console.log(err.message)
                }

                res.redirect('/admin')
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/edit/reserve/:id', (req, res) => {
    var sql = `UPDATE reservations SET type=?, dateres=?, auth=? WHERE id=?`
    var sql2 = `UPDATE reservations SET type=?, auth=? WHERE id=?`

    if(!req.body.date){
        connect.query(sql2, [req.body.type, req.body.status, req.params.id], function(err){
            if(err){
                return console.log('Erro:' + err.message)
            }
        })
        var convert_link = `/admin/edit/reserve/${req.params.id}`
        return res.redirect(convert_link)
    }

    var datenow = new Date(req.body.date)
    datenow = datenow.getTime()
     var newdatenow = datenow/100000
    connect.query(sql, [req.body.type, newdatenow, req.body.status, req.params.id], function(err){
        if(err){
            return console.log(err.message)
        }
    })
    var convert_link = `/admin/edit/reserve/${req.params.id}`
    return res.redirect(convert_link)
});

app.get('/admin/edit/reserve/:id', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM reservations WHERE id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var admin = false
    var newdate = new Date()
    var nuser_data = []

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

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = true
                            break
                        }
                    }

                    if(!admin){
                        return res.redirect('/')
                    }

                    connect.query(sql4, [req.params.id], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        if(!result[0]){
                            return res.redirect('/')
                        }

                        var description = result[0].description
                        var type = result[0].type
                        var status = result[0].auth
                        var id = result[0].id

                        var convertdate = new Date(result[0].dateres*100000)
                        convertdate = `${convertdate.getDate() + 1}/${convertdate.getMonth() + 1}/${convertdate.getFullYear()}`

                        connect.query(sql2, [result[0].user_id], function(err, result){
                            if(err){
                                return console.log(err.message)
                            }

                            if(result[0]){
                                var nuser_cachename = `${result[0].name} ${result[0].firstname}`
                                var nuser_id = result[0].id
                                var nuser_contact = result[0].contact
                                var nuser_email = result[0].user
                                var cache_nuser = {nuser_contact: nuser_contact, nuser_email: nuser_email, nuser_id: nuser_id, nuser_name: nuser_cachename}
                                nuser_data.push(cache_nuser)

                                connect.query(sql5, [result[0].id], function(err, result){
                                    if(err){
                                        return console.log(err.message)
                                    }

                                    if(result[0]){
                                        var convert_nuser_address = `Rua ${result[0].street}, N° ${result[0].number}, ${result[0].district} ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                                        res.render('admin/editreserve', {nuser_address: convert_nuser_address, nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                                    } else {
                                        res.render('admin/editreserve', {nuser_address: 'Endereço não registrado', nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                                    }
                                })
                            } else {
                                res.render('admin/editreserve', {nuser: nuser_data, date: convertdate, id: id, description: description, type: type, status: status, name:name, firstname: firstname})
                            }
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
})

app.get('/admin', (req, res) => {
    var sql = `SELECT * FROM permissions WHERE user_id=?`
    var sql2 = `SELECT * FROM session WHERE user_id=?`
    var sql3 = `SELECT * FROM users WHERE id=?`
    var sql4 = `SELECT * FROM reservations`
    var sql5 = `SELECT * FROM users`

    var admin = false
    var daterecent = new Date()
    var dateday = new Date(daterecent)
    var daterecent = daterecent.getTime()
    var recentreserves = []
    var reserveday = []

    if(req.session.key && req.session.key != undefined){
        connect.query(sql2, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/login')
            }

            connect.query(sql3, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/login')
                }

                var name = result[0].name
                var firstname = result[0].firstname
                var contusers = 0
                var contpendencies = 0
                var contreserve = 0
                var contexpired = 0

                connect.query(sql, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = true
                            break
                        }
                    }

                    if(!admin){
                        return res.redirect('/')
                    }

                    connect.query(sql4, function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        contreserve = result.length

                        for(var i = 0; i < result.length; i++){
                            var dateres2 = new Date(parseInt(result[i].dateres))
                            var fdate = new Date(parseInt(result[i].datef))
                            var timedate = result[i].datereq*100000
                            var timedate = timedate + 259200000

                            if(timedate - daterecent <= 259200000 && timedate - daterecent >= 0){
                                var converttype = ''
                                var convertstatus = ''
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
                                    convertstatus = 'Aguardando'
                                    badgetype = 'badge-warning'
                                }
                                if(result[i].auth == 2){
                                    convertstatus = 'Aprovado'
                                    badgetype = 'badge-success'
                                }
                                if(result[i].auth == 3){
                                    convertstatus = 'Expirado'
                                    badgetype = 'badge-danger'
                                }
                                if(result[i].auth == 4){
                                    convertstatus = 'Finalizado'
                                    badgetype = 'badge-secondary'
                                }

                                var convertdate = `${dateres2.getDate()}/${dateres2.getMonth() + 1}/${dateres2.getFullYear()}`
                                var convert_fdate = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                                var cachereserve = {fdate: convert_fdate, type: converttype, status: convertstatus, badge: badgetype, id: result[i].id, user_id: result[i].user_id, date: convertdate}
                                recentreserves.push(cachereserve)
                            }

                            if(dateres2.getFullYear() == dateday.getFullYear() && dateres2.getMonth() == dateday.getMonth() && dateres2.getDate() + 1 == dateday.getDate() && result[i].auth <= 2){
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
                                    convertstatus = 'Aguardando'
                                    badgetype = 'badge-warning'
                                }
                                if(result[i].auth == 2){
                                    convertstatus = 'Aprovado'
                                    badgetype = 'badge-success'
                                }
                                if(result[i].auth == 3){
                                    convertstatus = 'Expirado'
                                    badgetype = 'badge-danger'
                                }
                                if(result[i].auth == 4){
                                    convertstatus = 'Finalizado'
                                    badgetype = 'badge-secondary'
                                }

                                convertdate = `${dateres2.getDate() + 1}/${dateres2.getMonth() + 1}/${dateres2.getFullYear()}`
                                reserveday = {date: convertdate, id: result[i].id, user_id: result[i].user_id, type: converttype, status: convertstatus, badge: badgetype}
                            }

                            if(result[i].auth == 1){
                                contpendencies++
                            }

                            if(result[i].auth == 3){
                                contexpired++
                            }
                        }

                        connect.query(sql5, function(err, result){
                            if(err){
                                return console.log(err.message)
                            }

                            contusers = result.length
                            res.render('admin/adminpanel', {reserveday: reserveday, data: recentreserves, expired: contexpired, pendencies: contpendencies, contusers: contusers, contreserve: contreserve, name: name, firstname: firstname})
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/my_reservations', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM reservations WHERE id=?`
    var sql5 = `SELECT * FROM reservations WHERE user_id=?`
    var dataresult = []
    var dataresult2 = []

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
                var admin = ''
                var dataresult = []
                var converttype = ''
                var convertstatus = ''
                var badgetype = ''

                connect.query(sql5, [req.session.user], function(err, result){
                    
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        var converttype2 = ''
                        var convertstatus2 = ''
                        var badgetype2 = ''
                        var date = new Date(parseInt(result[i].dateres))
                        var fdate = new Date(parseInt(result[i].datef))

                        if(result[i].type == 1){
                            converttype2 = 'Adulto'
                        }
                        if(result[i].type == 2){
                            converttype2 = 'Kids'
                        }
                        if(result[i].type == 3){
                            converttype2 = 'Combo'
                        }

                        if(result[i].auth == 1){
                            convertstatus2 = 'Aguardando'
                            badgetype2 = 'badge-warning'
                        }
                        if(result[i].auth == 2){
                            convertstatus2 = 'Aprovado'
                            badgetype2 = 'badge-success'
                        }
                        if(result[i].auth == 3){
                            convertstatus2 = 'Expirado'
                            badgetype2 = 'badge-danger'
                        }
                        if(result[i].auth == 4){
                            convertstatus2 = 'Finalizado'
                            badgetype2 = 'badge-secondary'
                        }

                        var dateconvert2 = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        var dateconvert2f = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                        var cachereserve2 = {datef: dateconvert2f, id: result[i].id, type: converttype2, date: dateconvert2, status: convertstatus2, badge: badgetype2}
                        dataresult2.push(cachereserve2)
                    }
                })

                if(req.body.search){
                    var search_id = parseInt(req.body.search)
                    connect.query(sql4, [search_id], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }

                        if(result[0]){
                            if(result[0].type == 1){
                                converttype = 'Adulto'
                            }

                            if(result[0].type == 2){
                                converttype = 'Kids'
                            }

                            if(result[0].type == 3){
                                converttype = 'Combo'
                            }

                            if(result[0].auth == 1){
                                convertstatus = 'Aguardando'
                                badgetype = 'badge-warning'
                            }

                            if(result[0].auth == 2){
                                convertstatus = 'Aprovado'
                                badgetype = 'badge-success'
                            }

                            if(result[0].auth == 3){
                                convertstatus = 'Expirado'
                                badgetype = 'badge-danger'
                            }

                            if(result[0].auth == 4){
                                convertstatus = 'Finalizado'
                                badgetype = 'badge-secondary'
                            }
                            
                            var date = new Date(parseInt(result[0].dateres))
                            var fdate = new Date(parseInt(result[0].datef))
                            var dateconvertf = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                            var dateconvert = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                            dataresult = {datef: dateconvertf, status: convertstatus, badge: badgetype, id: result[0].id, type: converttype, date: dateconvert}
                        }

                        connect.query(sql3, [req.session.user], function(err, result){
                            if(err){
                                return console.log(err.message)
                            }
        
                            if(result[0]){
                                for(var i = 0; i < result.length; i++){
                                    if(result[i].name == 'admin'){
                                        admin = 'on'
                                        break
                                    }
                                }
                            }
                            res.render('user/myreservations', {data2: dataresult2, data: dataresult, name: name, firstname: firstname, admin: admin})
                        })
                    })
                } else {
                    connect.query(sql3, [req.session.user], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }
    
                        if(result[0]){
                            for(var i = 0; i < result.length; i++){
                                if(result[i].name == 'admin'){
                                    admin = 'on'
                                    break
                                }
                            }
                            console.log(admin)
                        }
                        res.render('user/myreservations', {data2: dataresult2, data: dataresult, name: name, firstname: firstname, admin: admin})
                    })
                }

                
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/my_reservations', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `SELECT * FROM reservations WHERE user_id=?`
    var dataresult2 = []

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
                var admin = ''

                connect.query(sql4, [req.session.user], function(err, result){
                    
                    if(err){
                        return console.log(err.message)
                    }

                    for(var i = 0; i < result.length; i++){
                        var converttype = ''
                        var convertstatus = ''
                        var badgetype = ''
                        var date = new Date(parseInt(result[i].dateres))
                        var fdate = new Date(parseInt(result[i].datef))

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
                            convertstatus = 'Aguardando'
                            badgetype = 'badge-warning'
                        }
                        if(result[i].auth == 2){
                            convertstatus = 'Aprovado'
                            badgetype = 'badge-success'
                        }
                        if(result[i].auth == 3){
                            convertstatus = 'Expirado'
                            badgetype = 'badge-danger'
                        }
                        if(result[i].auth == 4){
                            convertstatus = 'Finalizado'
                            badgetype = 'badge-secondary'
                        }

                        var dateconvert = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        var dateconvertf = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                        var cachereserve = {datef: dateconvertf, id: result[i].id, type: converttype, date: dateconvert, status: convertstatus, badge: badgetype}
                        dataresult2.push(cachereserve)
                    }
                })

                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(result[0]){
                        for(var i = 0; i < result.length; i++){
                            if(result[i].name == 'admin'){
                                admin = 'on'
                                break
                            }
                        }
                    }
                    res.render('user/myreservations', {data2: dataresult2, data: [], name: name, firstname: firstname, admin: admin})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/logout', (req, res) =>{
    req.session.user = 0
    req.sessionID.key = 0
    res.redirect('/')
});

app.post('/changedata', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `UPDATE address SET street=?, number=?, complement=?, district=?, cep=?, city=?, state=? WHERE user_id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var sql6 = `INSERT INTO address (user_id, street, number, complement, district, cep, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    var sql7 = `UPDATE users SET name=?, firstname=?, rg=?, cpf=?, genre=?, marital=?, user=?, contact=? WHERE id=?`


    var name = req.body.name
    var firstname = req.body.firstname
    var rg = String(req.body.rg)
    var cpf = String(req.body.cpf)
    var genre = req.body.genre
    var marital = req.body.marital
    var street = req.body.street
    var number = ''
    var complement = ''
    var cep = req.body.cep
    var city = req.body.city
    var state = req.body.state
    var user = req.body.email
    var district = req.body.district
    var contact = String(req.body.contact)

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                res.redirect('/login')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/login')
                }

                connect.query(sql5, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(req.body.number){
                        number = req.body.number
                    }

                    if(req.body.complement){
                        complement = req.body.complement
                    }

                    connect.query(sql7, [name, firstname, rg, cpf, genre, marital, user, contact, req.session.user], function(err){
                        if(err)
                        return console.log(err.message)
                    })

                    if(result[0]){
                        connect.query(sql4, [street, number, complement, district, cep, city, state, req.session.user], function(err){
                            if(err){
                                return console.log(err.message)
                            }
                        })

                        res.redirect('/painel')
                        return
                    }

                    connect.query(sql6, [req.session.user, street, number, complement, district, cep, city, state])
                    res.redirect('/painel')
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/changedataorc', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`
    var sql4 = `UPDATE address SET street=?, number=?, complement=?, district=?, cep=?, city=?, state=? WHERE user_id=?`
    var sql5 = `SELECT * FROM address WHERE user_id=?`
    var sql6 = `INSERT INTO address (user_id, street, number, complement, district, cep, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    var sql7 = `UPDATE users SET name=?, firstname=?, rg=?, cpf=?, genre=?, marital=?, user=?, contact=? WHERE id=?`


    var name = req.body.name
    var firstname = req.body.firstname
    var rg = String(req.body.rg)
    var cpf = String(req.body.cpf)
    var genre = req.body.genre
    var marital = req.body.marital
    var street = req.body.street
    var number = ''
    var complement = ''
    var cep = req.body.cep
    var city = req.body.city
    var state = req.body.state
    var user = req.body.email
    var district = req.body.district
    var contact = String(req.body.contact)

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('/login')
            }

            if(req.session.key != result[0].voucher){
                res.redirect('/login')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('/login')
                }

                connect.query(sql5, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(req.body.number){
                        number = req.body.number
                    }

                    if(req.body.complement){
                        complement = req.body.complement
                    }

                    connect.query(sql7, [name, firstname, rg, cpf, genre, marital, user, contact, req.session.user], function(err){
                        if(err)
                        return console.log(err.message)
                    })

                    if(result[0]){
                        connect.query(sql4, [street, number, complement, district, cep, city, state, req.session.user], function(err){
                            if(err){
                                return console.log(err.message)
                            }
                        })

                        res.redirect('/bookingdate')
                        return
                    }

                    connect.query(sql6, [req.session.user, street, number, complement, district, cep, city, state])
                    res.redirect('/bookingdate')
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/change_data', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`

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
                    return console,log(err.message)
                }
    
                if(!result[0]){
                    return res.redirect('/login')
                }
    
                var name = result[0].name
                var firstname = result[0].firstname
                var admin = ''
    
                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }
    
                    if(!result[0]){
                        return res.render('user/changedata', {erro: '', name: name, firstname: firstname, admin: admin})
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = 'on'
                            break
                        }
                    }

                    res.render('user/changedata', {erro: '', name: name, firstname: firstname, admin, admin})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.get('/change_data_orc', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM permissions WHERE user_id=?`

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
                    return console,log(err.message)
                }
    
                if(!result[0]){
                    return res.redirect('/login')
                }
    
                var name = result[0].name
                var firstname = result[0].firstname
                var admin = ''
    
                connect.query(sql3, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }
    
                    if(!result[0]){
                        return res.render('user/changedataorc', {erro: '', name: name, firstname: firstname, admin: admin})
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = 'on'
                            break
                        }
                    }

                    res.render('user/changedataorc', {erro: '', name: name, firstname: firstname, admin, admin})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

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
                var country = result[0].nationality
                var email = result[0].user
                var rg = result[0].rg
                var cpf = result[0].cpf
                var marital = result[0].marital
                var genre = ''
                var admin = ''
                var address = ''
                var confirmaddress = ''

                if(result[0].genre == 'M'){
                    genre = 'Masculino'
                }

                if(result[0].genre == 'F'){
                    genre = 'Feminino'
                }

                connect.query(sql4, [req.session.user], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    if(!result[0]){
                        return res.render('user/mydatas', {admin:admin, name: name, firstname: firstname, confirmaddress: confirmaddress})
                    }

                    confirmaddress = 'on'
                    address = `Rua ${result[0].street}, N° ${result[0].number}, ${result[0].district} ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                    
                    connect.query(sql3, [req.session.user], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }
    
                        if(!result[0]){
                            return res.render('user/mydatas', {confirmaddress: confirmaddress, marital: marital, genre: genre, cpf: cpf, rg: rg, email: email, country: country, address: address, admin: admin, name: result,  firstname: firstname})
                        }
    
                        for(var i = 0; i < result.length; i++){
                            if(result[i].name == 'admin'){
                                admin = 'on'
                                break
                            }
                        }
    
                        res.render('user/mydatas', {confirmaddress: confirmaddress, marital: marital, genre: genre, cpf: cpf, rg: rg, email: email, country: country, address: address, admin: admin, name: name, firstname: firstname})
                    })
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

                        var date_reserves = new Date(parseInt(result[i].dateres))
                        var fdate = new Date(parseInt(result[i].datef))
                        var datereserves_convert = `${date_reserves.getDate()}/${date_reserves.getMonth() + 1}/${date_reserves.getFullYear()}`
                        var convert_fdate = `${fdate.getDate()}/${fdate.getMonth() + 1}/${fdate.getFullYear()}`
                        var cachereserve = {fdate: convert_fdate, id: result[i].id, status: statustype, type: converttype, date: datereserves_convert, badge: badgetype}
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
                        return res.render('admin/panel', {address: address, country: country, reserves: contreserves, name: name, firstname: firstname, admin: admin, datas: datareserves})
                    }

                    for(var i = 0; i < result.length; i++){
                        if(result[i].name == 'admin'){
                            admin = 'on'
                            break
                        }
                    }

                    res.render('admin/panel', {address: address, country: country, reserves: contreserves, name: name, firstname: firstname, admin: admin, datas: datareserves})
                })
            })
        })
    } else {
        res.redirect('/login')
    }
});

app.post('/data', (req,res) => {
    var sql = `SELECT * FROM reservations WHERE type=?`
    var sql2 = `SELECT * FROM reservations`
    var date = new Date(req.session.bookingdate)
    var finish_date = new Date(req.session.finish_date)
    var dateconvert = date.getTime() + 86400000
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
                    var convertdateres = parseInt(result[i].dateres)
                    var fdate = parseInt(result[i].datef)
                    if(convertdateres >= date.getTime() + 86400000 && convertdateres <= finish_date.getTime() + 86400000 && result[i].auth <= 2){
                        return res.render('reserves/date_reserve', {erro: 'Indisponível para a data escolhida!'})
                        break
                    }

                    if(date.getTime() + 86400000 >= convertdateres && date.getTime() + 86400000 <= fdate && result[i].auth <= 2){
                        return res.render('reserves/date_reserve', {erro: 'Indisponível para a data escolhida!'})
                        break
                    }
                }
    
                req.session.bookingtype = req.body.bookingtype
                res.render('reserves/typeevent', {erro: ''})
            })

        } else {
            connect.query(sql2, function(err, result){
                if(err){
                    console.log(err.message)
                }

                for(var i = 0; i < result.length; i++){
                    var date_reserve = new Date(parseInt(result[i].dateres) + 86400000)

                    if(date_reserve.getTime() >= date.getTime() && date_reserve.getTime() <= finish_date.getTime()  && result[i].auth <= 2){
                        return res.render('reserves/date_reserve', {erro: 'Indisponível para a data escolhida!'})
                        break
                    }
                }

                res.render('reserves/typeevent', {erro: ''})
            })
        }
    } else {
        res.render('reserves/date_reserve', {erro: 'Data inválida!'})
    }
});

app.get('/finish_reserve', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM users WHERE id=?`
    var sql3 = `SELECT * FROM address WHERE user_id=?`
    var sql4 = `INSERT INTO reservations (datef, type, user_id, auth, timepag, dateres, datereq, description) VALUES (?, ?, ?, 1, ?, ?, ?, ?)`
    var date = new Date()
    var date = new Date(date)
    var timepag = date.getTime() + 86400000
    timepag = timepag/100000

    if(req.session.key && req.session.key != undefined){
        if(!req.session.typeevent || req.session.typeevent == undefined){
            return res.redirect('/')
        }

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
                    return res.redirect('/')
                }

                var convertname = `${result[0].name} ${result[0].firstname}`
                var convertemail = result[0].user
                var convertID = result[0].id

                var dateres = new Date(req.session.bookingdate)
                var datef = new Date(req.session.finish_date)
                var convertdateres = `${dateres.getDate() + 1}/${dateres.getMonth() + 1}/${dateres.getFullYear()}`
                var convertdatef = `${datef.getDate() + 1}/${datef.getMonth() + 1}/${datef.getFullYear()}`
                dateres = dateres.getTime() + 86400000
                datef = datef.getTime() + 86400000
                var datereq = date.getTime()/100000

                connect.query(sql4, [datef, req.session.bookingtype, result[0].id, timepag, dateres, datereq, req.session.descriptionreserve], function(err, result){
                    if(err){
                        return console.log(err.message)
                    }

                    var IDinsert = result.insertId

                    connect.query(sql3, [req.session.user], function(err, result){
                        if(err){
                            return console.log(err.message)
                        }
    
                        if(!result[0]){
                            return res.redirect('/')
                        }
    
                        var convertdate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        var convertaddress = `${result[0].street}, ${result[0].number}, ${result[0].district}, ${result[0].complement}, ${result[0].cep}, ${result[0].city} - ${result[0].state}`
                        var converttype = ''

                        if(req.session.bookingtype == 1){
                            converttype = 'Adulto'
                        }
                        if(req.session.bookingtype == 2){
                            converttype = 'Kids'
                        }
                        if(req.session.bookingtype == 3){
                            converttype = 'Combo'
                        }

                        res.render('reserves/finishreserve', {datef: convertdatef, subtotal: req.session.valuesess, description:req.session.descriptionreserve, type: converttype, dateres: convertdateres, user_id: convertID, ID: IDinsert, datereq: convertdate, name: convertname, address: convertaddress, email: convertemail})
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
    }
})

app.post('/confirm_reserve', (req, res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var dateconfirm = new Date(req.session.bookingdate)
    var nextday = new Date(dateconfirm.getTime() + 86400000)
    var dateconfirm = `${dateconfirm.getDate() + 1}/${dateconfirm.getMonth() +1}/${dateconfirm.getFullYear()}`
    var nextday = `${nextday.getDate() + 1}/${nextday.getMonth() + 1}/${nextday.getFullYear()}`
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

            req.session.descriptionreserve = req.body.description
            res.render('reserves/termsreserve')
        })
    } else {
        res.redirect('login')
    }
})

app.post('/bookingdate', (req, res) => {
    var date = new Date()
    var confirm_date = new Date(req.body.idate)
    var finish_date = new Date(req.body.fdate)
    var valid_date = date.getTime() - confirm_date.getTime()
    var sql = `SELECT * FROM reservations`
    var sql2 = `SELECT * FROM block_date`
    var type_one = ''
    var type_two = ''
    var type_tree = ''
    var combo_type = ''

    if(valid_date > 0){
        return res.render('reserves/date_reserve', {erro: 'Data inválida!'})
    }

    connect.query(sql2, function(err, result){
        var block_date = false
        if(err){
            return console.log(err.message)
        }

        for(var i = 0; i < result.length; i++){
            var iblock = new Date(parseInt(result[i].init))
            var fblock = new Date(parseInt(result[i].finish))

            if(iblock.getTime() >= confirm_date.getTime() + 86400000 && iblock <= finish_date.getTime() + 86400000){
                block_date = true
                break
            }

            if(confirm_date.getTime() + 86400000 >= iblock.getTime() && confirm_date.getTime() + 86400000 <= fblock.getTime()){
                block_date = true
                break
            }
        }

        if(block_date){
            return res.render('reserves/date_reserve', {erro: 'Reservas indisponíveis para a data escolhida!'})
        }

        connect.query(sql, function(err, result){
            if(err){
                return console.log(err.message)
            }
    
            for(var i = 0; i < result.length; i++){
                var cachedate = new Date(parseInt(result[i].dateres))
                var fdate = new Date(parseInt(result[i].datef))
    
                if(cachedate.getTime() >= confirm_date.getTime() + 86400000 && cachedate.getTime() <= finish_date.getTime() + 86400000){
                    if(result[i].type == 1 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_one = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_one = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 2 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_two = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_two = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 3 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_tree = 'Pendente'
                        } else {
                            type_tree = 'Indisponível'
                        }
                        break
                    }
                }
    
                if(confirm_date.getTime() + 86400000 >= cachedate.getTime() && confirm_date.getTime() + 86400000 <= fdate.getTime()){
                    if(result[i].type == 1 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_one = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_one = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 2 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_two = 'Pendente'
                            combo_type = 'Pendente'
                        } else {
                            type_two = 'Indisponível'
                            combo_type = 'Indisponível'
                        }
                    }
        
                    if(result[i].type == 3 && result[i].auth <= 2){
                        if(result[i].auth == 1){
                            type_tree = 'Pendente'
                        } else {
                            type_tree = 'Indisponível'
                        }
                        break
                    }
                }
            }
    
            if(type_tree == 'indisponível'){
                return res.render('reserves/date_reserve', {erro: 'Reservas indisponíveis para a data escolhida!'})
            }
    
            if(type_one == 'indisponível' && type_two == 'indisponível'){
                return res.render('reserves/date_reserve', {erro: 'Reservas indisponíveis para a data escolhida!'})
            }

            req.session.finish_date = req.body.fdate
            req.session.bookingdate = req.body.idate
            res.render('reserves/salonavaliable', {erro: '', typeone: type_one, typetwo: type_two, combotype: combo_type})
        })
    })
});

app.get('/bookingdate', (req,res) => {
    var sql = `SELECT * FROM session WHERE user_id=?`
    var sql2 = `SELECT * FROM address WHERE user_id=?`

    if(req.session.key && req.session.key != undefined){
        connect.query(sql, [req.session.user], function(err, result){
            if(err){
                return console.log(err.message)
            }

            if(!result[0]){
                return res.redirect('login')
            }

            if(req.session.key != result[0].voucher){
                return res.redirect('/login')
            }

            connect.query(sql2, [req.session.user], function(err, result){
                if(err){
                    return console.log(err.message)
                }

                if(!result[0]){
                    return res.redirect('change_data_orc')
                }

                res.render('reserves/date_reserve', {erro: ''})
            })
        })
    } else {
        res.redirect('/login')
    }
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

            res.redirect('/')
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

            res.redirect('/')
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
                    return res.redirect('/')
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
                            return res.redirect('/')
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

app.get('/', (req,res) => {
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

app.get('/devtest', (req,res) => {
    /*var date = new Date()
    var date2 = new Date(date).getTime() + 86400000

    res.send(`${String(date2/100000)}, ${String(date.getTime()/100000)}`)*/
    res.redirect('https://www.google.com')
});

//Conexão
app.listen(port, function(){
    console.log("Servidor local Online na porta " + port);
})