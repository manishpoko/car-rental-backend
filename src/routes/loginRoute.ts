import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    console.log('hello from router')
    res.send("success w login")

})

export default router;