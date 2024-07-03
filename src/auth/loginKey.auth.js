const jwt = require('jsonwebtoken');
const SignInKey = require("../models/signInKey");
const { token } = require('morgan');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
    const key = req.headers['authorization']
    const userId = req.headers['user-id']
    if (!key) {
        return res.status(401).json({
            status: 401,
            message: 'No token provided' 
        });
    }
    if (!userId) {
        return res.status(401).json({
            status: 401,
            message: 'No user id provided'
        })
    }
    try {
        const decodedToken = jwt.verify(key, process.env.JWT_SECRET_KEY)
        //check userId from decodedToken is same with userId from header
        if (decodedToken.userId !== userId) {
            return res.status(403).json({
                status: 403,
                message: 'User ID does not match token'
            });
        }
        //check with userId in db
        const signInKey = await SignInKey.findOne({userId: userId, key: key}).lean()
        if (!signInKey) {
            return res.status(403).json({
                status: 403,
                message: 'Token is not found for this user'
            });
        }
        req.user = decodedToken;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            await SignInKey.deleteMany({ userId: userId});
            return res.status(403).json({
                status: 403,
                message: 'Token has expired and has been removed, please sign in again'
            })
        }
        else {
            return res.status(403).json({
                status: 403,
                message: 'Token is invalid'
            });
        }   
    }
}

module.exports = {
    authenticateToken
};
