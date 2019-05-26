const VotingsTable = require('../../db/VotingsTable')

module.exports.lambda = async (event) => {
    const { teamId } = event.pathParameters

    const votings = await VotingsTable.queryByStatusAsync(teamId, true)
    const votingsWithVotes = votings.filter(hc => typeof hc.categories[0].value !== 'undefined')

    return {
        statusCode: 200,
        body: JSON.stringify(votingsWithVotes)
    }
}