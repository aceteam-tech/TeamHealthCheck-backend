const endHealthCheck = require('../end-health-check')
const flattenVotes = endHealthCheck.flattenVotes
const calculateCategories = endHealthCheck.calculateCategories

describe('flattenVotes function', () => {
    it('For 2 full health check statuses', () => {
        const categories = [
            { "id": "1", "value": 1 },
            { "id": "2", "value": 2 }
        ]
        const votes = [
            { categories },
            { categories }
        ]
        const expected = [
            ...categories,
            ...categories
        ]
        const flattenedVotes = flattenVotes(votes)
        expect(flattenedVotes).toEqual(expected)
    })
})

describe('calculateCategories function', () => {
    // Function takes two attributes
    // Votes - An array of votes.
    let votes = [{
        categories: []
    }]
    // Each vote contains categories property which is an array of health check categories with their values.
    let voteCategories = [
        { "id": "1", "value": 1 },
        { "id": "2", "value": 2 },
        { "id": "3", "value": 0 }
    ]
    // Health check categories - An array of health check categories.
    const healthCategories = [
        { "id": "1" },
        { "id": "2" },
        { "id": "3" }
    ]

    describe('Happy path', () => {
        it('For 2 full health check statuses', () => {
            votes = [
                ...voteCategories,
                ...voteCategories
            ]
            const expected = [
                { "id": "1", "value": 50 },
                { "id": "2", "value": 100 },
                { "id": "3", "value": 0 }
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 2 unfull health check statuses', () => {
            const category1 = { "id": "1", "value": 1 }
            votes = [
                ...[category1, { "id": "3", "value": 0 }],
                ...[category1, { "id": "2", "value": 2 }]
            ]
            const expected = [
                { "id": "1", "value": 50 },
                { "id": "2", "value": 100 },
                { "id": "3", "value": 0 }
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 1 full health check status', () => {
            votes = voteCategories
            const expected = [
                { "id": "1", "value": 50 },
                { "id": "2", "value": 100 },
                { "id": "3", "value": 0 }
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 1 not full health check status', () => {
            votes = [{ "id": "1", "value": 1 },
                { "id": "3", "value": 0 }]
            const expected = [
                { "id": "1", "value": 50 },
                { "id": "3", "value": 0 }
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
        it('For 1 full health check with all zeros', () => {
            votes = [
                { "id": "1", "value": 0 },
                { "id": "2", "value": 0 },
                { "id": "3", "value": 0 }
            ]
            const expected = [
                { "id": "1", "value": 0 },
                { "id": "2", "value": 0 },
                { "id": "3", "value": 0 }
            ]
            const calculatedCategories = calculateCategories(votes, healthCategories)
            expect(calculatedCategories).toEqual(expected)
        })
    })
})