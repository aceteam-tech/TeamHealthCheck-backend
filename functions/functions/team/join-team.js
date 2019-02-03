const joinTeam = require('../../helpers/join-team.helper');
const queryTeamsByCodeDB = require('../../database/teams/query-team-by-code.dynamodb')
const getProfilesDB = require('../../database/profiles/get-batch-profiles.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {code} = JSON.parse(event.body)

    const teams = await queryTeamsByCodeDB(code)
    const team = await joinTeam(teams[0].id, profileId)
    const users = await getProfilesDB(team.users)
    const teamWithUsers = {
        ...team,
        users
    }

    return {
        statusCode: 200,
        body: JSON.stringify(teamWithUsers)
    }
};