import express from 'express'
import { PORT, ORIGIN_URL } from './config.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { router } from './routes.js'

const corsOptions = {
    origin: ORIGIN_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,

};

const app = express()
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())

app.use('/', router)

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})