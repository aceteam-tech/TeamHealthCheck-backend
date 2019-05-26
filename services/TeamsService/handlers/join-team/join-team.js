const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {code} = JSON.parse(event.body)

    const teams = await TeamsTable.queryTeamByCodeAsync(code)

    const team = await TeamsTable.addProfileAsync(teams[0].id, profileId)
    await ProfilesTable.addTeamAsync(teams[0].id, profileId)
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