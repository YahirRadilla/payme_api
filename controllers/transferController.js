import { connect } from '../db.js'
import crypto from 'crypto'


export const getTransfers = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM transfer_view WHERE user_id = ?;'
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



export const getTotalTransfers = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalTransfers FROM transfers WHERE sender_id = ?;`
        const [rows] = await db.execute(query, [id])

        const totalData = rows[0].totalTransfers === null ? { totalTransfers: '0.00' } : rows[0]

        res.status(200).json({
            success: true,
            data: totalData
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

export const postTransfer = async (req, res) => {
    let db
    const id = req.params.id
    const { recipientEmail, sourceCard, amount, message } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_TRANSFER(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, recipientEmail, sourceCard, amount, message])

        res.json({
            data: rows,
            status: 200
        })

    } catch (error) {
        if (error.message.includes('destination_card_id')) {
            res.status(404).json({
                success: false,
                message: 'Recipient does not have a card',
            });
        }
        if (error.message.includes('Email')) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message.includes('transfer')) {
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