import { connect } from '../db.js'


export const getTransactions = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `
            SELECT 
                t.*, 
                sc.card_number AS source_card,
                dc.card_number AS destination_card
            FROM 
                transactions t
            LEFT JOIN 
                user_cards sc 
            ON 
                t.source_card_id = sc.id
            LEFT JOIN 
                user_cards dc 
            ON 
                t.destination_card_id = dc.id
            WHERE 
                t.user_id = ?;
        `;
        const [rows] = await db.execute(query, [id])

        res.json({
            success: true,
            data: rows
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        if (db) db.end()
    }
}


/* app.get('/filterDate', async (req, res) => {
    let db
    try {
        const { dateTransaction } = req.body

        db = await connect()
        const query = `CALL SP_FILTER_DATE(?);`
        const [rows] = await db.execute(query, [dateTransaction])

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
}) */







