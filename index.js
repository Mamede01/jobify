const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')//renderiso a pagina HTML em outro modudo utilizando ejs
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true}))


app.get('/', async(request, response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all ('select * from vagas; ')
    const categorias = categoriasDb.map(cat => {
        return{
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }        
    })
    
    response.render('home', {
        categorias
    })
})
app.get('/vaga/:id', async(request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id = ' +request.params.id )
    response.render('vaga', {
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})
//async é quando trato os dados do banco
app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection
    const vagas = await db.all ('select * from vagas; ')
    res.render('admin/vagas', { vagas })
})
app.get('/admin/vagas/delete/:id', async(req, res ) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = '+req.params.id+'')
    res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/nova-vaga', { categorias })
   })
app.post('/admin/vagas/nova', async(req, res) => {
    const{titulo, descricao, categoria } = req.body
    const db = await dbConnection    
    await db.run(`insert into vagas (categoria, titulo, descricao) values( ${categoria} , '${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
   })

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    const vaga = await db.get('select * from vagas where id =  '+req.params.id)
    res.render('admin/editar-vaga', { categorias, vaga })
   })
app.post('/admin/vagas/editar/:id', async(req, res) => {
    const{titulo, descricao, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection    
    await db.run(`update vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
   })

   app.get('/admin/categorias', async(req, res) => {
    const db = await dbConnection
    const cat = await db.all ('select * from categorias; ')
    res.render('admin/categorias', { cat })
})
app.get('/admin/vagas/novaCat', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/nova-categoria', { categorias })
   })
app.post('/admin/vagas/novaCat', async(req, res) => {
    const{titulo} = req.body
    const db = await dbConnection    
    await db.run(`insert into categorias (categoria) values(  '${titulo}')`)
    res.redirect('/admin/categorias')
   })

app.get('/admin/vagas/deleteCat/:id', async(req, res ) => {
    const db = await dbConnection
    await db.run('delete from categorias where id = '+req.params.id+'')
    res.redirect('/admin/categorias')
})

app.get('/admin/vagas/editarCat/:id', async(req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    const catID = await db.get('select * from categorias where id =  '+req.params.id)
    res.render('admin/editar-categoria', { categorias, catID })
   })  
app.post('/admin/vagas/editarCat/:id', async(req, res) => {
    const{titulo} = req.body
    const { id } = req.params
    console.log(id)
    console.log(titulo)
    const db = await dbConnection    
    await db.run(`update categorias set categoria = '${titulo}' where id = ${id}`)
    res.redirect('/admin/categorias')
   })
//comment

//Banco
const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists categorias(id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    
    // utilizando ` ` crio um tamplate string
    //Inclusão Categoria
    //const categoria = ''
    // await db.run(`insert into categorias (categoria) values('${categoria}')`)
    
    //Inclusão Vaga
    //const vaga = 'Social Media (Brasil)'
    //const descricao = 'Vaga para analista de redes sociais'
    //await db.run(`insert into vagas (categoria, titulo, descricao) values( 4 , '${vaga}', '${descricao}')`)
}
init()

app.listen(port, (err) => {
    if(err){
        console.log('Não foi possivel iniciar o servidor Jobiby')
    }else{
        console.log('Servidor do Jobify rodando....')
    }
})
