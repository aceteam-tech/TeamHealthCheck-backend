const AWS = require('aws-sdk')
const VotesTable = require('../../db/VotesTable')
const VotingsTable = require('../../db/VotingsTable')
const ProfilesTable = require('../../db/ProfilesTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const { categories } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { teamId } = event.pathParameters

    const profile = await ProfilesTable.getProfileByEmailAsync(email)

    const activeVoting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const vote = await VotesTable.addVoteAsync(profile.id, activeVoting.id, categories)

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
