import fetch from 'node-fetch'
import ProfilesTable from '../../db/ProfilesTable'

export const lambda = async (event) => {
    console.log({'event': event});
    const { userName: cognitoId } = event
    const { name, email } = event.request.userAttributes

    const profile = await ProfilesTable.queryByEmail(email)
    console.log({'profile': profile});

    if(!profile){
        await ProfilesTable.putProfileAsync(cognitoId, name, email)
        if(process.env.STAGE === 'Production'){
            await notifySlack(name, email)
        }
    }


    return event
}

async function notifySlack(name, email) {
    const options = {
        method: 'POST',
        body: JSON.stringify({
            text: `A new user has joined on \`${process.env.STAGE}\` environment`,
            "attachments": [
                {
                    color: '#6666cc',
                    author_name: `Name: ${name}`,
                    text: `Id: ${email}`
                }
            ]
        }),
        headers: { 'Content-Type': 'application/json' }
    }

    return fetch(process.env.SLACK_NOTIFY_URL, options)
}