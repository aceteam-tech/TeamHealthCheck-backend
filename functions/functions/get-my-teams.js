const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub
    let teams = []
    console.log(event);

    const profile = await getProfile(profileId)
    if(profile.teams.length){
        teams = await findTeams(profile.teams)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(teams)
    }
};

async function getProfile(profileId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': profileId
        }
    }
    return (await db.query(params).promise()).Items[0]
}

async function findTeams(teams){
    var params = {
        RequestItems: {
            [`HC-${process.env.STAGE}-Teams`]: {
                Keys: teams.map(t => ({id: t}))
            }
        }
    };

    return (await db.batchGet(params).promise()).Responses[`HC-${process.env.STAGE}-Teams`]
}
