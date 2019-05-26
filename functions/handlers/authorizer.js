const authorize = require('../helpers/authorizer')

module.exports.handler = async (event, ctx, cb) => {
    console.log({'event': event});
    try {
        const decoded = await authorize(event.queryStringParameters.Authorization)
        console.log({ 'decoded': decoded })

        cb(null, generateAllow('me', event.methodArn, decoded))
    } catch (e) {
        cb(e)
    }
}

function generateAllow(principalId, resource, identity) {
    // Required output:
    let authResponse = {};
    authResponse.principalId = principalId;

    if (resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = 'Allow';
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = identity;
    return authResponse;
}