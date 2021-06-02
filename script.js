const API_BASE_URL = "https://cdn-api.co-vin.in/api/v2";
const centresContainer = document.getElementById('centres-rows');
const pinNumberInput = document.getElementById('pinNumber');
const storage = window.localStorage;

function getVacineCentresByDistrictIdAndDate(pinNumber, date){ 
    return fetch(`${API_BASE_URL}/appointment/sessions/public/calendarByPin?pincode=${pinNumber}&date=${date}`)
    .then((res) => {
        return res.json();
    })
}

function currentDate(){
    const dateNow = new Date();

    return `${String(dateNow.getDate()).padStart(2, "0")}-${String(dateNow.getMonth() + 1).padStart(2, "0")}-${dateNow.getFullYear()}`;
}

function updateCentreList(pincode = '686665', date = currentDate()){
    getVacineCentresByDistrictIdAndDate(pincode, date)
    .then(vaccineCentres => {
        // I have double checked, its 'centres' and not 'centers' ;)
        centresContainer.innerHTML = displayVaccineCentres(vaccineCentres.centers);
    })
}

function displayVaccineCentres(centres = []){
    let centreList = [];

    for(let centre of centres){
        centreList.push(`
        <tr>
        <td>${centre.name}</td>
        <td>${centre.district_name}</td>
        <td>1,91</td>
        <td>${centre.fee_type}</td>
      </tr>
        `);
    }

    return centreList.join('');
}

function updateListIfNeeded(pinNumber){
    if(isValidPin(this.value)){
        storage.setItem("pinNumber", this.value);
        updateCentreList(this.value);
    }
}

function isValidPin(pin){
    const pattern = new RegExp(/^[0-9]{6}$/g);
    
    return pattern.test(pin) 
}

pinNumberInput.addEventListener('input', updateListIfNeeded)

if(isValidPin(storage.getItem("pinNumber"))){
    updateCentreList(storage.getItem("pinNumber"))
}
