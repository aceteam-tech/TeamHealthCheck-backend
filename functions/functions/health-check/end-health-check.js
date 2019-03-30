const sumBy = require('lodash.sumby')
const queryActiveHealthCheck = require('../../database/health-checks/query-active-health-check.dynamodb')
const queryHealthCheckStatuses = require('../../database/health-statuses/query-health-check-statuses.dynamodb')
const endHealthCheck = require('../../database/health-checks/end-health-check.dynamodb')

function flattenVotes(votes) {
    return [].concat(...votes.map(s => s.categories))
}

function pickVotesForCategory(votes, categoryId){
    return votes.filter(s => s.id === categoryId)
}

function calculateValue(totalPoints, votesCount){
    const MAX_POINTS = 2

    return totalPoints * 100 / votesCount / MAX_POINTS
}

function categoryWithValue(category, votes){
    const categoryVotes = pickVotesForCategory(votes, category.id)
    if (!categoryVotes.length) return

    const totalPoints = sumBy(categoryVotes, 'value')

    const value = calculateValue(totalPoints, categoryVotes.length)
    const categoryWithValue = {...category, value}

    return categoryWithValue
}

function calculateCategories (votes, categories) {
    return categories.map(c => categoryWithValue(c, votes)).filter(c=>c)
}
const lambda = async (event) => {
    const {teamId} = JSON.parse(event.body)

    const healthCheck = await queryActiveHealthCheck(teamId)
    const healthStatuses = await queryHealthCheckStatuses(healthCheck.id)

    if (healthStatuses.length === 0) {
        const updated = await endHealthCheck(healthCheck, healthCheck.categories)
        return {
            statusCode: 200,
            body: JSON.stringify(updated)
        }
    }

    const flattenedVotes = flattenVotes(healthStatuses)
    const calculatedCategories = calculateCategories(flattenedVotes, healthCheck.categories)
    const updated = await endHealthCheck(healthCheck, calculatedCategories)
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