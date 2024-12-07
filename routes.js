import express from 'express'
import {
    postLogin,
    postLogout,
    postRegister,
    postVerifyToken
} from './controllers/authController.js'
import { getUser } from './controllers/userController.js'
import { getCards, postCard } from './controllers/cardController.js'
import { getIncomes, getTotalIncomes, postIncome } from './controllers/incomeController.js'
import { getTransactions } from './controllers/transactionController.js'
import { getTotalTransfers, getTransfers, postTransfer } from './controllers/transferController.js'
import { getPayments, postPayment } from './controllers/paymentController.js'
import { getTotalWithdrawals, getWithdrawals, postWithdrawal } from './controllers/withdrawalController.js'

export const router = express.Router()

router.post('/login', postLogin)

router.post('/logout', postLogout)

router.post('/register', postRegister)

router.post('/verify-token', postVerifyToken);

router.get('/user/:id', getUser)

router.get('/transfers/:id', getTransfers)

router.get('/cards/:id', getCards)

router.get('/transfers/total/:id', getTotalTransfers)

router.get('/income/total/:id', getTotalIncomes)

router.get('/withdrawal/total/:id', getTotalWithdrawals)

router.get('/payments/:id', getPayments)

router.get('/incomes/:id', getIncomes)

router.get('/withdrawal/:id', getWithdrawals)

router.get('/transactions/:id', getTransactions)

router.post('/card/create/:id', postCard)

router.post('/transfers/create/:id', postTransfer)

router.post('/payments/create/:id', postPayment)

router.post('/incomes/create/:id', postIncome)

router.post('/withdrawal/create/:id', postWithdrawal)