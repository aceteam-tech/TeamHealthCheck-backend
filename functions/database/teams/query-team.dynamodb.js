const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (teamId) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': teamId
        }
    }
    const response = await db.query(params).promise()
    return response.Items[0]
}