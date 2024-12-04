import express from 'express'
import { PORT, SECRET_KEY, ORIGIN_URL } from './config.js'
import bcrypt from 'bcrypt'
import { connect } from './db.js'
import cors from 'cors'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'


const corsOptions = {
    origin: ORIGIN_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

const app = express()
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('a')
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body
    let db
    try {
        db = await connect()
        const queryUserExist = `SELECT id,email,password FROM users WHERE email = ?;`
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
                secure: false,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            }).status(200).json({
                data: { id: id, email: dbEmail },
                message: "Authentication successful",
                status: 200,
            });


    } catch (err) {
        if (err.message.includes('not found')) {
            res.status(404).json({
                message: err.message,
                status: 404,
            });
        }

        if (err.message.includes('password')) {
            res.status(401).json({
                message: err.message,
                status: 401,
            });
        }
    }

})

app.post('/logout', async (req, res) => {
    res
        .clearCookie('userName')
        .clearCookie('access_token')
        .json({ message: 'Logout successful' })
})


app.post('/verify-token', (req, res) => {
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
});


app.post('/register', async (req, res) => {
    const { firstName, firtsLastname, phone, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    let db
    try {
        db = await connect()
        const query = `CALL SP_CREATE_USER(?,?,?,?,?);`
        const [rows] = await db.execute(query, [firstName, firtsLastname, phone, email, hashedPassword])


        res.status(201).json({
            message: "User created successfully",
            status: 201,
            data: rows
        });
    } catch (error) {
        console.log(error)
        if (error.message.includes('already exists')) {
            return res.status(409).json({
                message: "User already exists",
                status: 409
            });
        }
    } finally {
        if (db)
            db.end()
    }


})

app.get('/user/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT id,first_name, first_lastname, phone,email,created_at FROM users WHERE id = ?;'
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
})

app.get('/transfers/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM transfer_view WHERE user_id = ?;'
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
})

app.get('/cards/:id', async (req, res) => {
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
})


app.get('/transfers/total/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalTransfers FROM transfers WHERE sender_id = ?;`
        const [rows] = await db.execute(query, [id])

        const totalData = rows[0].totalTransfers === null ? { totalTransfers: '0.00' } : rows[0]

        res.json({
            data: totalData,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
})

app.get('/income/total/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalIncomes FROM deposit_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalIncomes === null ? { totalIncomes: '0.00' } : rows[0]
        res.json({
            data: totalData,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
})

app.get('/withdrawal/total/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT SUM(amount) as totalWithdrawal FROM withdrawal_view WHERE user_id = ?;`
        const [rows] = await db.execute(query, [id])
        const totalData = rows[0].totalWithdrawal === null ? { totalWithdrawal: '0.00' } : rows[0]
        res.json({
            data: totalData,
            status: 200
        })

    } catch (error) {
        console.log(error)
    } finally {
        if (db)
            db.end()
    }
})


app.get('/payments/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM payment_view WHERE user_id = ?;'
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
})

app.get('/incomes/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = 'SELECT * FROM deposit_view WHERE user_id = ?;'
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
})

app.get('/withdrawal/:id', async (req, res) => {
    let db
    const id = req.params.id
    try {
        db = await connect()
        const query = `SELECT * FROM withdrawal_view WHERE user_id = ?;`
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
})

app.get('/transactions/:id', async (req, res) => {
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
            data: rows,
            status: 200
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: 'Internal server error',
            status: 500
        })
    } finally {
        if (db) db.end()
    }
})


app.get('/filterDate', async (req, res) => {
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
})

//
app.post('/card/create/:id', async (req, res) => {
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
})


app.post('/transfers/create/:id', async (req, res) => {
    let db
    const id = req.params.id
    const { recipientEmail, sourceCard, amount, message } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_TRANSFER(?,?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, recipientEmail, folio, sourceCard, amount, message])

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
})

app.post('/payments/create/:id', async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, serviceName, reference, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_SERVICE_PAYMENT(?,?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, folio, sourceCard, serviceName, reference, amount])

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
})

app.post('/incomes/create/:id', async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, destinationCard, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_DEPOSIT(?,?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, destinationCard, folio, amount])

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
})

app.post('/withdrawal/create/:id', async (req, res) => {
    let db
    const id = req.params.id
    const { sourceCard, amount } = req.body
    const folio = crypto.randomBytes(15).toString('hex').substring(0, 20);
    try {
        db = await connect()
        const query = 'CALL SP_CREATE_WITHDRAWAL(?,?,?,?);'
        const [rows] = await db.execute(query, [id, sourceCard, folio, amount])
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
})


app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})