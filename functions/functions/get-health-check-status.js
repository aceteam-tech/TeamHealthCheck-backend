const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports.lambda = async (event) => {
    // const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = event.queryStringParameters

    const activeHealthChecks = await fetchActiveHealthChecks(teamId)

    if (activeHealthChecks.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                ended: true
            })
        }
    }

    const activeHealthCheck = activeHealthChecks[0]
    const healthStatuses = await fetchHealthStatuses(activeHealthCheck.id)

    const usersSubmitted = await (Promise.all(healthStatuses
        .map(async s => fetchUser(s.user_id))))

    return {
        statusCode: 200,
        body: JSON.stringify({
            ended: false,
            usersSubmitted,
            categories: activeHealthCheck.categories
        })
    }
};

async function fetchHealthStatuses (healthCheckId) {
    const params = {
        TableName: `HC-${process.env.STAGE}-HealthStatuses`,
        KeyConditionExpression: 'health_check_id = :id',
        ExpressionAttributeValues: {
            ':id': healthCheckId
        }
    }
    return (await db.query(params).promise()).Items
}

async function fetchUser (userId) {
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': userId
        }
    }
    return (await db.query(params).promise()).Items[0]
}

async function fetchActiveHealthChecks (teamId) {
    const params = {
        TableName: `HC-${process.env.STAGE}-HealthChecks`,
        KeyConditionExpression: 'team_id = :id',
        FilterExpression: 'ended = :ended',
        ExpressionAttributeValues: {
            ':id': teamId,
            ':ended': false
        }
    }
    return (await db.query(params).promise()).Items
}