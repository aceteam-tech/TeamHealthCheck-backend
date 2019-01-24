const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (healthCheck, categories) => {
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