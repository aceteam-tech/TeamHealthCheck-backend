const AWS = require('aws-sdk')
const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
const TeamTopicArn = process.env.NOTIFY_TEAM_TOPIC
const SocketTopicArn = process.env.CALL_SOCKET_TOPIC

module.exports.lambda = async (event) => {
    const { removedUserId } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { teamId } = event.pathParameters

    const team = await TeamsTable.queryTeamByIdAsync(teamId)

    const remainingUsers = team.users.filter(u => u !== removedUserId)

    const user = await ProfilesTable.getProfileAsync(removedUserId)
    const remainingTeams = user.teams.filter(t => t !== teamId)

    try {
        const updatedTeam = await TeamsTable.updateProfilesAsync(teamId, remainingUsers)
        const profile = await ProfilesTable.updateTeamsAsync(removedUserId, remainingTeams)
        console.log({ 'profile': profile });

        try {
            if(updatedTeam.users.length){
                const teamResponseParams = {
                    Message: JSON.stringify({
                        teamId,
                        body: {
                            action: 'userRemoved',
                            teamId,
                            removedUserId
                        }
                    }),
                    TopicArn: TeamTopicArn
                }

                const teamSnsResponse = await sns.publish(teamResponseParams).promise()
                console.log({'teamSnsResponse': teamSnsResponse});
            }

            await Promise.all(profile.sockets.map(async (socket) => {
                const userResponseParams = {
                    Message: JSON.stringify({
                        socketId: socket,
                        body: {
                            action: 'userRemoved',
                            teamId,
                            removedUserId
                        }
                    }),
                    TopicArn: SocketTopicArn
                }

                console.log({'userResponseParams': userResponseParams})

                await sns.publish(userResponseParams).promise()
            }))

            return {
                statusCode: 200,
                body: JSON.stringify(updatedTeam)
            }
        } catch (e) {
            return {
                statusCode: 500,
                body: JSON.stringify(e)
            }
        }
    } catch(e) {
        return {
            statusCode: 500,
            body: 'Unable to update team users'
        }
    }
}