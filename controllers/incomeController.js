import { connect } from '../db.js'

export const getTotalIncomes = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalIncomes FROM deposit_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalIncomes === null ? { totalIncomes: '0.00' } : rows[0]
        res.status(200).json({
            data: totalData,
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

export const getIncomes = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM deposit_view WHERE user_id = ?;'
        const [rows] = await db.execute(query, [id])

        res.status(200).json({
            data: rows,
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

export const postIncome = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, destinationCard, amount } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_DEPOSIT(?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, destinationCard, amount])


        res.status(201).json({
            success: true,
            message: "Your deposit was successful",
            data: rows,
        })


    } catch (error) {
        if (error.message.includes('deposit')) {
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