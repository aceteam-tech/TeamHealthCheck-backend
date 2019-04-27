const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (teamId, users) => {
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
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