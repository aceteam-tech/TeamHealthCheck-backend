const initialCategories = require('../../consts/initial-categories.json')
const joinTeam = require('../../helpers/join-team.helper');
const createTeamDB = require('../../database/teams/create-team.dynamodb')
const queryCodeDB = require('../../database/teams/query-team-by-code.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamName} = JSON.parse(event.body)

    const code = await getAvailableCode()
    let team = await createTeamDB(code, teamName, initialCategories)
    team = await joinTeam(team.id, profileId)

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
}

async function getAvailableCode () {
    const code = (Math.floor(Math.random() * 1000000)).toString()
    const teamsWithCode = await queryCodeDB(code)
    if (teamsWithCode.length === 0) {
        return code
    }
    return getAvailableCode()
}