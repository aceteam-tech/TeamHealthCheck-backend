const joinTeam = require('../../helpers/join-team.helper');

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = JSON.parse(event.body)

    const team = await joinTeam(teamId, profileId);

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
};