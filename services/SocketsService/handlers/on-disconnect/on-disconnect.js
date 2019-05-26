const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const ProfileTable = require('../../db/ProfilesTable')

const queryConnection = async (id) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
        KeyConditionExpression: 'connection_id = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    return (await db.query(params).promise()).Items[0]
}

const removeSocketFromConnectionsTable = async (connection) => {
    const params = {
        TableName: process.env.CONNECTIONS_TABLE,
        Key: connection,
        ReturnValues: 'ALL_OLD'
    }
    console.log({'params': params});
    return (await db.delete(params).promise()).Attributes.user_id
}

const removeSocketFromAssociatedProfile = async (connectionId, sockets, profileId) => {
    const params = {
        TableName: process.env.PROFILES_TABLE,
        Key: { id: profileId },
        UpdateExpression: 'set sockets = :sockets',
        ExpressionAttributeValues: {
            ':sockets': sockets.filter(s => s !== connectionId)
        }
    }
    return (await db.update(params).promise()).Attributes
}

module.exports.handler = async (event) => {
    const connectionId = event.requestContext.connectionId.toString()

    const connection = await queryConnection(connectionId)
    const profileId = await removeSocketFromConnectionsTable(connection)
    const profile = await ProfileTable.getProfileAsync(profileId)
    await removeSocketFromAssociatedProfile(connectionId, profile.sockets, profile.id)

    return {
        statusCode: 200
    }

}
