const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const getProfileDB = require('../database/profiles/get-profile.dynamodb')

const addSocketToConnectionsTable = async (connectionId, userId) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Connections`,
        Item: {
            connection_id: connectionId,
            user_id: userId
        }
    }
    await db.put(params).promise()
    return params.Item
}

const pushSocketToAssociatedProfile = async (connectionId, sockets, profileId) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
        Key: { id: profileId },
        UpdateExpression: 'set sockets = :sockets',
        ExpressionAttributeValues: {
            ':sockets': [].concat(sockets, connectionId)
        }
    }
    return (await db.update(params).promise()).Attributes
}

module.exports.handler = async (event) => {
    const uuid = event.headers.token.toString()
    const connectionId = event.requestContext.connectionId.toString()

    const profile = await getProfileDB(uuid.toString())
    await addSocketToConnectionsTable(connectionId, profile.id)
    await pushSocketToAssociatedProfile(connectionId, profile.sockets, profile.id)

    return {
        statusCode: 200
    }

}
