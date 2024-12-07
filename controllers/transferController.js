import { connect } from '../db.js'
import crypto from 'crypto'


export const getTransfers = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM transfer_view WHERE user_id = ?;'
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



export const getTotalTransfers = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalTransfers FROM transfers WHERE sender_id = ?;`
        const [rows] = await db.execute(query, [id])

        const totalData = rows[0].totalTransfers === null ? { totalTransfers: '0.00' } : rows[0]

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

export const postTransfer = async (req, res) => {
    let db
    const id = req.params.id
    const { recipientEmail, sourceCard, amount, message } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_TRANSFER(?,?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, recipientEmail, folio, sourceCard, amount, message])

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