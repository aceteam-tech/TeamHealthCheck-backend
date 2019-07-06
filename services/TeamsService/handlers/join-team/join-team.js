const AWS = require('aws-sdk')
const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const {code} = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const teams = await TeamsTable.queryTeamByCodeAsync(code)

    const profile = await ProfilesTable.getProfileByEmailAsync(email)

    const team = await TeamsTable.addProfileAsync(teams[0].id, profile.id)
    await ProfilesTable.addTeamAsync(teams[0].id, profile.id)

    const users = await ProfilesTable.getBatchProfilesAsync(team.users)
    const teamWithUsers = {
        ...team,
        users
    }

    const socketResponseParams = {
        Message: JSON.stringify({
            teamId: team.id,
            ignoredProfiles: [profile.id],
            body: {
                action: 'newUser',
                teamId: team.id,
                user: profile
            }
        }),
        TopicArn
    }
    
    console.log({'socketResponseParams': socketResponseParams});

    await sns.publish(socketResponseParams).promise()

    return {
        statusCode: 200,
        body: JSON.stringify(teamWithUsers)
    }
};