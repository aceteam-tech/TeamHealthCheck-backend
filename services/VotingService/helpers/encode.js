class Encode {
    constructor(url){
        this.url = url
    }
    get encoded(){
        return this.url.split('/').map(encodeURIComponent).join('/')
    }

    toString(){
        return this.url
    }
}

module.exports = Encode