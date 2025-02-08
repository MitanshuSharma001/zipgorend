const {google} = require('googleapis')
require('dotenv/config')

const oauth2 = new google.auth.OAuth2(
    process.env.APNACLIENT_ID,
    process.env.APNACLIENT_SECRET,
    process.env.APNAREDIRECT_URI
)
try {
    oauth2.setCredentials({refresh_token: process.env.APNAREFRESH_TOKEN})
    console.log('Drive Connected');
    
} catch (error) {console.log(error)}

const drive = google.drive({
    version:'v3',
    auth: oauth2
})
module.exports = drive