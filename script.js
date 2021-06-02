function getVacineCentresByDistrictIdAndDate(district_id = '307', date = currentDate()){
    return fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district_id}&date=${date}`)
    .then((res) => {
        return res.json()
    })
}

function currentDate(){
    const currentDate = new Date();

    return `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
}

getVacineCentresByDistrictIdAndDate(1800)
.then(vaccineCentres => {
    // I have docble checked, its 'centres' and not 'centers' ;)
    const centresByPincode = vaccineCentres.centers.filter(centre => centre.pincode === '686665');
    console.log("centresByPincode", centresByPincode);
})