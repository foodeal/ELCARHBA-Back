// var { expressjwt: jwt } = require("express-jwt");
const jwt = require('express-jwt')
const { secret } = require('./../config.json');
const db = require('./../helpers/db');

module.exports = authorize;

function authorize() {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // attach full user record to request object
        async (req, res, next) => {
            // get user with id from token 'sub' (subject) property
            // const user = await db.User.findByPk(req.auth.sub) ??
            // await db.Prestataire.findByPk(req.auth.sub);
            const user = await db.User.findByPk(req.user.sub) ??
            await db.Prestataire.findByPk(req.user.sub);
            // check user still exists
            if (!user)
                return res.status(401).json({ message: 'Interdit' });

            // authorization successful
            req.user = user.get();
            req.currentUser = user;
            next();
        }
    ];
}