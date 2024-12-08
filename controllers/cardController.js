import { connect } from '../db.js'

export const getCards = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM user_cards WHERE user_id = ?;'
        const [rows] = await db.execute(query, [id])

        res.json({
            success: true,
            message: "Authentication successful",
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

export const postCard = async (req, res) => {
    let db
    const id = req.params.id
    const { cardNumber, expirationDate, cvv, balance } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_USER_CARD(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, cardNumber, expirationDate, cvv, balance])

        res.status(201).json({
            success: true,
            message: "Card successfully registered",
            data: rows,
        })

    } catch (error) {
        if (error.message.includes('card_number')) {
            res.status(409).json({
                success: false,
                message: "card already registered",
            });
        }
    } finally {
        if (db)
            db.end()
    }
}




