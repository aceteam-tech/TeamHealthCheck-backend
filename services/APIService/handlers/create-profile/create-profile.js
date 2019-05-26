const fetch = require('node-fetch')
const ProfilesTable = require('../../db/ProfilesTable')

module.exports.lambda = async (event) => {
    const { userName: uuid } = event
    const { name, email } = event.request.userAttributes

    await ProfilesTable.putProfileAsync(uuid, name)
    await notifySlack(name, uuid, email)

    return event
}

async function notifySlack(name, uuid, email) {
    const color = ['staging', 'production'].includes(process.env.STAGE) ? "#66cc66" : "#6666cc"

    const options = {
        method: 'POST',
        body: JSON.stringify({
            text: `A new user has joined on \`${process.env.STAGE}\` environment`,
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

    return fetch(process.env.SLACK_NOTIFY_URL, options)
}