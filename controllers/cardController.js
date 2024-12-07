import { connect } from '../db.js'

export const getCards = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM user_cards WHERE user_id = ?;'
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

export const postCard = async (req, res) => {
    let db
    const id = req.params.id
    const { cardNumber, expirationDate, cvv, balance } = req.body
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_USER_CARD(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, cardNumber, expirationDate, cvv, balance])

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




