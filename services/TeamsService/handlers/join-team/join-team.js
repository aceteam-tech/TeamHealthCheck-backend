const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const {code} = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const teams = await TeamsTable.queryTeamByCodeAsync(code)

    const profile = await ProfilesTable.getProfileByEmailAsync(email)

    const team = await TeamsTable.addProfileAsync(teams[0].id, profile.id)
    await ProfilesTable.addTeamAsync(teams[0].id, profile.id)

    const users = await ProfilesTable.getBatchProfilesAsync(team.users)
    const teamWithUsers = {
        ...team,
        users
    }

    return {
        statusCode: 200,
        body: JSON.stringify(teamWithUsers)
    }
};