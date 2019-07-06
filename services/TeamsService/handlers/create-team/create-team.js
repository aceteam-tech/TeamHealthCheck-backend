const initialCategories = require('./initial-categories.json')
const ProfilesTable = require('../../db/ProfilesTable')
const TeamsTable = require('../../db/TeamsTable')
const getFixedLengthNumber = require('./get-fixed-width-number')

module.exports.lambda = async (event) => {
    const email = event.requestContext.authorizer.claims.email
    const { teamName } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

    const code = await getAvailableCode()
    let team = await TeamsTable.createTeamAsync(code, teamName, initialCategories)

    const profile = await ProfilesTable.getProfileByEmailAsync(email)
    team = await TeamsTable.addProfileAsync(team.id, profile.id)
    await ProfilesTable.addTeamAsync(team.id, profile.id)

    team.users = [profile]

    return {
        statusCode: 200,
        body: JSON.stringify(team)
    }
}

async function getAvailableCode () {
    const randomNumber = (Math.floor(Math.random() * 1000000))
    const code = getFixedLengthNumber(randomNumber, 6)
    const teamsWithCode = await TeamsTable.queryTeamByCodeAsync(code)
    if (teamsWithCode.length === 0) {
        return code
    }
    return getAvailableCode()
}