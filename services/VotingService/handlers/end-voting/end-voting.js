const sumBy = require('lodash.sumby')
const VotingsTable = require('../../db/VotingsTable')
const VotesTable = require('../../db/VotesTable')

function flattenVotes(votes) {
    return [].concat(...votes.map(s => s.categories))
}

function pickVotesForCategory(votes, categoryId) {
    return votes.filter(s => s.id === categoryId)
}

function calculateValue(totalPoints, votesCount) {
    const MAX_POINTS = 2

    return totalPoints * 100 / votesCount / MAX_POINTS
}

function categoryWithValue(category, votes) {
    const categoryVotes = pickVotesForCategory(votes, category.id)
    if (!categoryVotes.length) return

    const totalPoints = sumBy(categoryVotes, 'value')

    const value = calculateValue(totalPoints, categoryVotes.length)
    const categoryWithValue = { ...category, value }

    return categoryWithValue
}

function calculateCategories(votes, categories) {
    return categories.map(c => categoryWithValue(c, votes)).filter(c => c)
}

const lambda = async (event) => {
    const { teamId } = event.pathParameters

    const voting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const votes = await VotesTable.queryVotesAsync(voting.id)

    if (votes.length === 0) {
        const updated = await VotingsTable.endVotingAsync(voting, voting.categories)
        return {
            statusCode: 200,
            body: JSON.stringify(updated)
        }
    }

    const flattenedVotes = flattenVotes(votes)
    const calculatedCategories = calculateCategories(flattenedVotes, voting.categories)
    const updated = await VotingsTable.endVotingAsync(voting, calculatedCategories)
    return {
        statusCode: 200,
        body: JSON.stringify(updated)
    }
}
module.exports = {
    lambda,
    flattenVotes,
    calculateCategories
}