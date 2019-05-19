module.exports.handler = async (event) => {
    console.log({'event': event});

    return {
        statusCode: 200
    };
}
