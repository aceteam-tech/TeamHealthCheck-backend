module.exports = function getFixedLengthNumber(number, length){
    const initZeros = new Array(length).fill('0').join('')
    return (initZeros + number).slice(-length)
}