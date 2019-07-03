const fetch = require('node-fetch')
const Signer = require('aws-request-signer')
const Encode = require('../../../VotingService/helpers/encode')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID

module.exports.lambda = async (event) => {
    const eventMessage = event.Records[0].Sns.Message
    const message = typeof eventMessage === 'string' ? JSON.parse(event.Records[0].Sns.Message) : eventMessage

    const url = {
        host: `${websocketsApiId}.execute-api.${region}.amazonaws.com`,
        pathname: new Encode(`/ws/@connections/${message.socketId}`)
    }

    const body = message.body

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