const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (userName, name) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
        Item: {
            id:userName,
            name,
            teams:[]
        }
    }
    return db.put(params).promise()
}