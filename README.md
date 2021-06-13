# Vaccines Availability Check
Unofficial utility for checking vaccines availability.


## APIs Used : 

BASE_URL : `https://cdn-api.co-vin.in/api/v2`

For state and district list:
- `<BASE_URL>/admin/location/states`
- `<BASE_URL>/admin/location/districts/<stateId>`

For getting vaccication sessions by district and date :
- `<BASE_URL>/appointment/sessions/public/calendarByDistrict?district_id=<districtId>&date=<dd-mm-yyyy>`
- `<BASE_URL>/appointment/sessions/public/calendarByPin?pincode=<pinNumber>&date=<dd-mm-yyyy>`