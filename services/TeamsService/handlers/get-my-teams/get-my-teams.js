const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub

    const profile = await ProfilesTable.getProfileAsync(profileId)
    if (profile.teams.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify([])
        }
    }

    const teams = await TeamsTable.findBatchTeamsAsync(profile.teams)
    const teamsWithUsers = await (Promise.all(
        teams.map(async t => {
            const users = await ProfilesTable.getBatchProfilesAsync(t.users)
            return {
                ...t,
                users
            }
        })
    ))
    return {
        statusCode: 200,
        body: JSON.stringify(teamsWithUsers)
    }
}
