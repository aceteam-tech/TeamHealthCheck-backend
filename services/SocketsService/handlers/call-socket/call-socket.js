const fetch = require('node-fetch')
const Signer = require('aws-request-signer')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID
const stage = process.env.STAGE

module.exports.lambda = async (event) => {
    const eventMessage = event.Records[0].Sns.Message
    const message = typeof eventMessage === 'string' ? JSON.parse(event.Records[0].Sns.Message) : eventMessage

    const url = {
        host: `${websocketsApiId}.execute-api.${region}.amazonaws.com`,
        pathname: `/${stage}/@connections/${message.socketId}`
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

    const response = await fetch('https://' + url.host + url.pathname, request)
    console.log({'response': response})

    return {
        statusCode: 200,
        body: 'done'
    }
}