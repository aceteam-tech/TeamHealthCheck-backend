import AWS from 'aws-sdk'
import uuid from 'uuid/v4'
import { transformTableProperties } from './migrate.helpers'

const db = new AWS.DynamoDB()


const tablesToMigrate = [
    {
        prevName: 'HC-staging-HealthChecks',
        currName: `HC-${process.env.STAGE}-VotingsTable`
    },
    {
        prevName: 'HC-staging-HealthStatuses',
        currName: `HC-${process.env.STAGE}-VotesTable`,
        transformations: [
            (record) => {
                record.voting_id = record.health_check_id
                delete record.health_check_id
                return record
            }
        ]
    },
    {
        prevName: 'HC-staging-Profiles',
        currName: `HC-${process.env.STAGE}-ProfilesTable`
    },
    {
        prevName: 'HC-staging-Teams',
        currName: `HC-${process.env.STAGE}-TeamsTable`
    }
]

const copyTable = async ({prevName, currName, transformations}) => {

    const params = {
        TableName : prevName
    };
    const table = await db.scan(params).promise()
    const records = transformations ? transformTableProperties(table.Items, transformations) : table.Items

    const batches = Math.ceil(records.length / 25)
    console.log({'batches': batches});

    await Promise.all(new Array(batches).fill('a').map(async (_, i) => {
        const start = i * 25
        const stop = start + 25
        const writeParams = {
            RequestItems: {
                [currName]: records.slice(start, stop).map(Item => ({
                    PutRequest: {
                        Item
                    }
                }))
            }
        }
        await db.batchWriteItem(writeParams).promise()
    }))

    console.log(`${prevName} -> ${currName} migrated!`);
}

export const lambda = async (event, context) => {
    await Promise.all(tablesToMigrate.map(async table => {
        await copyTable(table)
    }))

    return 'All tables migrated!'
}