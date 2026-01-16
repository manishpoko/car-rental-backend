import  { Router } from "express";

const router = Router();

//FOR GET REQUESTS
router.get('/', (req, res)=> {
    res.send(`hi from router`)
})

//FOR POST REQUESTS
router.post('/', (req,res) => {
    res.json(200).send("hi from router post")
})

export default router