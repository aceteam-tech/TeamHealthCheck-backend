const updateTeamUsers = require('../../database/teams/update-team-users.dynamodb')
const authorize = require('../../helpers/authorize')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const { teamId, removedUserId } = JSON.parse(event.body)

    let team
    try {
        team = await authorize(teamId, profileId)
    } catch (e) {
        return e
    }

    const remainingUsers = team.users.filter(u => u !== removedUserId)

    try {
        const updatedTeam = await updateTeamUsers(teamId, remainingUsers)
        return {
            statusCode: 200,
            body: JSON.stringify(updatedTeam)
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: 'Unable to update team users'
        }
    }
}