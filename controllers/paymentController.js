import { connect } from '../db.js'
import crypto from 'crypto'


export const getPayments = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM payment_view WHERE user_id = ?;'
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

export const postPayment = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, serviceName, reference, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_SERVICE_PAYMENT(?,?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, folio, sourceCard, serviceName, reference, amount])

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