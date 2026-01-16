import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const secretKey  = process.env.JWT_SECRET || "dummy_key_123"

interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string
    }
}

//for jwt type safety
interface JWTUserPayload {
    userId: number;
    username: string
}

export function authMiddleware( req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({
            success: false ,
            error: "authorization header missing"
        })
    }
    //checking bearer format - 
    const parts = authHeader.split(" ")
    if(parts.length !== 2 || parts[0] !== "Bearer"){
        return res.status(401).json({
            success: false, 
            error : "bearer does not exist"
        })
    }
    const token = parts[1]

    if(!token) {
        return res.status(401).json({
            success: false,
            error: "token missing after bearer"
        })
    }

    //verify token
    try {
        const decoded = jwt.verify(token , secretKey) as unknown as JWTUserPayload;

        req.user = {
            userId: decoded.userId,
            username: decoded.username
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "token invalid"
        })
    }



}