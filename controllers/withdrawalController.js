import { connect } from '../db.js'
import crypto from 'crypto'


export const getTotalWithdrawals = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalWithdrawal FROM withdrawal_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalWithdrawal === null ? { totalWithdrawal: '0.00' } : rows[0]
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






export const getWithdrawals = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT * FROM withdrawal_view WHERE user_id = ?;`
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


export const postWithdrawal = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_WITHDRAWAL(?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, folio, amount])
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