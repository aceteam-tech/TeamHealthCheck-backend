const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')
const initialCategories = require('./initialCategories.json')
const joinTeam = require('./team').joinTeam

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamName} = JSON.parse(event.body)
    const team = await createTeam(teamName, profileId)
    const team = await joinTeam(team.id, profileId)

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
};

async function createTeam(name){
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        Item: {
            id: uuid(),
            name,
            users: [],
            categories: initialCategories
        }
    }
    await db.put(params).promise()
    return params.Item
}