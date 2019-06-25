const getFixedLengthNumber = require('./get-fixed-width-number')

describe('getFixedLengthNumber function', () => {
    describe('For width = 6 and number 123', () => {
        it(`Should return 000123`, () => {
            const number = 123
            const length = 6
            expect(getFixedLengthNumber(number, length)).toEqual('000123')
        })
    })
    describe('For width = 6 and number 123123', () => {
        it(`Should return 123123`, () => {
            const number = 123123
            const length = 6
            expect(getFixedLengthNumber(number, length)).toEqual('123123')
        })
    })
})