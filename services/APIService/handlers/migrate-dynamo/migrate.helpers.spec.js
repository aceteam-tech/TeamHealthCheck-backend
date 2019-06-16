import { transformTableProperties } from './migrate.helpers'

describe('transformTableProperties', () => {

    it(`Should transform a single property`, () => {
        const records = [{
            health_check_id: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' },
            categories: { L: [] },
            user_id: { S: '2e68bcd0-65e0-4b11-9f5e-015de0d5823b' }
        }, {
            health_check_id: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' },
            categories: { L: [] },
            user_id: { S: '2e68bcd0-65e0-4b11-9f5e-015de0d5823b' }
        }]

        const transformations = [
            (record) => {
                record.voting_id = record.health_check_id
                delete record.health_check_id
                return record
            }
        ]

        const expected = [{
            voting_id: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' },
            categories: { L: [] },
            user_id: { S: '2e68bcd0-65e0-4b11-9f5e-015de0d5823b' }
        }, {
            voting_id: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' },
            categories: { L: [] },
            user_id: { S: '2e68bcd0-65e0-4b11-9f5e-015de0d5823b' }
        }]

        expect(transformTableProperties(records, transformations)).toEqual(expected)
    })

    it(`Should execute a custom mapper functions`, () => {
        const records = [{
            cognitoId: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' }
        }, {
            cognitoId: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e87' }
        }]

        const customMappers = [
            (item) => ({
                ...item,
                id: { S: '1' }
            })
        ]

        const expected = [{
            cognitoId: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e86' },
            id: { S: '1' }
        }, {
            cognitoId: { S: '3c0fedc2-30d7-49a6-8889-419cb77b7e87' },
            id: { S: '1' }
        }]

        expect(transformTableProperties(records, customMappers)).toEqual(expected)
    })

})