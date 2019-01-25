const putProfileDB = require('../database/profiles/put-profile.dynamodb')

module.exports.lambda = async (event) => {
    const {userName} = event
    const {name} = event.request.userAttributes

    await putProfileDB(userName, name)
    return event;
};
