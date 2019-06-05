const fetch = require('node-fetch')
const Signer = require('./signer')
const Encode = require('../../../VotingService/helpers/encode')
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID

module.exports.lambda = async (event) => {
    const message = JSON.parse(event.Records[0].Sns.Message)

    const team = await TeamsTable.queryTeamByIdAsync(message.teamId)
    const profiles = await ProfilesTable.getBatchProfilesAsync(team.users)

    await Promise.all(profiles.map(async ({id, sockets}) => {
        await Promise.all(sockets.map(async socket => {

            const url = {
                host: `${websocketsApiId}.execute-api.${region}.amazonaws.com`,
                pathname: new Encode(`/ws/@connections/${socket}`)
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

        }))
    }))

    return {
        statusCode: 200,
        body: 'done'
    }
}