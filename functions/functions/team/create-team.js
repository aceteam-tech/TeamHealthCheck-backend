const initialCategories = require('../../consts/initial-categories.json')
const joinTeam = require('../../helpers/join-team.helper');
const createTeamDB = require('../../database/teams/create-team.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamName} = JSON.parse(event.body)

    let team = await createTeamDB(teamName, initialCategories)
    team = await joinTeam(team.id, profileId)

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
}