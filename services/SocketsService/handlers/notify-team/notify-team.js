const fetch = require('node-fetch')
const Signer = require('aws-request-signer')
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID
const stage = process.env.STAGE

module.exports.lambda = async (event) => {
    const message = typeof event.Records[0].Sns.Message === 'string' ?
        JSON.parse(event.Records[0].Sns.Message) :
        event.Records[0].Sns.Message

    const team = await TeamsTable.queryTeamByIdAsync(message.teamId)
    const profiles = await ProfilesTable.getBatchProfilesAsync(team.users)

    console.log({'profiles': profiles});

    await Promise.all(profiles.map(async ({id, sockets}) => {
        if(sockets && sockets.length && (!message.ignoredProfiles || !message.ignoredProfiles.includes(id)) ){
            await Promise.all(sockets.map(async socket => {
                const url = {
                    host: `${websocketsApiId}.execute-api.${region}.amazonaws.com`,
                    pathname: `/${stage}/@connections/${socket}`
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

                try{
                    const response = await fetch('https://' + url.host + url.pathname, request)
                    console.log({'response': response});
                } catch (e){
                    console.log({'fetch error': e});
                }
            }))
        }
    }))

    return {
        statusCode: 200,
        body: 'done'
    }
}