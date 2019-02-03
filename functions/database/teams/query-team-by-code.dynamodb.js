const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (code) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        IndexName: 'gsi_code',
        KeyConditionExpression: 'code = :code',
        ExpressionAttributeValues: {
            ':code': code
        }
    }
    return (await db.query(params).promise()).Items
}