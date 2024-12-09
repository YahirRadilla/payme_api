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
                dc.card_number AS destination_card,
                DATE(t.created_at) AS created_at
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

        res.status(200).json({
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


export const getTransactionsFilter = async (req, res) => {
    let db;
    const id = req.params.id;
    const dateTransaction = req.query.dateTransaction || null;
    const type = req.query.type || null;

    const formattedDate = dateTransaction
        ? new Date(dateTransaction).toISOString().split('T')[0]
        : null;

    try {
        db = await connect();
        const query = `
            SELECT 
                t.*, 
                sc.card_number AS source_card,
                dc.card_number AS destination_card,
                DATE(t.created_at) AS created_at
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
                t.user_id = ?
                AND (? IS NULL OR DATE(t.created_at) = ?)
                AND (? IS NULL OR t.type = ?);
        `;
        const [rows] = await db.execute(query, [
            id,
            formattedDate,
            formattedDate,
            type,
            type,
        ]);

        res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    } finally {
        if (db) db.end();
    }
};








