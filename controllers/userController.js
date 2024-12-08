import { connect } from '../db.js'



export const getUser = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT id,first_name, first_lastname, phone,email,created_at FROM users WHERE id = ?;'
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
