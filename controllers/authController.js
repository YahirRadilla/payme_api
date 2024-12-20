import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { connect } from '../db.js'
import { SECRET_KEY } from '../config.js'


export const postLogin = async (req, res) => {
    const { email, password } = req.body
    let db
    try {
        db = await connect()
        const queryUserExist = `SELECT id,email,password FROM users WHERE email = ? AND active = 1;`
        const [rowsUserExist] = await db.execute(queryUserExist, [email])

        if (!rowsUserExist.length) throw new Error("User not found");

        const { id, email: dbEmail, password: dbPassword } = rowsUserExist[0]

        const isValidPassword = bcrypt.compareSync(password, dbPassword)
        if (!isValidPassword) throw new Error("password is invalid");

        const token = jwt.sign({ id: id, email: dbEmail, }, SECRET_KEY, {
            expiresIn: '1h'
        })

        res
            .cookie('access_token', token, {
                httpOnly: true,
                secure: 'production',
                sameSite: 'None',
                maxAge: 1000 * 60 * 60
            }).status(200).json({
                success: true,
                message: "Authentication successfull",
                data: { id: id, email: dbEmail },
            });


    } catch (err) {
        if (err.message.includes('not found')) {
            res.status(404).json({
                success: false,
                message: err.message,
            });
        }

        if (err.message.includes('password')) {
            res.status(401).json({
                success: false,
                message: err.message,
            });
        }
    }

}

export const postLogout = async (req, res) => {
    res
        .clearCookie('access_token', {
            httpOnly: true,
            secure: 'production',
            sameSite: 'None'
        })
        .status(200)
        .json({ message: 'Logout successful' });
};


export const postVerifyToken = (req, res) => {
    const token = req.cookies['access_token'];

    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }

        res
            .status(200)
            .json({ message: 'Token valid' })
    });
}


export const postRegister = async (req, res) => {
    const { firstName, firtsLastname, phone, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    let db
    try {
        db = await connect()
        const query = `CALL SP_CREATE_USER(?,?,?,?,?);`
        const [rows] = await db.execute(query, [firstName, firtsLastname, phone, email, hashedPassword])



        console.log(rows)
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: rows
        });
    } catch (error) {
        if (error.message.includes('already exists')) {
            res.status(409).json({
                success: false,
                message: "Email already registered",
                status: 409
            });
        }

        if (error.message.includes('phone')) {
            res.status(409).json({
                success: false,
                message: "Phone already registered",
                status: 409
            });
        }
    } finally {
        if (db)
            db.end()
    }


}
