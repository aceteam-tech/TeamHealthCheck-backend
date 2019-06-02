const fetch = require('node-fetch')
const Signer = require('./signer')
const Encode = require('../../helpers/encode')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID

module.exports.lambda = async (event) => {

    const url = {
        host: `${websocketsApiId}.execute-api.${region}.amazonaws.com`,
        pathname: new Encode(`/ws/@connections/${event.body.socketId}`)
    }
    const body = event.body.message


    const request = new Signer({
        region,
        accessKeyId,
        secretAccessKey
    }, {
        url,
        method,
        dataType: 'json',
        contentType: 'application/x-amz-json-1.0',
        body
    })

    await fetch('https://' + url.host + url.pathname, request)

    return {
        statusCode: 200,
        body: 'done'
    }
}