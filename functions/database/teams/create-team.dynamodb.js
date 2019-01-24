const uuid = require('uuid/v4')
const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async function(name, categories) {
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        Item: {
            id: uuid(),
            name,
            users: [],
            categories
        }
    }
    await db.put(params).promise()
    return params.Item
}