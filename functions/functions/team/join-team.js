const joinTeam = require('./team').joinTeam;

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamId} = JSON.parse(event.body)
    const connection = await joinTeam(teamId, profileId);
    return {
        statusCode: 200,
        body: JSON.stringify(connection)
    }
};