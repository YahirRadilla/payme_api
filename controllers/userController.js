import { connect } from '../db.js'
import bcrypt from 'bcrypt'


export const getUser = async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT id,first_name, first_lastname, phone,email,created_at FROM users WHERE id = ? AND active = 1;'
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

export const patchUserInfo = async (req, res) => {
    let db
    try {
        const id = req.params.id;
        const { firstName, firstLastname, phone, email } = req.body;
        db = await connect()
        const query = 'CALL SP_UPDATE_USER(?, ?, ?, ?, ?)';
        const [rows] = await db.execute(query, [id, firstName, firstLastname, phone, email]);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: rows,
        })
    }
    catch (error) {
        console.log(error)
        if (error.message.includes('phone')) {
            res.status(409).json({
                success: false,
                message: "Phone already registered",
                status: 409
            });
        }

        if (error.message.includes('email')) {
            res.status(409).json({
                success: false,
                message: "Email already registered",
                status: 409
            });
        }
    } finally {
        if (db)
            db.end()
    }
}

export const patchUserPassword = async (req, res) => {
    const id = req.params.id;
    const { password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    let db
    try {
        db = await connect()
        const query = `CALL SP_UPDATE_PASSWORD(?, ?)`
        const [rows] = await db.execute(query, [id, hashedPassword])

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: rows,
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        if (db)
            db.end()
    }
}

export const patchDeactivateUser = async (req, res) => {
    const id = req.params.id;
    let db
    try {
        db = await connect()
        const query = `CALL SP_DELETE_USER(?)`
        const [rows] = await db.execute(query, [id])

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: rows,
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        if (db)
            db.end()
    }
}