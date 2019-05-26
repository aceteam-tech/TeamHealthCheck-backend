const jwksClient = require('jwks-rsa')
const jwt = require('jsonwebtoken')

const client = jwksClient({
    jwksUri: `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.ISS}/.well-known/jwks.json`
})

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (!key) {
            return callback('wrong key')
        }
        const signingKey = key.publicKey || key.rsaPublicKey
        return callback(null, signingKey)
    })
}

const authorize = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, function (err, decoded) {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(decoded)
        })
    })
}

module.exports = authorize