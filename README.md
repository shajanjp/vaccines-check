# Vaccines Availability Check


APIs Used : 
For state and district list: 
`https://cdn-api.co-vin.in/api/v2/admin/location/states`
`https://cdn-api.co-vin.in/api/v2/admin/location/districts/<stateId>`

For getting vaccication sessions by district and date :
`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=<districtId>&date=<dd-mm-yyyy>`
`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=<pinNumber>&date=<dd-mm-yyyy>`