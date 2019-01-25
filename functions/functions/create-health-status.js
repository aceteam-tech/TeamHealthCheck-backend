const putHealthStatusDB = require('../database/health-statuses/put-health-status.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {healthCheckId, categories} = JSON.parse(event.body)

    const healthStatus = await putHealthStatusDB(profileId, healthCheckId, categories)

    return {
        statusCode: 200,
        body: JSON.stringify(healthStatus)
    }
}
