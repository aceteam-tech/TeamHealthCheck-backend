const addProfileToTeamDB = require('../database/teams/add-profile-to-team.dynamodb')
const addTeamToProfileDB = require('../database/profiles/add-team-to-profile.dynamodb')

module.exports = async (teamId, profileId) => {
    const team = await addProfileToTeamDB(teamId, profileId)
    await addTeamToProfileDB(teamId, profileId)
    return team
}