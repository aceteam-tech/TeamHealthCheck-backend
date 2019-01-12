const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports.lambda = async (event, context) => {
    const {userName} = event
    const {name} = event.request.userAttributes
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
        Item: {
            id:userName,
            name,
            teams:[]
        }
    }
    await db.put(params).promise()

    return event;
};
