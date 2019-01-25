const uuid = require('uuid/v4')
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (team) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-HealthChecks`,
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