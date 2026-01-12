import express from "express";


import loginRoute from './src/routes/loginRoute.js'

const app = express()
const PORT = 3000;

app.use(express.json());

app.use('/login', loginRoute)


app.get("/", (req, res) => {
    console.log("this is for terminal")
    res.send("hi there")
} )



app.listen(PORT, ()=> {
    console.log(`listenin' from p-${PORT}`)
})



export default app;

