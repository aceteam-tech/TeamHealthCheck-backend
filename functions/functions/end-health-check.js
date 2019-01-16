const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

const MAX_POINTS = 2

module.exports.lambda = async (event) => {
    const {teamId} = JSON.parse(event.body)

    const healthCheck = await fetchActiveHealthCheck(teamId)
    const healthStatuses = await fetchHealthStatuses(healthCheck.id)

    if(healthStatuses.length === 0){
        const updated = await putHealthCheck(healthCheck, healthCheck.categories)
        return {
            statusCode: 200,
            body: JSON.stringify(updated)
        }
    }

    const allHealthStatusesCategories = [].concat(...healthStatuses.map(s => s.categories))

    const calculatedCategories = healthCheck.categories.map(c => {
        const categoryStatuses = allHealthStatusesCategories.filter(s => s.id === c.id)
        const categorySum = categoryStatuses
            .map(s=>s.value)
            .reduce((prev, curr)=>prev+curr)
        return {
            ...c,
            value: categorySum * 100 / categoryStatuses.length / MAX_POINTS
        }
    })
    const updated = await putHealthCheck(healthCheck, calculatedCategories)
    return {
        statusCode: 200,
        body: JSON.stringify(updated)
    }
};

async function fetchActiveHealthCheck(teamId){
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthChecks`,
        KeyConditionExpression: 'team_id = :id',
        FilterExpression: 'ended = :ended',
        ExpressionAttributeValues: {
            ':id': teamId,
            ':ended': false
        }
    }
    return (await db.query(params).promise()).Items[0]
}

async function fetchHealthStatuses(healthCheckId){
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthStatuses`,
        KeyConditionExpression: 'health_check_id = :id',
        ExpressionAttributeValues: {
            ':id': healthCheckId
        }
    }
    return (await db.query(params).promise()).Items
}

async function putHealthCheck(healthCheck, categories){
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthChecks`,
        Key: {
            team_id : healthCheck.team_id,
            date: healthCheck.date
        },
        UpdateExpression: 'set categories = :categories, ended = :ended',
        ExpressionAttributeValues: {
            ':categories' : categories,
            ':ended' : true
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise()).Attributes
}