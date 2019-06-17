const AWS = require('aws-sdk')
const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

module.exports.lambda = async (event) => {
    const { removedUserId } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { teamId } = event.pathParameters

    const team = await TeamsTable.queryTeamByIdAsync(teamId)

    const remainingUsers = team.users.filter(u => u !== removedUserId)

    const user = await ProfilesTable.getProfileAsync(removedUserId)
    const remainingTeams = user.teams.filter(t => t !== teamId)

    try {
        const updatedTeam = await TeamsTable.updateProfilesAsync(teamId, remainingUsers)
        await ProfilesTable.updateTeamsAsync(removedUserId, remainingTeams)

        let socketResponseParams = {
            Message: JSON.stringify({
                teamId,
                body: {
                    action: 'userRemoved',
                    teamId,
                    removedUserId
                }
            }),
            TopicArn
        }

        await sns.publish(socketResponseParams).promise()

        return {
            statusCode: 200,
            body: JSON.stringify(updatedTeam)
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: 'Unable to update team users'
        }
    }
}