import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'

const saltRounds = 10;

const secretKey = process.env.JWT_SECRET || "dummy_key_123"

interface SignupInput {
    username: string;
    password: string
}

interface LoginInput {
    username: string;
    password: string;
}

export async function createUser(input: SignupInput){
    const {username, password} = input;
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser = await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword
        }
    })

    return newUser;
}

export async function loginUser(input: LoginInput) {
    const {username, password} = input;

    const usernameExists = await prisma.user.findUnique({
        where: {
            username: username
        },
        select: {
            username: true,
            password: true,
            id: true
        },
    })
    if(!usernameExists) {
        throw new Error ("invalid username")
    }
    const passwordMatches = await bcrypt.compare(password, usernameExists.password)
    if(!passwordMatches){
        throw new Error ("invalid password")
    }
    console.log("password matches")
    const payload = {
        //standard requirement in payload(id and username)
        username: usernameExists.username,
        userId: usernameExists.id
    }
    const token = jwt.sign(payload, secretKey, {expiresIn: "5h"}) //token is only signed here - the verificaiton happens via authMW

    return token;
}