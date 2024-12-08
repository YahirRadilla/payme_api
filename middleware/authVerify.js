import { SECRET_KEY } from '../config.js'
import jwt from 'jsonwebtoken'


export const authVerify = (req, res, next) => {
    const token = req.cookies['access_token'];

    if (!token)
        return res.status(401).json({ 'error': 'Not Authorized' });
    const bearer = token;
    try {
        const decoded = jwt.verify(bearer, SECRET_KEY);
        req.email = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ 'error': 'An error has occurred, try again' + err });
    }
}
