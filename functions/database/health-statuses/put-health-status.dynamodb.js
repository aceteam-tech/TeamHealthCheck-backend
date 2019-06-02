const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (profileId, healthCheckId, categories) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthStatuses`,
        Item: {
            user_id: profileId,
            health_check_id: healthCheckId,
            categories
        }
    }
    await db.put(params).promise()
    return params.Item
}