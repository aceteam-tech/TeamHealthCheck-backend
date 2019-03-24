const fetch = require('node-fetch')
const putProfileDB = require('../../database/profiles/put-profile.dynamodb')

module.exports.lambda = async (event) => {
    const { userName: uuid } = event
    const { name, email } = event.request.userAttributes

    await putProfileDB(uuid, name)
    await notifySlack(name, uuid, email)

    return event
}

async function notifySlack(name, uuid, email) {
    const color = ['staging', 'production'].includes(process.env.STAGE) ? "#66cc66" : "#6666cc"

    const options = {
        method: 'POST',
        body: JSON.stringify({
            text: `New user has joined on \`${process.env.STAGE}\` environment`,
            "attachments": [
                {
                    color,
                    author_name: `Name: ${name}`,
                    text: `Id: ${uuid}\nEmail: ${email}`
                }
            ]
        }),
        headers: { 'Content-Type': 'application/json' }
    }

    return fetch('https://hooks.slack.com/services/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', options)
}