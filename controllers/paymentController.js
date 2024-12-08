import { connect } from '../db.js'


export const getPayments = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM payment_view WHERE user_id = ?;'
        const [rows] = await db.execute(query, [id])

        res.status(200).json({
            success: true,
            data: rows
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        if (db)
            db.end()
    }
}

export const postPayment = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, serviceName, reference, amount } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_SERVICE_PAYMENT(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, serviceName, reference, amount])

        res.status(201).json({
            success: true,
            message: "Your payment was successful",
            data: rows,
        })


    } catch (error) {
        if (error.message.includes('service')) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('0 or less')) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    } finally {
        if (db)
            db.end()
    }
}