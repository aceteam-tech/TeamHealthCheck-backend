const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {healthCheckId, categories} = event.body

    const healthStatus = await postHealthStatus(profileId, healthCheckId, categories)

    return {
        statusCode: 200,
        body: JSON.stringify(healthStatus)
    }
};

async function postHealthStatus(profileId, healthCheckId, categories){
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