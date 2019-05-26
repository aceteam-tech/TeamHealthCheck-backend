module.exports.handler = async (event) => {
    console.log({'event': event});
    console.log({'event.requestContext.authorizer': event.requestContext.authorizer});

    return {
        statusCode: 200,
        body: JSON.stringify(event.requestContext.authorizer)
    }
}
