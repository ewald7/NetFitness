
// importa a biblioteca `sqlite3`, que servirá de driver para acesso ao banco de dados
import mysql from "mysql2/promise"

// cria e exporta (como item da biblioteca) a função assíncrona `initdatabase`, responsável por conectar-se, criar 
// a tabelas se necessário e manipular dados no banco de dados, esta função retorna um objeto contendo abstrações 
// para cada uma das ações a serem executadas no banco de dados
export async function initDatabase() {
    // aguarda conectar-se no arquivo `database.db` (cria o mesmo caso necessário), utilizando o `sqlite3` como 
    // driver, e assim que terminar a execução, armazena numa constante chamada `db` um objeto que permite a 
    // manipulação do banco de dados
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'netfitness',
        namedPlaceholders: true
    });

    // define os dados que utilizaremos para o cadastro e alteração dos dados de pessoas
    type TipoDadosDePessoa = {
        nome: string
        email: string
        telefone: string
        academia: string
        cref: string | null
        senha: string
    }

    type TipoDadosDeExercicio = {
        nome: string
        gif: string
        agrupamento: string
    }

    type TipoDadosDeTreino = {
        id_pessoa: number
        tipo: number
    }

    type TipoDadosDeTrinoVsExercicio = {
        id_treino: number
        id_exercicio: number
        serie: number
        repeticoes: number
    }

    // define classe `Pessoa` com todos os métodos necessários para manipulação dos dados da tabela pessoa
    // *** ATENÇÃO *** é necessário ressaltar a importância de serem criados arquivos de módulos para
    //             *** organização do código, porém para fins didáticos a classe `Pessoa` está sendo definida
    //             *** aqui mesmo neste arquivo.
    class Pessoa {
        // define método estático que lista todas as pessoas contidas na tabela pessoas do banco de dados
        static async listar() {
            // aguarda execução da busca de todos os dados contidos na tabela pessoa e assim que retornar as 
            // armazena em uma constante chamada `result`

            const [rows, fields] = await db.execute(`SELECT * FROM pessoa`)
            // retorna os dados da constante `result`
            return rows
        }

        static async logar(email: string, senha: string) {
            // aguarda execução da busca de dados de uma pessoa específica filtrada pelo campo `id`, contida na 
            // tabela pessoa e assim que retornar as armazena em uma constante chamada `result`
            const [rows, fields] = await db.execute(`SELECT * FROM pessoa WHERE email=:email AND senha=:senha`, { "email": email, "senha": senha })
            // retorna os dados da constante `result`
            return ((<any>rows).length) ? rows : undefined
        }

        // define método estático que lista os dados de uma pessoa específica contido na tabela pessoa, este método
        // recebe um parâmetro chamado `id` do tipo `number` que será utilizado para selecionar somente os dados da
        // pessoa que tenha este `id`
        static async listarUm(id: number) {
            // aguarda execução da busca de dados de uma pessoa específica filtrada pelo campo `id`, contida na 
            // tabela pessoa e assim que retornar as armazena em uma constante chamada `result`
            const [rows, fields] = await db.execute(`SELECT * FROM pessoa WHERE id_pessoa=:id`, { "id": id })
            // retorna os dados da constante `result`
            return rows
        }

        // define método estático que adiciona uma pessoa no banco de dados, esta função recebe um parâmetro 
        // chamado `dados` do tipo `TipoDadosDePessoa`, estes dados serão utilizados para inserir uma nova pessoa 
        // no banco de dados
        static async adicionar(dados: TipoDadosDePessoa) {
            // aguarda a execução da inserção dos dados de uma nova pessoa no banco de dados e assim que inserido, 
            // armazena os dados desta execução em uma constante chamada `result`
            const [rows, fields] = await db.execute(`
                    INSERT INTO pessoa (nome, email, telefone, academia, senha, CREF) 
                    VALUES (:nome, :email, :telefone, :academia, :senha, :cref);
                `,
                {
                    "nome": dados.nome,
                    "email": dados.email,
                    "telefone": dados.telefone,
                    "academia": dados.academia,
                    "senha": dados.senha,
                    "cref": dados.cref
                }
            )
            // retorna um objeto contendo uma chave chamada `id` que é recebida pelo valor `lastID` contido na 
            // constante `result`, definida no passo anterior
            return rows // com isso
        }

        // define método estático que altera dados de uma pessoa no banco de dados, esta função recebe um parâmetro 
        // chamado `id` do tipo `number` que será utilizado para selecionar para alteração somente os dados da 
        // pessoa que tenha este `id`, além deste parâmetro essa função também recebe um parâmetro chamado `dados` 
        // do tipo `TipoDadosDePessoa`, estes dados serão utilizados para alterar os dados de pessoa
        static async alterar(id: number, dados: TipoDadosDePessoa) {
            // aguarda a execução da alteração dos dados da pessoa com o `id` determinado
            const [rows, fields] = await db.execute(`
                    UPDATE 
                        pessoa 
                    SET 
                        nome=:nome, academia=:academia,  
                        email=:email, telefone=:telefone,
                        cref=:cref, senha=:senha
                       
                    WHERE 
                        id_pessoa=:id
                `,
                {
                    "id": id,
                    "nome": dados.nome,
                    "email": dados.email,
                    "telefone": dados.telefone,
                    "cref": dados.cref,
                    "academia": dados.academia,
                    "senha": dados.senha

                }
            )
            // retorna um objeto contendo uma chave chamada `linhasAfetadas` que é recebida pelo `lastID` contido 
            // na constante `changes`, definida no passo anterior
            return rows
        }

        // define método estático que exclui dados de uma pessoa no banco de dados, esta função recebe um parâmetro 
        // chamado `id` do tipo `number` que será utilizado para selecionar para exclusão somente os dados da 
        // pessoa que tenha este `id`
        static async excluir(id: number) {
            // aguarda a execução da exclusão dos dados da pessoa com `id` determinado
            const [rows, fields] = await db.execute(`DELETE FROM pessoa WHERE id_pessoa=:id`, { "id": id })
            // retorna um objeto contendo uma chave chamada `linhasAfetadas` que é recebida pelo `lastID` contido 
            // na constante `changes`, definida no passo anterior
            return rows
        }

    }

    // static async logar () {
    //     const [rows, fields] = await db.execute("SELECT id_pessoa FROM Pessoa WHERE email=:email AND senha=:senha", {
    //                ":email": dados.email,
    //                 ":senha": dados.senha,
    //              })
    //     return rows

    // }


    // app.post('/login',
    // async function (request, response) {
    //     const responseData = await db.get("SELECT tipo, id_usuario FROM usuarios WHERE email=:email AND senha=:senha", {
    //         ":email": request.body.email,
    //         ":senha": request.body.senha,
    //     })

    //     if (responseData == undefined) {
    //         response.status(404); // Not Found
    //         response.json({ error: "Senha ou email incorreto", detail: e });
    //         console.log(e)
    //         return
    //     }

    class Exercicio {
        static async listar() {
            const [rows, fields] = await db.execute(`SELECT * FROM exercicio`)
            return rows
        }

        static async listarUm(id: number) {
            const [rows, fields] = await db.execute(`SELECT * FROM exercicio WHERE id_exercicio=:id`, { "id": id })
            return rows
        }

        static async adicionar(dados: TipoDadosDeExercicio) {
            const [rows, fields] = await db.execute(`
                    INSERT INTO exercicio (nome, gif, agrupamento) 
                    VALUES (:nome, :gif, :agrupamento);
                `,
                {
                    "nome": dados.nome,
                    "gif": dados.gif,
                    "agrupamento": dados.agrupamento

                }
            )
            return rows
        }

        static async alterar(id: number, dados: TipoDadosDeExercicio) {
            const [rows, fields] = await db.execute(`
                    UPDATE 
                        exercicio 
                    SET 
                        nome=:nome, gif=:gif,  
                        agrupamento=:agrupamento
                       
                    WHERE 
                        id_exercicio=:id
                `,
                {
                    "id": id,
                    "nome": dados.nome,
                    "gif": dados.gif,
                    "agrupamento": dados.agrupamento,

                }
            )

            return rows
        }

        static async excluir(id: number) {
            const [rows, fields] = await db.execute(`DELETE FROM exercicio WHERE id_exercicio=:id`, { "id": id })
            return rows
        }



    }
    class Treino {

        static async adicionartreino(dados: TipoDadosDeTreino) {
            console.log(dados)
            const [rows, fields] = await db.execute(`
                INSERT INTO treino (id_pessoa, tipo) 
                VALUES (:id_pessoa, :tipo);
            `,
                {
                    "id_pessoa": dados.id_pessoa,
                    "tipo": dados.tipo
                }
            )
            return rows
        }

        static async adicionarExercicioAoTreino(dados: TipoDadosDeTrinoVsExercicio) {
            const [rows, fields] = await db.execute(`
                    INSERT INTO netfitness.composta(id_treino, id_exercicio, repeticoes, series)
                    VALUES(:id_treino, :id_exercicio, :repeticoes, :series);
                `,
                {
                    "id_exercicio": dados.id_exercicio,
                    "id_treino": dados.id_treino,
                    "series": dados.serie,
                    "repeticoes": dados.repeticoes
                }
            )
            return rows

        }

        static async listar(idPessoa: number) {
            const [rows, fields] = await db.execute(`SELECT * FROM treino WHERE id_pessoa=:idPessoa`, { idPessoa })
            return rows
        }

        static async listarExercicioTreino(id_treino: number) {
            const [rows, fields] = await db.execute(`
                SELECT 
                    exercicio.id_exercicio, 
                    exercicio.nome, 
                    exercicio.gif, 
                    exercicio.agrupamento, 
                    composta.series, 
                    composta.repeticoes 
                FROM 
                    composta, 
                    exercicio 
                WHERE 
                    composta.id_exercicio = exercicio.id_exercicio AND
                    id_treino = :id_treino
            `, { id_treino })
            return rows
        }


        // static async selecionarTreino() {
        //     console.log('asdas')
        //     const [rows, fields] = await db.execute(`
        //     SELECT id_treino from treino
        // `)
        //     return rows
        // }
    }

    // const x = await Pessoa.excluir(1)
    // console.log(x)

    //  const r = await Pessoa.listar()
    // console.log(r)

    //  const r = await Pessoa.listarUm(1)
    //  console.log(r)

    // const r = await Pessoa.adicionar({
    //     email: "FSDFSD",
    //     nome: "SFSDFSDFSD",
    //     academia: "ljlj",
    //     telefone: "SDAS",
    //     senha: "lllll",
    //     cref: "88888"
    // })
    // console.log(r)

    // const r = await Pessoa.alterar(1, {
    //     email: "alteradfo@gmail.com",
    //     nome: "ALTERADO",
    //     academia: "ljlj",
    //     telefone: "Não pode repetir",
    //     senha: "lllll",
    //     cref: "88888"
    // })
    // console.log(r)

    return { Pessoa, Exercicio, Treino }
}

export default initDatabase()

