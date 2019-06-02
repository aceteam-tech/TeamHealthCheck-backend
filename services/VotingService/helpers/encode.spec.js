const Encode = require('./encode')

describe('Encode', () => {

    describe('Created variable ', () => {
        const data = [
            {
                input: '/ws/@connections/aq2fAdABrPEAc2Q=',
                encoded: '/ws/%40connections/aq2fAdABrPEAc2Q%3D'
            },
            {
                input: '/ws/@=',
                encoded: '/ws/%40%3D'
            }
        ]

        it(`should return strings without encoding`, () => {
            data.map(({input}) => {
                const url = new Encode(input)
                expect('' + url).toBe(input)
            })
        });

        describe('Encoded property', () => {

            it(`should be defined`, ()=> {
                const url = new Encode('')
                expect(url.encoded).toBeDefined()
            });

            it(`should return string with encoded @ and = characters`, () => {
                data.map(({input, encoded}) => {
                    const url = new Encode(input)
                    expect(url.encoded).toBe(encoded)
                })
            });
        });

    });

});