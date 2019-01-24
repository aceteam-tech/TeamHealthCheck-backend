const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

async function joinTeam(teamId, profileId) {
    const team = await assignProfileToTeam(teamId, profileId)
    await assignTeamToProfile(teamId, profileId)
    return team
}

async function assignProfileToTeam(teamId, profileId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        Key: {id: teamId},
        UpdateExpression: `SET #u = list_append(#u, :profileId)`,
        ExpressionAttributeValues: {
            ':profileId': [profileId]
        },
        ExpressionAttributeNames: {
            '#u': 'users'
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise()).Attributes
}

async function assignTeamToProfile(teamId, profileId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        Key: {id: profileId},
        UpdateExpression: `SET teams = list_append(teams, :teamId)`,
        ExpressionAttributeValues: {
            ':teamId': [teamId]
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise())
}

module.exports.joinTeam = joinTeam;