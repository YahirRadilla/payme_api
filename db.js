import mysql from 'mysql2/promise'

import { DB_PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from './config.js'



export async function connect() {
    try {
        const conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        })
        console.log('Conexión con la base de datos establecida')
        return conn
    } catch (error) {
        console.log('Ocurrió un error al realizar la conexión con la base de datos', error)
        throw error
    }
}

