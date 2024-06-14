const { statuscode } = require('../config/codeAndMessage')
const EventService = require('../services/EventService')
const UserStaffService = require('../services/UserStaffService')
const OrderService = require('../services/OrderService')
const EmailCampaignService = require('../services/EmailCampaignService')
const OrganizerService = require('../services/OrganizerService')

exports.globalSearch = async (req, res) => {
  try {
    let search = req.query.search

    const events = await EventService.getAllEvent(
      req.user.id,
      search,
      'All',
      false
    )

    const staffMember = await UserStaffService.getStaffMember(
      '',
      req.user.id,
      '',
      search
    )

    const orders = await OrderService.getOrderListing(
      '',
      '',
      req.user.id,
      search
    )

    const emailCampaign = await EmailCampaignService.getEmailCampaign(
      req.user.id,
      search
    )

    const organizer = await OrganizerService.getOrganizer(req.user.id, search)

    console.log(organizer, '<<<<<<<<<<<<<<organizer>>>>>>>>>>>>>>')
    console.log(emailCampaign, '<<<<<<<<<<<<<emailCampaign>>>>>>>>>>>>>>')
    console.log(orders, '<<<<<<<<<<<<<<<orders>>>>>>>>>>>>>')
    console.log(staffMember, '<<<<<<<<<<<staffMember>>>>>>>>>>>>>')
    console.log(events, '<<<<<<<<<<<events>>>>>>>>>>>>>>')

    const data = { organizer, emailCampaign, orders, staffMember, events }

    return res.status(200).json({
      success: true,
      statusCode: statuscode.success,
      data: data,
      message: 'Data retrived successfully',
    })
  } catch (error) {
    console.log('error', error)
    return res.status(400).json({
      success: false,
      statusCode: statuscode.bad_request,
      message: error,
      data: [],
    })
  }
}
