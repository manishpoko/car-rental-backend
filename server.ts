import express from "express"

const app = express()

app.use(express.json())
import LoginRoute from './src/routes/authRoutes.ts'
import SignupRoute from './src/routes/bookingRoutes.ts'

app.use('/auth/login', LoginRoute)
app.use('/auth/signup', SignupRoute)

const PORT = 3000

app.get('/', (req, res) => {
    const a = 0;
    console.log("this is a refresh" )
    res.send(`server started at ${PORT}`)
})

app.listen(PORT, ()=> {
    console.log(`listening from ${PORT}`)
})

export default app;

