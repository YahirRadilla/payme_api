import dotenv from 'dotenv'

dotenv.config()

export const {
    PORT = 3000,
    DB_PORT,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    SECRET_KEY,
    ORIGIN_URL
} = process.env