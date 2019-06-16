const VotingsTable = require('../../db/VotingsTable')
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const {teamId} = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const profile = await ProfilesTable.getProfileByEmailAsync(email)

    const team = await TeamsTable.queryTeamByIdAsync(teamId)
    if(team.users.includes(profile.id)){
        const healthStatus = await VotingsTable.addVotingAsync(team)
        return {
            statusCode: 200,
            body: JSON.stringify({...healthStatus, usersSubmitted: []})
        }
    } else {
        return {
            statusCode: 401,
            body: "You are unauthorized to create health check for this team"
        }
    }
}