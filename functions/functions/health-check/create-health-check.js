const queryTeam = require('../../database/teams/query-team.dynamodb')
const putHealthCheck = require('../../database/health-checks/put-health-check.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = JSON.parse(event.body)

    const team = await queryTeam(teamId)
    if(team.users.includes(profileId)){
        const healthStatus = await putHealthCheck(team)
        return {
            statusCode: 200,
            body: JSON.stringify(healthStatus)
        }
    } else {
        return {
            statusCode: 401,
            body: "You are unauthorized to create health check for this team"
        }
    }
}