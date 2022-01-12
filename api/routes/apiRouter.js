const express = require('express')
let apiRouter = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const endpoint = '/'

const knex = require('knex')({
    client: 'pg',
    debug: true,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

// OUTRO 

let checkToken = (req, res, next) => {
    let authToken = req.headers["authorization"]
    if (!authToken) {
        res.status(401).json({ message: 'Token de acesso requerida' })
    }
    else {
        let token = authToken.split(' ')[0]
        req.token = token
    }
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if (err) {
            res.status(401).json({ message: 'Acesso negado' })
            return
        }
        req.usuarioId = decodeToken.id
        next()
    })
}

let isAdmin = (req, res, next) => {
    knex
        .select('*').from('usuario').where({ id: req.usuarioId })
        .then((usuarios) => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let roles = usuario.roles.split(';')
                let adminRole = roles.find(i => i === 'ADMIN')
                if (adminRole === 'ADMIN') {
                    next()
                    return
                }
                else {
                    res.status(403).json({ message: 'Role de ADMIN requerida' })
                    return
                }
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar roles de usuário - ' + err.message
            })
        })
}

apiRouter.post(endpoint + 'seguranca/register', (req, res) => {
    knex('usuario')
        .insert({
            nome: req.body.nome,
            login: req.body.login,
            senha: bcrypt.hashSync(req.body.senha, 8),
            email: req.body.email
        }, ['id'])
        .then((result) => {
            let usuario = result[0]
            res.status(200).json({ "id": usuario.id })
            return
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao registrar usuario - ' + err.message
            })
        })
})

apiRouter.post(endpoint + 'seguranca/login', (req, res) => {
    console.log(req.body.login)
    knex
        .select('*').from('usuario').where({ login: req.body.login })
        .then(usuarios => {
            if (usuarios.length) {
                let usuario = usuarios[0]
                let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
                if (checkSenha) {
                    var tokenJWT = jwt.sign({ id: usuario.id },
                        process.env.SECRET_KEY, {
                        expiresIn: 3600
                    })
                    res.status(200).json({
                        id: usuario.id,
                        login: usuario.login,
                        nome: usuario.nome,
                        roles: usuario.roles,
                        token: tokenJWT
                    })
                    return
                }
            }
            res.status(200).json({ message: 'Login ou senha incorretos' })
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao verificar login - ' + err.message
            })
        })
})

//API - PRODUTOS

apiRouter.get(endpoint + 'produtos', checkToken,(req, res) => {
    knex
        .select('*')
        .from('produto')
        .then(produtos => res.status(200).json(produtos))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

apiRouter.get(endpoint + 'produtos/:id', checkToken,(req, res) => {
    knex
        .select('*')
        .from('produto')
        .where({ id: req.params.id })
        .then(produtos => {
            if (produtos.length) {
                let produto = produtos[0]
                res.status(200).json(produto)
            } else {
                res.status(404).json({ message: "Item não localizado" })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

apiRouter.post(endpoint + 'produtos', isAdmin,(req, res) => {
    knex('produto')
        .insert({
            descricao: req.body.descricao,
            valor: req.body.valor,
            marca: req.body.marca,
            valor: req.body.valor
        }, ['id', 'descricao', 'valor', 'marca'])
        .then((result) => {
            let produto = result[0]
            res.status(200).json({
                "id": produto.id,
                "descricao": produto.descricao,
                "valor": produto.valor,
                "marca": produto.marca
            })
            return
        })
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao alterar produto - ' + err.message
            })
        })
})

apiRouter.put(endpoint + 'produtos/:id', isAdmin,(req, res) => {
    knex('produto')
        .where({ id: req.params.id })
        .update({
            descricao: req.body.descricao,
            valor: req.body.valor,
            marca: req.body.marca
        })
        .then(() => res.status(200).json({ message: "Item alterado com sucesso" }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao alterar produto - ' + err.message
            })
        })
})

apiRouter.delete(endpoint + 'produtos/:id', isAdmin,(req, res) => {
    knex('produto')
        .where({ id: req.params.id })
        .del()
        .then(() => res.status(200).json({ message: "Item excluído com sucesso" }))
        .catch(err => {
            res.status(500).json({
                message: 'Erro ao recuperar produtos - ' + err.message
            })
        })
})

module.exports = apiRouter;