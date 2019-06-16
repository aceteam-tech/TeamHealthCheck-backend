const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const ProfileTable = require('../../db/ProfilesTable')

const addSocketToConnectionsTable = async (connectionId, userId) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
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
        TableName: process.env.PROFILES_TABLE,
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
    const email = event.requestContext.authorizer.email.toString()
    const connectionId = event.requestContext.connectionId.toString()

    const profile = await ProfileTable.getProfileByEmailAsync(email)
    console.log({'profile': profile});
    await addSocketToConnectionsTable(connectionId, profile.id)
    await pushSocketToAssociatedProfile(connectionId, profile.sockets, profile.id)

    return {
        statusCode: 200
    }

}
