const fetch = require('node-fetch')

module.exports.lambda = async (event) => {
    const message = JSON.parse(event.Records[0].Sns.Message)
    await notifySlack(message.body)


    return event
}

function getRandomColor(){
    const colorChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
    let color = '#'

    for(let i = 0; i<6; i++){
        color += colorChars[Math.floor(Math.random() * colorChars.length)]
    }


    return color
}

async function notifySlack(body) {

    const attachments = Object.keys(body).filter(key => key !== 'action').map(key => ({
        "color": getRandomColor(),
        "author_name": key,
        "text": JSON.stringify(body[key])
    }))

    const options = {
        method: 'POST',
        body: JSON.stringify({
            text: `Action: \`${body.action}\``,
            attachments
        }),
        headers: { 'Content-Type': 'application/json' }
    }

    return fetch(process.env.SLACK_NOTIFY_URL, options)
}