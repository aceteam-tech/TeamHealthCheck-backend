const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (userId, teams) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        Key: {id: userId},
        UpdateExpression: `SET teams = :teams`,
        ExpressionAttributeValues: {
            ':teams': teams
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise()).Attributes
}