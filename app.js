require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const path = require('path')
require('./config/connection')
const formData = require('express-form-data')
const os = require('os')
const session = require('express-session')
const passport = require('passport')
const moment = require('moment')

mongoose.set('debug', true)

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
}
// parse data with connect-multiparty.
app.use(formData.parse(options))
// delete from the request all empty files (size == 0)
app.use(formData.format())
// change the file objects to fs.ReadStream
// app.use(formData.stream());
// union the body and the files
app.use(formData.union())

//Add express middleware
app.use(express.json({ limit: '150mb' }))
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'cats' }))
app.use(passport.initialize())
app.use(passport.session())

//Add Routes
const userRoute = require('./routes/user')
const eventRoute = require('./routes/event')
const userStaffRoute = require('./routes/userStaff')
const ticketRoute = require('./routes/ticket')
const addonRoute = require('./routes/addon')
const emailTemplateRoute = require('./routes/emailTemplate')
const marketingGroupRoute = require('./routes/marketingGroup')
const couponRoute = require('./routes/coupon')
const subscriberRoute = require('./routes/subscriber')
const emailCampaignRoute = require('./routes/emailCampaign')
const TicketSellRoute = require('./routes/ticketSell')
const StripeRoute = require('./routes/stripe')
const TextMessageGroupRoute = require('./routes/textMessageGroup')
const OrderFormRoute = require('./routes/orderForm')
const OrganizationRoute = require('./routes/organization')
const RolesAndPermissionsRoute = require('./routes/rolesAndPermissions')
const OrderRoute = require('./routes/order')
const OrganizerRoute = require('./routes/organizer')
const InvoiceRoute = require('./routes/invoice')
const globalSearchRoute = require('./routes/globalSearch')
const { Console } = require('console')

//Define Routes
app.use('/api/user', userRoute)
app.use('/api/event/ticket', ticketRoute)
app.use('/api/event/coupon', couponRoute)
app.use('/api/event/addon', addonRoute)
app.use('/api/event/invoice', InvoiceRoute)
app.use('/api/event/ticketSell', TicketSellRoute)
app.use('/api/event', eventRoute)
app.use('/api/userStaff', userStaffRoute)
app.use('/api/emailTemplate', emailTemplateRoute)
app.use('/api/marketingGroup', marketingGroupRoute)
app.use('/api/subscriber', subscriberRoute)
app.use('/api/emailCampaign', emailCampaignRoute)
app.use('/api/stripe', StripeRoute)
app.use('/api/textMessageGroup', TextMessageGroupRoute)
app.use('/api/orderForm', OrderFormRoute)
app.use('/api/organization', OrganizationRoute)
app.use('/api/rolesAndPermission', RolesAndPermissionsRoute)
app.use('/api/order', OrderRoute)
app.use('/api/organizer', OrganizerRoute)
app.use('/api/globalSearch', globalSearchRoute)

// Define Port
const port = 8000
app.listen(port, () => {
  console.log(`app is running at port ${port}`)
})
