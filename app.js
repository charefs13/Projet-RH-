const express = require('express');
const companyRouter = require('./router/companyRouter');
const session = require('express-session');

const app = express()

app.use(express.static('./public'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'Sjkydbyjgg@zme;,geoo23323@:!',
    resave: true,
    saveUninitialized: true,
}))
app.use(companyRouter)


app.listen(3000, () => {
    try {
        console.log("Écoute sur le port 3000")
    } catch (error) {
        console.log("la connection au port 3000 a échoué")
    }
})       