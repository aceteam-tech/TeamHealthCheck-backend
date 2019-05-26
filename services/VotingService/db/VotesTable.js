const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.VOTES_TABLE

class VotesTable {
    static async addVoteAsync(profileId, healthCheckId, categories){
        const params = {
            TableName,
            Item: {
                user_id: profileId,
                voting_id: healthCheckId,
                categories
            }
        }
        await db.put(params).promise()
        return params.Item
    }

    static async queryVotesAsync(votingId){
        const params = {
            TableName,
            KeyConditionExpression: 'voting_id = :id',
            ExpressionAttributeValues: {
                ':id': votingId
            }
        }
        return (await db.query(params).promise()).Items
    }
}

module.exports = VotesTable