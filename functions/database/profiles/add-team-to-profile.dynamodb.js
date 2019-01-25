const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (teamId, profileId) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        Key: {id: profileId},
        UpdateExpression: `SET teams = list_append(teams, :teamId)`,
        ExpressionAttributeValues: {
            ':teamId': [teamId]
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise())
}