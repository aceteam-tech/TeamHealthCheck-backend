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
    console.log({'event.requestContext.authorizer': event.requestContext.authorizer});
    console.log({'event.requestContext': event.requestContext});
    const uuid = event.requestContext.authorizer.sub.toString()
    const connectionId = event.requestContext.connectionId.toString()

    const profile = await getProfileDB(uuid.toString())
    console.log({'profile': profile});
    await addSocketToConnectionsTable(connectionId, profile.id)
    await pushSocketToAssociatedProfile(connectionId, profile.sockets, profile.id)

    return {
        statusCode: 200
    }

}
