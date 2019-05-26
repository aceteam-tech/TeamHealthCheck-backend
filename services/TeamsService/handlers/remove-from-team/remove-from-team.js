const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const { teamId, removedUserId } = JSON.parse(event.body)

    const team = await TeamsTable.queryTeamByIdAsync(teamId)

    const remainingUsers = team.users.filter(u => u !== removedUserId)

    const user = await ProfilesTable.getProfileAsync(removedUserId)
    const remainingTeams = user.teams.filter(t => t !== teamId)

    try {
        const updatedTeam = await TeamsTable.updateProfilesAsync(teamId, remainingUsers)
        await ProfilesTable.updateTeamsAsync(removedUserId, remainingTeams)
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