function date() {
        let date = new Date()
        let istDate = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        let hours = String(new Date(istDate).getHours()).padStart(2,'0')
        let minutes = String(new Date(istDate).getMinutes()).padStart(2,'0')
        let seconds = String(new Date(istDate).getSeconds()).padStart(2,'0')
        return `${hours}${minutes}${seconds}`
}
module.exports = date
