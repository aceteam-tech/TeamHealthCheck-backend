const VotingsTable = require('../../db/VotingsTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = JSON.parse(event.body)

    const team = await TeamsTable.queryTeamByIdAsync(teamId)
    if(team.users.includes(profileId)){
        const healthStatus = await VotingsTable.addVotingAsync(team)
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