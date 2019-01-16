const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = JSON.parse(event.body)

    const team = await fetchTeam(teamId)
    if(team.users.includes(profileId)){
        const healthStatus = await postHealthCheck(team)
        return {
            statusCode: 200,
            body: JSON.stringify(healthStatus)
        }
    } else {
        return {
            statusCode: 401,
            body: "You are unauthorized to create health check for this team"
        }
    }
};

async function fetchTeam(teamId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': teamId
        }
    }
    return (await db.query(params).promise()).Items[0]
}

async function postHealthCheck(team){
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthChecks`,
        Item: {
            id: uuid(),
            team_id: team.id,
            categories: team.categories,
            date: Date.now(),
            ended: false
        }
    }
    await db.put(params).promise()
    return params.Item
}