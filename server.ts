import express from "express"

const app = express()

app.use(express.json());

app.get("/health", (req, res) => {
    res.send("hi there")
} )

const PORT = 3000;

app.listen('PORT', ()=> {
    console.log(`hello from port ${PORT}`)
})

export default app;

