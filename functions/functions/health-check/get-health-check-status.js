const queryHealthCheckStatusesDB = require('../../database/health-statuses/query-health-check-statuses.dynamodb')
const queryProfileDB = require('../../database/profiles/get-profile.dynamodb')
const queryActiveHealthCheckDB = require('../../database/health-checks/query-active-health-check.dynamodb')

module.exports.lambda = async (event) => {
    const {teamId} = event.queryStringParameters

    const activeHealthCheck = await queryActiveHealthCheckDB(teamId)

    if (!activeHealthCheck) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                ended: true
            })
        }
    }

    const healthStatuses = await queryHealthCheckStatusesDB(activeHealthCheck.id)

    const usersSubmitted = await (Promise.all(healthStatuses
        .map(async s => queryProfileDB(s.user_id))))

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: activeHealthCheck.id,
            ended: false,
            usersSubmitted,
            categories: activeHealthCheck.categories
        })
    }
}