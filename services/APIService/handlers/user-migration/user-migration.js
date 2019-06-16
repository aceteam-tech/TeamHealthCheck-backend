import AWS from 'aws-sdk'
import Profiles from '../../db/ProfilesTable'

const cognito = new AWS.CognitoIdentityServiceProvider()
const userNotFoundText = 'Wrong user or password'

const getUserFromLegacyUserPool = async (userName) => {
    const params = {
        UserPoolId: 'eu-west-2_wZIIzNgND',
        Username: userName
    }
    return cognito.adminGetUser(params).promise()
}

export const lambda = async (event, context) => {
    console.log({ 'event': JSON.stringify(event, null, 2) })
    const email = event.userName
    const newUserPoolId = event.userPoolId

    if (event.triggerSource = 'UserMigration_Authentication') {
        const password = event.request.password
        // TODO: Authenticate user before getting his data

        const cognitoUser =
            await getUserFromLegacyUserPool(email)

        console.log({ 'userFromLegacyUserPool': cognitoUser })

        if (cognitoUser) {

            const cognitoUserId = cognitoUser.Username
            await Profiles.updateEmail(cognitoUserId, email)

            const userAttributesObject = cognitoUser.UserAttributes
                .filter(att => att.Name !== 'sub')
                .reduce((prev, curr) => ({
                    ...prev,
                    [curr.Name]: curr.Value
                }), {})

            const response = getSuccessResponse(event, userAttributesObject)
            console.log({ 'response': JSON.stringify(response, null, 2) })

            context.succeed(response)
        }

        return new Error(userNotFoundText)
    }

    // Start crazy changes ;)
    // :) :)

    // if (event.triggerSource = 'UserMigration_ForgotPassword') {
    //     // const user = await lookupUser(event.userName)
    //     const user = 'qwe'
    //     if (user) {
    //         event.response = {
    //             ...event.response,
    //             userAttributes: {
    //                 'email': user.emailAddress,
    //                 'email_verified': 'true'
    //             },
    //             messageAction: 'SUPPRESS'
    //         }
    //         return context.succeed(event)
    //     }
    //     else {
    //         return 'Bad password'
    //     }
    // }

    return new Error('Bad triggerSource ' + event.triggerSource)
}

const getSuccessResponse = (event, userAttributes) => {
    event.response = {
        userAttributes,
        finalUserStatus: 'CONFIRMED',
        messageAction: 'SUPPRESS'
    }
    return event
}