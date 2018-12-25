const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

module.exports.lambda = async (event, context) => {
    const profileId = event.requestContext.authorizer.claims.sub
    const {teamName} = JSON.parse(event.body)

    const team = await putTeam(teamName, profileId)
    const profile = await assignTeamToProfile(team.id, profileId)
    return {
        statusCode: 200,
        body: JSON.stringify(profile)
    }
};

async function putTeam(name, profileId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Teams`,
        Item: {
            id: uuid(),
            name,
            users: [profileId],
            categories: getCategories()
        }
    }
    await db.put(params).promise()
    return params.Item
}

async function assignTeamToProfile(teamId, profileId){
    const params = {
        TableName : `HC-${process.env.STAGE}-Profiles`,
        Key: {id: profileId},
        UpdateExpression: `SET teams = list_append(teams, :teamId)`,
        ExpressionAttributeValues: {
            ':teamId': [teamId]
        },
        ReturnValues: 'ALL_NEW'
    }
    return (await db.update(params).promise())
}

function getCategories(){
    return [
        {
            "descriptionGreen": "We're learning lots of interesting stuff all the time!",
            "descriptionRed": "We never have time to learn anything.",
            "groupId": "1",
            "id": "2",
            "image": "https://s3.amazonaws.com/squad-health-check/icons/learning-2x.png",
            "name": "Learning"
        },
        {
            "descriptionGreen": "We are in control of our own destiny! We decide what to build and how to build it.",
            "descriptionRed": "We are just pawns in a game of chess with no influence over what we build or how we build it.",
            "groupId": "1",
            "id": "8",
            "name": "Pawns or Players"
        },
        {
            "descriptionGreen": "We get stuff done really quickly! No waiting and no delays.",
            "descriptionRed": "We never seem to get anything done. We keep getting stuck or interrupted. Stories keep getting stuck on dependencies.",
            "groupId": "1",
            "id": "9",
            "name": "Speed"
        },
        {
            "descriptionGreen": "We are a totally gelled super-team with awesome collaboration!",
            "descriptionRed": "We are a bunch of individuals that neither know nor care about what the other people in the squad are doing. ",
            "groupId": "1",
            "id": "1",
            "name": "Teamwork"
        },
        {
            "descriptionGreen": "We're proud of the quality of our code! It is clean, easy to read and has great test coverage.",
            "descriptionRed": "Our code is a pile of dung and technical debt is raging out of control.",
            "groupId": "1",
            "id": "6",
            "image": "https://s3.amazonaws.com/squad-health-check/icons/health-2x.png",
            "name": "Health of Codebase"
        },
        {
            "descriptionGreen": "We love going to work and have great fun working together!",
            "descriptionRed": "Boooooooring...",
            "groupId": "1",
            "id": "5",
            "image": "https://s3.amazonaws.com/squad-health-check/icons/fun-2x.png",
            "name": "Fun"
        },
        {
            "descriptionGreen": "Releasing is simple, safe, painless and mostly automated.",
            "descriptionRed": "Releasing is risky, painful, lots of manual work and takes forever.",
            "groupId": "1",
            "id": "4",
            "name": "Releasing process"
        },
        {
            "descriptionGreen": "We know exactly why we are here and we’re really excited about it!",
            "descriptionRed": "We have no idea why we are here, there's no high level picture or focus. Our so called mission is completely unclear and uninspiring.",
            "groupId": "1",
            "id": "7",
            "name": "Mission"
        },
        {
            "descriptionGreen": "We always get great support and help when we ask for it!",
            "descriptionRed": "We keep getting stuck because we can't get the support and help that we ask for.",
            "groupId": "1",
            "id": "11",
            "name": "Support"
        },
        {
            "descriptionGreen": "We deliver great stuff!\nWe're proud of it and\nour stakeholders are\nreally happy. ",
            "descriptionRed": "We deliver crap. We feel\nashamed to deliver it.\nOur stakeholders hate\nus. ",
            "groupId": "1",
            "id": "3",
            "image": "https://s3.amazonaws.com/squad-health-check/icons/delivery-value-3x.png",
            "name": "Delivering Value"
        },
        {
            "descriptionGreen": "Our way of working fits us perfectly!",
            "descriptionRed": "Our way of working sucks!",
            "groupId": "1",
            "id": "10",
            "name": "Process"
        }
    ]
}