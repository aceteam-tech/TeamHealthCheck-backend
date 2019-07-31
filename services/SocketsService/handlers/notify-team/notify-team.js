const fetch = require('node-fetch')
const Signer = require('aws-request-signer')
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

// Request values
const method = 'POST'
const accessKeyId = process.env.ACCESS_KEY_ID
const secretAccessKey = process.env.SECRET_ACCESS_KEY_ID
const region = process.env.REGION
const websocketsApiId = process.env.WEBSOCKETS_API_ID
const stage = process.env.STAGE

const removeSocketFromConnectionsTable = async (connection_id, user_id) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connection_id, user_id },
        ReturnValues: 'ALL_OLD'
    }
    return db.delete(params).promise()
}

module.exports.lambda = async (event) => {
    const message = typeof event.Records[0].Sns.Message === 'string' ?
        JSON.parse(event.Records[0].Sns.Message) :
        event.Records[0].Sns.Message

    const team = await TeamsTable.queryTeamByIdAsync(message.teamId)
    const profiles = await ProfilesTable.getBatchProfilesAsync(team.users)


    await Promise.all(profiles.map(async ({id: profileId, sockets}) => {
        let currentSockets = sockets

        if(sockets && sockets.length && (!message.ignoredProfiles || !message.ignoredProfiles.includes(profileId)) ){
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
                    if(response.status === 410){
                        currentSockets = currentSockets.filter(s => s !== socket)
                        await removeSocketFromConnectionsTable(socket, profileId)
                        await ProfilesTable.removeSocketFromAssociatedProfile(currentSockets, profileId)
                    }
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