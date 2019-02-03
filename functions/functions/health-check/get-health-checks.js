const queryEndedHealthChecksDB = require('../../database/health-checks/query-ended-health-checks.dynamodb')

module.exports.lambda = async (event) => {
    const {teamId} = event.queryStringParameters

    const healthChecks = await queryEndedHealthChecksDB(teamId)
    const healthChecksWithVotes = healthChecks.filter(hc=>hc.categories[0].value)

    return {
        statusCode: 200,
        body: JSON.stringify(healthChecksWithVotes)
    }
}