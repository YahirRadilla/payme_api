import { connect } from '../db.js'
import crypto from 'crypto'

export const getTotalIncomes = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalIncomes FROM deposit_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalIncomes === null ? { totalIncomes: '0.00' } : rows[0]
        res.json({
            data: totalData,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
}

export const getIncomes = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM deposit_view WHERE user_id = ?;'
        const [rows] = await db.execute(query, [id])

        res.json({
            data: rows,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
}

export const postIncome = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, destinationCard, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_DEPOSIT(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, destinationCard, folio, amount])

        res.json({
            data: rows,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
}