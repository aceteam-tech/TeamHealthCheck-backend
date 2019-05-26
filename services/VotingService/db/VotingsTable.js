const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
const db = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.VOTINGS_TABLE

class VotingsTable {
    static async addVotingAsync(team){
        const params = {
            TableName,
            Item: {
                id: uuid(),
                team_id: team.id,
                categories: team.categories,
                date: Date.now(),
                ended: false
            }
        }
        await db.put(params).promise()
        return params.Item
    }

    static async queryByStatusAsync(teamId, ended){
        const params = {
            TableName,
            KeyConditionExpression: 'team_id = :id',
            FilterExpression: 'ended = :ended',
            ExpressionAttributeValues: {
                ':id': teamId,
                ':ended': ended
            }
        }
        return (await db.query(params).promise()).Items
    }

    static async endVotingAsync(voting, categories){
        const params = {
            TableName,
            Key: {
                team_id : voting.team_id,
                date: voting.date
            },
            UpdateExpression: 'set categories = :categories, ended = :ended',
            ExpressionAttributeValues: {
                ':categories' : categories,
                ':ended' : true
            },
            ReturnValues: 'ALL_NEW'
        }
        return (await db.update(params).promise()).Attributes
    }


}

module.exports = VotingsTable