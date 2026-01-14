// this is where you initialise your prisma client


import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js' //from the output in schema
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

const prisma = new PrismaClient({ adapter })

export default prisma;