import express from "express"
import bodyParser, { BodyParser } from "body-parser";
var cors = require('cors')
import fs from "fs"
import { initDatabase } from "./database"
import fileupload from "express-fileupload"
import session from "express-session"

async function init() {
    const app = express()
    const port = 80
    const db = await initDatabase()

    app.use(cors())

    app.use(session({
        secret: "lfdsajgh2749024092374092173n943p8u4rx9p21875c902183740921374m9-3754c0-213659-",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false
        }
    }))

    app.use(bodyParser.json())

    app.use(express.static("./public"))
    app.use("/images", express.static("./images"))

    app.use(fileupload())

    app.get("/pessoa", async (request, response) => {
        const listaDePessoas = await db.Pessoa.listar()
        response.json(listaDePessoas)
    })

    app.get("/treino", async (request, response) => {
        const ses: any = request.session

        if(!ses.user) {
            response.status(401)
            response.json("é preciso logar-se para axecutar esta ação")
            return
        }

        const treino = await db.Treino.listar(ses.user.id_pessoa)
        response.json(treino)
    })
    
    app.get("/treino/exercicios/:id_treino", async (request, response) => {
        const exercicios = await db.Treino.listarExercicioTreino(parseInt((<any>request.params).id_treino))
        response.json(exercicios)
    })

    app.get("/pessoa/:id", async (request, response) => {
        const listaDePessoas = await db.Pessoa.listarUm(<any>request.params.id)
        response.json(listaDePessoas)
    })

    app.delete("/pessoa/:id", async (request, response) => {
        const respostaDaExecucao = await db.Pessoa.excluir(<any>request.params.id)
        response.json(respostaDaExecucao)
    })

    app.post("/pessoa", async (request, response) => {
        const respostaDaExecucao = await db.Pessoa.adicionar({
            academia: request.body.academia,
            cref: request.body.cref,
            email: request.body.email,
            nome: request.body.nome,
            senha: request.body.senha,
            telefone: request.body.telefone
        })
        response.json(respostaDaExecucao)
    })

    app.put("/pessoa/:id", async (request, response) => {
        const alteracao = await db.Pessoa.alterar(<any>request.params.id, {
            academia: request.body.academia,
            cref: request.body.cref,
            email: request.body.email,
            nome: request.body.nome,
            senha: request.body.senha,
            telefone: request.body.telefone
        })
        response.json(alteracao)
    })


    app.get("/exercicio", async (request, response) => {
        const listaDeExercicio = await db.Exercicio.listar()
        response.json(listaDeExercicio)
    })

    app.get("/exercicio/:id", async (request, response) => {
        const listaDeExercicio = await db.Exercicio.listarUm(<any>request.params.id)
        response.json(listaDeExercicio)
    })

    app.delete("/exercicio/:id", async (request, response) => {
        const respostaDoexercicio = await db.Exercicio.excluir(<any>request.params.id)
        response.json(respostaDoexercicio)
    })

    app.post("/exercicio", async (request, response) => {
        const fileName = require("crypto").randomBytes(10).toString("hex") + ".gif"
        const respostaDoexercicio = await db.Exercicio.adicionar({
            nome: request.body.nome,
            gif: fileName, // gif: request.body.gif,
            agrupamento: request.body.agrupamento

        })
        response.json(fileName)
    })


    app.post("/exercicio-gif", (req, res) => {
        const files: any = req.files
        fs.writeFileSync("./images/" + req.body["custom-filename"], files.gif.data)        
        res.json("ok")
    })

    app.put("/exercicio/:id", async (request, response) => {
        const alteracao = await db.Exercicio.alterar(<any>request.params.id, {
            nome: request.body.nome,
            gif: request.body.gif,
            agrupamento: request.body.agrupamento
        })
        response.json(alteracao)
    })


    app.post('/login', async function (request, response) {
        const responseData = await db.Pessoa.logar(request.body.email, request.body.senha)

        if (responseData == undefined) {
            response.status(404); // Not Found
            response.json({ error: "Senha ou email incorreto"});
            return
        }

        const ses: any = request.session
        ses.user = (<any>responseData)[0]

        response.json("ok")
    });

    app.post('/treino', async function (request, response) {
        const responseData = await db.Treino.adicionartreino({
            id_pessoa: request.body.idPessoa,
            tipo: request.body.tipo
        })

        const idTreinoInserido = (<any>responseData).insertId

        request.body.exercicios.forEach((exercicio: any) => {
            db.Treino.adicionarExercicioAoTreino({
                id_treino: idTreinoInserido,
                id_exercicio: exercicio.idExercicio,
                serie: exercicio.serie,
                repeticoes: exercicio.repeticoes,
            })
        })

        response.json(responseData)
    })

    // app.get('/aaa', async function (request, response) {
    //     const responseData = await db.Treino.selecionarTreino()
    //     response.json(responseData)
    // })

    const server = app.listen(port, () => console.log(`⚡  servidor iniciado na porta ${port}`))
}

init()