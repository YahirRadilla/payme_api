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
import { authVerify } from './middleware/authVerify.js'

export const router = express.Router()

router.post('/login', postLogin)

router.post('/logout', postLogout)

router.post('/register', postRegister)

router.post('/verify-token', postVerifyToken);

router.get('/user/:id', authVerify, getUser)

router.get('/transfers/:id', authVerify, getTransfers)

router.get('/cards/:id', authVerify, getCards)

router.get('/transfers/total/:id', authVerify, getTotalTransfers)

router.get('/income/total/:id', authVerify, getTotalIncomes)

router.get('/withdrawal/total/:id', authVerify, getTotalWithdrawals)

router.get('/payments/:id', authVerify, getPayments)

router.get('/incomes/:id', authVerify, getIncomes)

router.get('/withdrawal/:id', authVerify, getWithdrawals)

router.get('/transactions/:id', authVerify, getTransactions)

router.post('/card/create/:id', authVerify, postCard)

router.post('/transfers/create/:id', authVerify, postTransfer)

router.post('/payments/create/:id', authVerify, postPayment)

router.post('/incomes/create/:id', authVerify, postIncome)

router.post('/withdrawal/create/:id', authVerify, postWithdrawal)