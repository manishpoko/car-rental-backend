import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
const saltRounds = 10;

interface SignupInput {
  username: string;
  password: string;
}

interface LoginInput {
  username: string;
  password: string;
}

const secretKey = process.env.JWT_SECRET || "dummy_key";

//create user profile-

export async function createUser(input: SignupInput) {
  const { username, password } = input;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = await prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });
  return newUser;
}

//login logic for the user-
export async function loginUser(input: LoginInput) {
  const { username, password } = input;

  const usernameExists = await prisma.user.findUnique({
    where: {
      username: input.username,
    },
    select: {
      username: true,
      password: true,
      id: true,
    },
  });
  if (!usernameExists) {
    throw new Error("invalid username");
  }

  const match = await bcrypt.compare(password, usernameExists.password);

  if (match) {
    const payload = {
      userId: usernameExists.id, //the one verified from the backend
      username: usernameExists.username,
    };
    const token = jwt.sign(payload, secretKey, {expiresIn: '2h'} );

    console.log(`login successful, with token ${token}`)


    return token;

  } else {
    throw new Error("wrong passsword");
  }
}
