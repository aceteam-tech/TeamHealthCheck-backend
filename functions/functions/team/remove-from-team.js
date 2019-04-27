const updateTeamUsers = require('../../database/teams/update-team-users.dynamodb')
const updateUserTeams = require('../../database/profiles/update-user-teams.dynamodb')
const getProfile = require('../../database/profiles/get-profile.dynamodb')
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

    const user = await getProfile(removedUserId)
    const remainingTeams = user.teams.filter(t => t !== teamId)

    try {
        const updatedTeam = await updateTeamUsers(teamId, remainingUsers)
        await updateUserTeams(removedUserId, remainingTeams)
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