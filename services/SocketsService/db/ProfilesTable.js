const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.PROFILES_TABLE

class ProfilesTable {
    static async getProfileAsync(profileId){
        const params = {
            TableName,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': profileId
            }
        }
        return (await db.query(params).promise()).Items[0]
    }

    static async getBatchProfilesAsync(users){
        const params = {
            RequestItems: {
                [TableName]: {
                    Keys: users.map(u => ({id: u}))
                }
            }
        }
        return (await db.batchGet(params).promise()).Responses[TableName]
    }

    static async addTeamAsync(teamId, profileId){
        const params = {
            TableName,
            Key: {id: profileId},
            UpdateExpression: `SET teams = list_append(teams, :teamId)`,
            ExpressionAttributeValues: {
                ':teamId': [teamId]
            },
            ReturnValues: 'ALL_NEW'
        }
        return (await db.update(params).promise())
    }

    static async updateTeamsAsync(userId, teams){
        const params = {
            TableName,
            Key: {id: userId},
            UpdateExpression: `SET teams = :teams`,
            ExpressionAttributeValues: {
                ':teams': teams
            },
            ReturnValues: 'ALL_NEW'
        }
        return (await db.update(params).promise()).Attributes
    }
}

module.exports = ProfilesTable