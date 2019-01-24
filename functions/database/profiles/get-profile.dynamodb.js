const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (profileId) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': profileId
        }
    }
    return (await db.query(params).promise()).Items[0]
}