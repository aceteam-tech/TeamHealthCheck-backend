const fetch = require('node-fetch')
const putProfileDB = require('../../database/profiles/put-profile.dynamodb')

module.exports.lambda = async (event) => {
    const {userName: uuid} = event
    const {name} = event.request.userAttributes

    await putProfileDB(uuid, name)
    if(['staging', 'production'].includes(process.env.STAGE)){
        await notifySlack(name, uuid)
    }

    return event;
};

async function notifySlack(name, uuid){
    const options = {
        method: 'POST',
        body: JSON.stringify({
            text: `User with name ${name} and id ${uuid} has just registered`
        }),
        headers: { 'Content-Type': 'application/json' }
    }

    return fetch('https://hooks.slack.com/services/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', options)
}