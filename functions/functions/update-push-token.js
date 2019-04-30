const updatePushToken = require('../database/profiles/update-push-token.dynamodb')

module.exports.lambda = async (event) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {token} = JSON.parse(event.body)

    const profile = await updatePushToken(profileId, token)

    return {
        statusCode: 200,
        body: JSON.stringify(profile)
    }
}