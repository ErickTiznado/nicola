export const app = `
import Nicola, { Regulator } from "nicola-framework"
import UserRoute from "./src/routes/user.Routes.js"

Regulator.load()

const app =  new Nicola()

app.use('/user', UserRoute);

app.get('/', (req, res)=>{
res.json({
    message: 'Bienvenido a tu proyecto en Nicola'
})
})

app.listen(3000, () =>{
    console.log('Servidor corriendo en http://localhost:3000')
})
`