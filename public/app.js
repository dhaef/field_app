//Define map to allow access to the rest of the project
let map;
let new_marker_lat, new_marker_lng;

// Get Elements
const new_marker_form = document.getElementById('new-marker-form'),
      map_display = document.getElementById('map-display'),
      fieldName = document.getElementById('fieldName'),
      sport = document.getElementById('sport'),
      description = document.getElementById('description');

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

         //Call function to load markers from database
        getData();
    }

    //Listener to click and add Lat/Long to form and create new marker
    google.maps.event.addListener(map, 'click', (e) => {

        //Show form when user clicks the map
        new_marker_form.style.display = 'block';
        map_display.style.display = 'none';

        //Set input for the Lat and Long where user clicks
        new_marker_lat = e.latLng.lat();
        new_marker_lng = e.latLng.lng();
    })

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
            icon.url = 'icon_pics/soccer2.png';
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

        let content;

        if (!item.description) {
            content = `<strong>Fieldname:</strong> ${item.fieldName}, <strong>Sport:</strong> ${item.sport}`;
        } else {
            content = `<strong>Fieldname:</strong> ${item.fieldName}, <strong>Sport:</strong> ${item.sport} <br>
            <strong>Description:</strong> ${item.description}`;
        }

        const infowindow = new google.maps.InfoWindow({ content })

        //Add info window on click
        marker.addListener('click', () => {
            infowindow.open(map, marker);
        })
    
    })
}

//Listener to submit new field/marker
document.getElementById('submit').addEventListener('click', async e => {

    //Set values to an objest
    const data = { 
        fieldName: fieldName.value, 
        sport: sport.value, 
        description: description.value,
        lat: new_marker_lat, 
        lon: new_marker_lng 
    };
    
    //Set options to submit to api
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };

    //Check inputs value to see if they are filled in
    if (fieldName !== '') {
        try {
            // await fetch('/field_api/', options);
            const ajax = new XMLHttpRequest();
            ajax.open('POST', '/field_api');
            ajax.setRequestHeader('Content-Type', 'application/json');
            ajax.send(JSON.stringify(data));
        } catch (error) {
            console.log('error');
        }
    }; 

    //Hide form
    new_marker_form.style.display = 'none';
    map_display.style.display = 'block';
    
    // Function fetches via GET and loads all markers
    getData();

    //Clear values from inputs
    fieldName.value = '';
    sport.value = '';
    
    e.preventDefault();
});

//Listener to cancel new field
document.getElementById('cancel').addEventListener('click', () => {
    fieldName.value = '';
    sport.value = '';
    new_marker_form.style.display = 'none';
    map_display.style.display = 'block';
});