const queryTeam = require('../database/teams/query-team.dynamodb')

module.exports = async (teamId, profileId) => {
    const team = await queryTeam(teamId)
    
    return new Promise((resolve, reject) => {
        if (team.users.includes(profileId)) {
            resolve(team)
        } else {
            reject({
                statusCode: 401,
                body: JSON.stringify({
                    code: "NotAuthorizedForTheTeamAction",
                    message: "You are unauthorized to create health check for this team"
                })
            })
        }
    })
}