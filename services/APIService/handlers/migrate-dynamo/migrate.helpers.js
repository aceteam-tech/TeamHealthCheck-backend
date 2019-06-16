export const transformTableProperties = (records, transformations) => {
    return records.map(record => {
        transformations.forEach(f => {
            record = f(record)
        })
        return record
    })
}