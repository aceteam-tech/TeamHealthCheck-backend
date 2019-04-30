const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (userId, token) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        Key: {id: userId},
        UpdateExpression: `SET pushToken = :token`,
        ExpressionAttributeValues: {
            ':token': token
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise()).Attributes
}