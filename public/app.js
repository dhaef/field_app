//Define map to allow access to the rest of the project
let map;
let new_marker_lat, new_marker_lng;
//Google Maps link calls to initalize the map
function initMap() {
    let lat, lng;

    //Create map at the center of the U.S.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 4
    });
    //Check if the browser has geolocation
    if (navigator.geolocation) {
        //Get location from the user
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            //Store user Lat and Long in variable to center map around
            const centerPosition = {
                lat: lat,
                lng: lng
            }
            //Set map to user location
            map.setCenter(centerPosition);
            //Zoom in on user location
            map.setZoom(6);
        })
    }

    //Listener to click and add Lat/Long to form and create new marker
    google.maps.event.addListener(map, 'click', (e) => {
        //Show form when user clicks the map
        document.querySelector('form').style.display = 'block';
        document.getElementById('map-display').style.display = 'none';
        //Set input for the Lat and Long where user clicks
        new_marker_lat = e.latLng.lat();
        new_marker_lng = e.latLng.lng();
        // const marker = new google.maps.Marker({
        //     position: { lat:parseFloat(lat), lng:parseFloat(lng) },
        //     map: map
        // })
        //console.log(e);
    })
    //Call function to load markers from database
    getData();

    document.getElementById('recenter').addEventListener('click', () => {
        map.setCenter( {
            lat: lat,
            lng: lng
        } );
        map.setZoom(6);
    })
}
//Load data from database
async function getData() {
    //Fetch promise from api
    const field_get_response = await fetch('/field_api');
    //Convert promise to json
    const field_get_data = await field_get_response.json();
    console.log(field_get_data);
    //Loop through each marker in the database
    field_get_data.data.forEach(item => {
        //Store lat and long in object
        const latlongs = { lat:parseFloat(item.lat), lng:parseFloat(item.lon) };
        //Defualt icon
        const icon = {
            url: 'icon_pics/dot.png',
            scaledSize: new google.maps.Size(15,15)
        }
        //Add special icons for each sport
        if (item.sport === 'soccer') {
            icon.url = 'icon_pics/soccer.png';
        } else if (item.sport === 'baseball') {
            icon.url = 'icon_pics/baseball.png';
        } else if (item.sport === 'basketball') {
            icon.url = 'icon_pics/basketball.png';
        } else if (item.sport === 'football') {
            icon.url = 'icon_pics/football.png';
        }
        //Create the marker
        let marker = new google.maps.Marker({
            position:latlongs,
            map:map,
            icon: icon
        });
        //Add info window data
        const infowindow = new google.maps.InfoWindow({
            content: `<strong>Fieldname:</strong> ${item.fieldName}, <strong>Sport:</strong> ${item.sport}`
        })
        //Add info window on click
        marker.addListener('click', () => {
            infowindow.open(map, marker);
        })
    })
}
//Listener to submit new field/marker
document.getElementById('submit').addEventListener('click', async event => {
    //Get values from form
    let fieldName = document.getElementById('fieldName').value,
        sport = document.getElementById('sport').value;
    //Set values to an objest
    const data = { fieldName, sport, lat: new_marker_lat, lon: new_marker_lng };
    //Set options to submit to api
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      };
    //Check inputs value to see if they are filled in
    if (fieldName === '' || sport === '' || new_marker_lat === '' || new_marker_lng === '') {
        alert('You must fill in all the fields');
        return;
    } else {
        const field_response = await fetch('/field_api', options);
        const field_json = await field_response.json();
    }

    getData();
    //Remove values from inputs
    document.getElementById('fieldName').value = '';
    document.getElementById('sport').value = '';
    //Hide form
    document.querySelector('form').style.display = 'none';

    event.preventDefault();
});
//Listener to cancel new field
document.getElementById('cancel').addEventListener('click', () => {
    document.getElementById('fieldName').value = '';
    document.getElementById('sport').value = '';
    document.querySelector('form').style.display = 'none';
})