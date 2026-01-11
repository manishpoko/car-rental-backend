import express from 'express';

const app = express();


app.use(express.json())

app.get('/', (req, res) => {
    console.log('tototo')
})



const PORT = 3000;


app.listen(PORT,()=> {
    console.log(`hi from port ${PORT}`)
})

export default app;