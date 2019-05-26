const VotingsTable = require('../../db/VotingsTable')
const VotesTable = require('../../db/VotesTable')
const ProfilesTable = require('../../db/ProfilesTable')

module.exports.lambda = async (event) => {
    const {teamId} = event.pathParameters

    const activeHealthCheck = (await VotingsTable.queryByStatusAsync(teamId, false))[0]

    if (!activeHealthCheck) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                ended: true
            })
        }
    }

    const healthStatuses = await VotesTable.queryVotesAsync(activeHealthCheck.id)

    const usersSubmitted = await (Promise.all(healthStatuses
        .map(async s => ProfilesTable.getProfileAsync(s.user_id))))

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: activeHealthCheck.id,
            ended: false,
            usersSubmitted,
            categories: activeHealthCheck.categories
        })
    }
}