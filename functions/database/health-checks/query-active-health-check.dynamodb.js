const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (teamId) => {
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