const idGenerator = (len) => {
    let id = 0;
    for (let i=0; i<len; i++) {
        id = id*10 + (Math.floor(Math.random() * 10))
    }
    return id;
}

module.exports = idGenerator;