const calculateCategories = require('../end-health-check').calculateCategories

const voteCategories = [
    {"id": "1", "value": 1},
    {"id": "2", "value": 2},
    {"id": "3", "value": 0}
]
const healthCategories = [
    {"id": "1",},
    {"id": "2",},
    {"id": "3",},
]

describe('calculateCategories function', () => {
    describe('Happy path', () => {
        it('For 2 full health check statuses', () => {
            const votes = [
                {categories: voteCategories},
                {categories: voteCategories}
            ]
            const expected = [
                {"id": "1", "value": 50},
                {"id": "2", "value": 100},
                {"id": "3", "value": 0},
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 2 unfull health check statuses', () => {
            const category1 = {"id": "1", "value": 1}
            const votes = [
                {categories: [category1, {"id": "3", "value": 0}]},
                {categories: [category1, {"id": "2", "value": 2}]}
            ]
            const expected = [
                {"id": "1", "value": 50},
                {"id": "2", "value": 100},
                {"id": "3", "value": 0},
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 1 full health check status', () => {
            const votes = [{categories: voteCategories}]
            const expected = [
                {"id": "1", "value": 50},
                {"id": "2", "value": 100},
                {"id": "3", "value": 0},
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 1 not full health check status', () => {
            const votes = [{
                categories: [
                    {"id": "1", "value": 1},
                    {"id": "3", "value": 0}
                ]
            }]
            const expected = [
                {"id": "1", "value": 50},
                {"id": "3", "value": 0},
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
    })
})