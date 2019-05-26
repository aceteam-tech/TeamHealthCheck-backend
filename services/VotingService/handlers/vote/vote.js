const VotesTable = require('../../db/VotesTable')
const VotingsTable = require('../../db/VotingsTable')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const { categories } = JSON.parse(event.body)
    const { teamId } = event.pathParameters

    const activeVoting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const healthStatus = await VotesTable.addVoteAsync(profileId, activeVoting.id, categories)

    return {
        statusCode: 200,
        body: JSON.stringify(healthStatus)
    }
}
