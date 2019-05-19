const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const getProfileDB = require('../database/profiles/get-profile.dynamodb')

const queryConnection = async (id) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Connections`,
        KeyConditionExpression: 'connection_id = :id',
        ExpressionAttributeValues: {
            ':id': id
        }
    }
    return (await db.query(params).promise()).Items[0]
}

const removeSocketFromConnectionsTable = async (connection) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Connections`,
        Key: connection,
        ReturnValues: 'ALL_OLD'
    }
    console.log({'params': params});
    return (await db.delete(params).promise()).Attributes.user_id
}

const removeSocketFromAssociatedProfile = async (connectionId, sockets, profileId) => {
    const params = {
        TableName: `HC-${process.env.STAGE}-Profiles`,
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
    const profile = await getProfileDB(profileId)
    await removeSocketFromAssociatedProfile(connectionId, profile.sockets, profile.id)

    return {
        statusCode: 200
    }

}
