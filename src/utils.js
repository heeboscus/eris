module.exports = {
    duration(date1, date2) {
        let distance = Math.abs(date1 - date2)
        const days = Math.floor(distance / 8.64e+7)
        distance -= days * 8.64e+7
        const hours = Math.floor(distance / 3600000)
        distance -= hours * 3600000
        const minutes = Math.floor(distance / 60000)
        distance -= minutes * 60000
        const seconds = Math.floor(distance / 1000)
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }
}
