const sumBy = require('lodash.sumby')
const AWS = require('aws-sdk')
const VotingsTable = require('../../db/VotingsTable')
const VotesTable = require('../../db/VotesTable')

const sns = new AWS.SNS({apiVersion: '2010-03-31'})
const TopicArn = process.env.NOTIFY_TEAM_TOPIC

function flattenVotes(votes) {
    return [].concat(...votes.map(s => s.categories))
}

function pickVotesForCategory(votes, categoryId) {
    return votes.filter(s => s.id === categoryId)
}

function calculateValue(totalPoints, votesCount) {
    const MAX_POINTS = 2

    return totalPoints * 100 / votesCount / MAX_POINTS
}

function categoryWithValue(category, votes) {
    const categoryVotes = pickVotesForCategory(votes, category.id)
    if (!categoryVotes.length) return

    const totalPoints = sumBy(categoryVotes, 'value')

    const value = calculateValue(totalPoints, categoryVotes.length)
    const categoryWithValue = { ...category, value }

    return categoryWithValue
}

function calculateCategories(votes, categories) {
    return categories.map(c => categoryWithValue(c, votes)).filter(c => c)
}

const lambda = async (event) => {
    const { teamId } = event.pathParameters

    const voting = (await VotingsTable.queryByStatusAsync(teamId, false))[0]
    const votes = await VotesTable.queryVotesAsync(voting.id)

    let socketResponseParams = {
        Message: {
            teamId,
            body: {
                action: 'votingFinished',
                teamId
            }
        },
        TopicArn
    }

    if (votes.length === 0) {
        const updated = await VotingsTable.endVotingAsync(voting, voting.categories)

        socketResponseParams.Message.body.voting = updated
        socketResponseParams.Message.body.voting.categories = undefined
        socketResponseParams.Message = JSON.stringify(socketResponseParams.Message)
        await sns.publish(socketResponseParams).promise()

        return {
            statusCode: 200,
            body: JSON.stringify(updated)
        }
    }

    const flattenedVotes = flattenVotes(votes)
    const calculatedCategories = calculateCategories(flattenedVotes, voting.categories)
    const updated = await VotingsTable.endVotingAsync(voting, calculatedCategories)
    console.log({'updated': updated});

    socketResponseParams.Message.body.voting = updated
    socketResponseParams.Message = JSON.stringify(socketResponseParams.Message)
    await sns.publish(socketResponseParams).promise()

    return {
        statusCode: 200,
        body: JSON.stringify(updated)
    }
}
module.exports = {
    lambda,
    flattenVotes,
    calculateCategories
}