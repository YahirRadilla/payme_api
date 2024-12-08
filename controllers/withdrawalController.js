import { connect } from '../db.js'


export const getWithdrawals = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT * FROM withdrawal_view WHERE user_id = ?;`
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


export const getTotalWithdrawals = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalWithdrawal FROM withdrawal_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalWithdrawal === null ? { totalWithdrawal: '0.00' } : rows[0]

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



export const postWithdrawal = async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, amount } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_WITHDRAWAL(?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, amount])

        res.status(201).json({
            success: true,
            message: "Your withdrawal was successful",
            data: rows,
        })


    } catch (error) {
        console.log(error)

        if (error.message.includes('withdrawal')) {
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