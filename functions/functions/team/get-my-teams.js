const findTeamsDB = require('../../database/teams/find-batch-teams.dynamodb')
const getProfileDB = require('../../database/profiles/get-profile.dynamodb')
const getProfilesDB = require('../../database/profiles/get-batch-profiles.dynamodb')

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub

    const profile = await getProfileDB(profileId)
    if (profile.teams.length === 0) {
        return {
            statusCode: 200,
            body: JSON.stringify([])
        }
    }

    const teams = await findTeamsDB(profile.teams)
    const teamsWithUsers = await (Promise.all(teams.map(async t => {
        const users = await getProfilesDB(t.users)
        return {
            ...t,
            users
        }
    })))
    return {
        statusCode: 200,
        body: JSON.stringify(teamsWithUsers)
    }
};
