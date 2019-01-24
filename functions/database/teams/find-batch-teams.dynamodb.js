const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports = async (teams) => {
    var params = {
        RequestItems: {
            [`HC-${process.env.STAGE}-Teams`]: {
                Keys: teams.map(t => ({id: t}))
            }
        }
    };

    return (await db.batchGet(params).promise()).Responses[`HC-${process.env.STAGE}-Teams`]
}