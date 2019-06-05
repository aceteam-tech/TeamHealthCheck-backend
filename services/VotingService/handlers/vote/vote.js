const AWS = require('aws-sdk')
const VotesTable = require('../../db/VotesTable')
const VotingsTable = require('../../db/VotingsTable')
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.PUBLISH_SOCKET_TOPIC

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const { categories } = event.body
    const { teamId } = event.pathParameters

    const activeVoting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const vote = await VotesTable.addVoteAsync(profileId, activeVoting.id, categories)

    const team = await TeamsTable.queryTeamByIdAsync(teamId)
    const profiles = await ProfilesTable.getBatchProfilesAsync(team.users)
    const userVoted = profiles.find(({id}) => id === profileId)

    await Promise.all(profiles.map(async ({id, sockets}) => {
        await Promise.all(sockets.map(async s => {

            const params = {
                Message: JSON.stringify({
                    socketId: s,
                    body: {
                        action: 'userVoted',
                        user: userVoted
                    }
                }),
                TopicArn
            }

            await sns.publish(params).promise()
        }))
    }))

    return {
        statusCode: 200,
        body: JSON.stringify(vote)
    }
}
