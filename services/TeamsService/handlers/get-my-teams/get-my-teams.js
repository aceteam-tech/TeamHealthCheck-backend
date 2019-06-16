const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    console.log({'event.requestContext.authorizer': event.requestContext.authorizer});

    const profile = await ProfilesTable.getProfileByEmailAsync(email)
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
