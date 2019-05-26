const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
const db = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.TEAMS_TABLE

class TeamsTable {
    static async createTeamAsync(code, name, categories){
        const id = uuid()
        const params = {
            TableName,
            Item: {
                id,
                name,
                code,
                users: [],
                categories
            }
        }
        await db.put(params).promise()
        return params.Item
    }

    static async queryTeamByCodeAsync(code){
        const params = {
            TableName,
            IndexName: 'gsi_code',
            KeyConditionExpression: 'code = :code',
            ExpressionAttributeValues: {
                ':code': code
            }
        }
        return (await db.query(params).promise()).Items
    }

    static async queryTeamByIdAsync(teamId){
        const params = {
            TableName,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': teamId
            }
        }
        const response = await db.query(params).promise()
        return response.Items[0]
    }

    static async findBatchTeamsAsync(teams){
        const params = {
            RequestItems: {
                [process.env.TEAMS_TABLE]: {
                    Keys: teams.map(t => ({id: t}))
                }
            }
        };

        return (await db.batchGet(params).promise()).Responses[TableName]
    }

    static async addProfileAsync(teamId, profileId){
        const params = {
            TableName,
            Key: {id: teamId},
            UpdateExpression: `SET #u = list_append(#u, :profileId)`,
            ExpressionAttributeValues: {
                ':profileId': [profileId]
            },
            ExpressionAttributeNames: {
                '#u': 'users'
            },
            ReturnValues: 'ALL_NEW'
        }
        return (await db.update(params).promise()).Attributes
    }

    static async updateProfilesAsync(teamId, users){
        const params = {
            TableName,
            Key: {id: teamId},
            UpdateExpression: `SET #u = :users`,
            ExpressionAttributeValues: {
                ':users': users
            },
            ExpressionAttributeNames: {
                '#u': 'users'
            },
            ReturnValues: 'ALL_NEW'
        }
        return (await db.update(params).promise()).Attributes
    }

}

module.exports = TeamsTable