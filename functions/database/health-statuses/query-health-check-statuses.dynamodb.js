const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (healthCheckId) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthStatuses`,
        KeyConditionExpression: 'health_check_id = :id',
        ExpressionAttributeValues: {
            ':id': healthCheckId
        }
    }
    return (await db.query(params).promise()).Items
}