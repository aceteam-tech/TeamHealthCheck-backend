const queryActiveHealthCheck = require('../../database/health-checks/query-active-health-check.dynamodb')
const queryHealthCheckStatuses = require('../../database/health-statuses/query-health-check-statuses.dynamodb')
const endHealthCheck = require('../../database/health-checks/end-health-check.dynamodb')

function calculateCategories (votes, categories) {
    const MAX_POINTS = 2

    const votesCategories = [].concat(...votes.map(s => s.categories))

    return categories.map(c => {
        const votes = votesCategories.filter(s => s.id === c.id)
        if (!votes.length) return

        const pointsTotal = votes
            .map(s => s.value)
            .reduce((prev, curr) => prev + curr)

        const averageValue = pointsTotal * 100 / votes.length / MAX_POINTS
        const categoryWithValue = {...c, value: averageValue}

        return categoryWithValue
    }).filter(c=>c)
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

    const calculatedCategories = calculateCategories(healthStatuses, healthCheck.categories)
    const updated = await endHealthCheck(healthCheck, calculatedCategories)
    return {
        statusCode: 200,
        body: JSON.stringify(updated)
    }
}
module.exports = {
    lambda,
    calculateCategories
}