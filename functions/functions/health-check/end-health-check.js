const queryActiveHealthCheck = require('../../database/health-checks/query-active-health-check.dynamodb')
const queryHealthCheckStatuses = require('../../database/health-statuses/query-health-check-statuses.dynamodb')
const endHealthCheck = require('../../database/health-checks/end-health-check.dynamodb')

const MAX_POINTS = 2

module.exports.lambda = async (event) => {
    const {teamId} = JSON.parse(event.body)

    const healthCheck = await queryActiveHealthCheck(teamId)
    const healthStatuses = await queryHealthCheckStatuses(healthCheck.id)

    if(healthStatuses.length === 0){
        const updated = await endHealthCheck(healthCheck, healthCheck.categories)
        return {
            statusCode: 200,
            body: JSON.stringify(updated)
        }
    }

    const allHealthStatusesCategories = [].concat(...healthStatuses.map(s => s.categories))

    const calculatedCategories = healthCheck.categories.map(c => {
        const categoryStatuses = allHealthStatusesCategories.filter(s => s.id === c.id)
        const categorySum = categoryStatuses
            .map(s=>s.value)
            .reduce((prev, curr)=>prev+curr)
        return {
            ...c,
            value: categorySum * 100 / categoryStatuses.length / MAX_POINTS
        }
    })
    const updated = await endHealthCheck(healthCheck, calculatedCategories)
    return {
        statusCode: 200,
        body: JSON.stringify(updated)
    }
}