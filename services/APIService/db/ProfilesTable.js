const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()

const TableName = process.env.PROFILES_TABLE

class ProfilesTable {
    static async putProfileAsync(username, name){
        const params = {
            TableName,
            Item: {
                id: username,
                name,
                teams:[]
            }
        }
        return db.put(params).promise()
    }
}

module.exports = ProfilesTable