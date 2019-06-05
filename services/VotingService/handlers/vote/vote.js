const AWS = require('aws-sdk')
const VotesTable = require('../../db/VotesTable')
const VotingsTable = require('../../db/VotingsTable')
const ProfilesTable = require('../../db/ProfilesTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const { categories } = JSON.parse(event.body)
    const { teamId } = event.pathParameters

    const activeVoting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const vote = await VotesTable.addVoteAsync(profileId, activeVoting.id, categories)

    const profile = await ProfilesTable.getProfileAsync(profileId)

    const params = {
        Message: JSON.stringify({
            teamId,
            body: {
                action: 'userVoted',
                user: profile
            }
        }),
        TopicArn
    }

    await sns.publish(params).promise()

    return {
        statusCode: 200,
        body: JSON.stringify(vote)
    }
}
