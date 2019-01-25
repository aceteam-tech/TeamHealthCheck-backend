const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (users) => {
    const params = {
        RequestItems: {
            [`HC-${process.env.STAGE}-Profiles`]: {
                Keys: users.map(u => ({id: u}))
            }
        }
    }
    return (await db.batchGet(params).promise()).Responses[`HC-${process.env.STAGE}-Profiles`]
}