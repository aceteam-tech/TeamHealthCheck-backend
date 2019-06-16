const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

const TableName = process.env.PROFILES_TABLE

export default class ProfilesTable {
    static async putProfileAsync(cognitoId, name){
        const params = {
            TableName,
            Item: {
                id: uuid(),
                name,
                cognitoId,
                teams:[]
            }
        }
        return db.put(params).promise()
    }

    static async updateEmail(id, email){
        const updateParams = {
            TableName,
            Key: {
                id
            },
            UpdateExpression: 'set email = :email',
            ExpressionAttributeValues: {
                ':email' : email
            }
        }

        return db.update(updateParams).promise()
    }
}