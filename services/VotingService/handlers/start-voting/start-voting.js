const AWS = require('aws-sdk')
const VotingsTable = require('../../db/VotingsTable')
const TeamsTable = require('../../db/TeamsTable')
const ProfilesTable = require('../../db/ProfilesTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const {teamId} = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const profile = await ProfilesTable.getProfileByEmailAsync(email)

    const team = await TeamsTable.queryTeamByIdAsync(teamId)
    if(team.users.includes(profile.id)){
        const healthStatus = await VotingsTable.addVotingAsync(team)

        const params = {
            Message: JSON.stringify({
                teamId,
                body: {
                    action: 'votingStarted',
                    voting: {
                        id: healthStatus.id,
                        ended: healthStatus.ended,
                        usersSubmitted: [],
                        categories: healthStatus.categories
                    }
                }
            }),
            TopicArn
        }

        await sns.publish(params).promise()

        return {
            statusCode: 200,
            body: JSON.stringify({...healthStatus, usersSubmitted: []})
        }
    } else {
        return {
            statusCode: 401,
            body: "You are unauthorized to create health check for this team"
        }
    }
}