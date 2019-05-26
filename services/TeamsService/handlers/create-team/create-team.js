const initialCategories = require('./initial-categories.json')
const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    console.log({'profileId': profileId});
    const {teamName} = JSON.parse(event.body)
    console.log({'teamName': teamName});

    const code = await getAvailableCode()
    let team = await TeamsTable.createTeamAsync(code, teamName, initialCategories)

    team = await TeamsTable.addProfileAsync(team.id, profileId)
    await ProfilesTable.addTeamAsync(team.id, profileId)

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
}

async function getAvailableCode () {
    const code = (Math.floor(Math.random() * 1000000)).toString()
    const teamsWithCode = await TeamsTable.queryTeamByCodeAsync(code)
    if (teamsWithCode.length === 0) {
        return code
    }
    return getAvailableCode()
}