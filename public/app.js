//Define map to allow access to the rest of the project
let map, popup, Popup;
let new_marker_lat, 
    new_marker_lng, 
    viewmode = 'off',
    windows = [],
    place;

// Get Elements
const new_marker_form = document.getElementById('new-marker-form'),
      map_display = document.getElementById('map-display'),
      viewmode_btn = document.getElementById('viewmode'),
      directions = document.getElementById('directions'),
      container = document.getElementById('container'),
      welcome = document.querySelector('.welcome'),
      close_welcome = document.querySelector('.close-welcome'),
      fieldNameAlert = document.querySelector('.alert'),
      search = document.getElementById('search'),
      searchBtn = document.getElementById('searchBtn');

container.style.height = window.innerHeight;
viewmode_btn.textContent = `Viewmode: ${viewmode}`;
// directions.textContent = `Click here to ${viewmode} adding a field`;

// display welcome message if user has never visited
if (!JSON.parse(window.localStorage.getItem('visited'))) {
    welcome.style.display = 'block';
    window.localStorage.setItem('visited', JSON.stringify('true'));
}

// close welcome message
close_welcome.addEventListener('click', () => {
    welcome.removeAttribute('style');
})

//Google Maps link calls to initalize the map
function initMap() {
    let lat, lng;

    //Create map at the center of the U.S.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 4,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
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
            map.setZoom(10);
        })

         //Call function to load markers from database
        getData();
        
        var autocomplete = new google.maps.places.Autocomplete(search);
        autocomplete.bindTo('bounds', map);
        autocomplete.setFields(
            ['address_components', 'geometry', 'icon', 'name']);
        autocomplete.addListener('place_changed', function() {
            place = autocomplete.getPlace();
            if (!place.geometry) {
                alert('No details for this place');
            } else {
                searchBtn.addEventListener('click', () => {
                    map.setCenter(place.geometry.location);
                    map.setZoom(12);  // Why 17? Because it looks good.
                    search.value = '';
                })
            }
        })
    }

    // Add click event to map for user to add a point
    google.maps.event.addListener(map, 'click', (e) => {
        if (viewmode === 'off') {
            closeAllWindows();
            // Grab hidden form div from HTML
            const content = document.getElementById('content');
            // Display the form to add ontop of the map
            content.style.display = 'block';
            
            map.panTo({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            // Create custom popup
            Popup = createPopupClass();
            popup = new Popup(
                new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()),
                content);
            popup.setMap(map);
            // Set lat and lng variable to be sent to backend
            new_marker_lat = e.latLng.lat();
            new_marker_lng = e.latLng.lng();
        }
    })

    // toggle viewmode on button click (currently disabled for click on directions)
    viewmode_btn.addEventListener('click', () => {
        toggle_viewmode();
    });

    // click on the directions to disable/enable adding a map
    // directions.addEventListener('click', () => {
    //     toggle_viewmode();
    // });

    // toggle enabling adding a new map
    const toggle_viewmode = () => {
        if (viewmode === 'on') {
            viewmode = 'off';
            // directions.textContent = `Click here to ${viewmode} adding a field`
            viewmode_btn.textContent =  `Viewmode: ${viewmode}`
        } else {
            viewmode = 'on';
            // directions.textContent = `Click here to ${viewmode} adding a field`
            viewmode_btn.textContent =  `Viewmode: ${viewmode}`
        }
    }

    // Add recenter button on desktop and tablet
    document.getElementById('recenter').addEventListener('click', () => {
        map.setCenter( {
            lat: lat,
            lng: lng
        } );
        map.setZoom(12);
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
            scaledSize: new google.maps.Size(12,12)
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
        } else if (item.sport === 'tennis') {
            icon.url = 'icon_pics/tennis.png';
        } else if (item.sport === 'rugby') {
            icon.url = 'icon_pics/rugby.png';
        } else if (item.sport === 'hockey') {
            icon.url = 'icon_pics/hockey.png';
        } else if (item.sport === 'soccer/football') {
            icon.url = 'icon_pics/soccer_football.png';
        } 
        //Create the marker
        let marker = new google.maps.Marker({
            position:latlongs,
            map:map,
            icon: icon
        });

        let content;

        if (!item.description) {
            content = `<strong>Fieldname:</strong> ${item.fieldName}, <strong>Sport:</strong> ${firstLetterToUppercase(item.sport)}, <strong>Field type:</strong> ${firstLetterToUppercase(item.fieldType)}`;
        } else {
            content = `<strong>Fieldname:</strong> ${item.fieldName}, <strong>Sport:</strong> ${firstLetterToUppercase(item.sport)}, <strong>Field type:</strong> ${firstLetterToUppercase(item.fieldType)} <br>
            <strong>Description:</strong> ${item.description}`;
        }

        const infowindow = new google.maps.InfoWindow({ content })

        windows.push(infowindow);
        // let activeInfoWindow = null;
        //Add info window on click
        marker.addListener('click', () => {
            closeAllWindows();
            if (popup) { handleClose(); }
            infowindow.open(map, marker);
        })
    
    })
}

function firstLetterToUppercase(word) {
    if (!word) { return; }
    return word[0].toUpperCase() + word.slice(1);
}

function closeAllWindows() {
    windows.forEach(window => {
        window.close();
    })
}

// custom form popup

// get form submit button
document.getElementById('enter').addEventListener('click', () => {
    // call handle submit
    handleSubmit();
})

// get cancel form button
document.getElementById('close').addEventListener('click', () => {
    // call handle the cancel action
    handleClose();
});

// Handle submit button
const handleSubmit = function() {
    const fieldName = document.getElementById('fieldName').value;
    // create object to be sent to backend
    const newMarkerData = {
        fieldName,
        sport: document.getElementById('sport').value,
        description: document.getElementById('description').value,
        fieldType: document.getElementById('type').value,
        lat: new_marker_lat,
        lon: new_marker_lng
    }

    // Check the user has added a name for the field
    if (fieldName !== '') {
        try {
            // If yes, send data to backend
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/field_api');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(newMarkerData));
            xhr.onloadend = function() {
                getData();
                var jsonResponse = JSON.parse(xhr.responseText);
                if (jsonResponse.success === false) {
                    fieldNameAlert.textContent = jsonResponse.data;
                    // console.log(jsonResponse.data)
                    fieldNameAlert.style.display = 'block';
                } else {
                    // Close custom popup
                    handleClose();
                }
            }
            xhr.onerror = function() {
                console.log('Network Error');
            }
        } catch (error) {
            console.log('error');
        }
    } else {
        // If no, display alert
        fieldNameAlert.style.display = 'block';
    }; 
    
}

// Handle close function
const handleClose = function() {
    // remove the popup from the map by setting it to null
    popup.setMap(null);
    // recreate the new marker form
    let newDiv = document.createElement('div');
    newDiv.id = 'content';
    newDiv.innerHTML = '<label>Field Name</label><br><input type="text" name="fieldName" id="fieldName" placeholder="Add a fieldname..."><br><p class="alert">Fieldname is required!</p><label class="labels" for="sport">Sport</label><select id="sport" name="sport"><option value="soccer">⚽️</option><option value="football">🏈</option><option value="baseball">⚾️</option><option value="basketball">🏀</option><option value="tennis">🎾</option><option value="rugby">🏉</option><option value="hockey">🏒</option><option value="soccer/football">⚽️ & 🏈</option></select><br><label class="labels" for="type">Field Type</label><select id="type" name="type"><option value="public">Public (free)</option><option value="private">Private (paid)</option></select><br><label>Description</label><br><input type="text" id="description" name="description" placeholder="Add a description..."><br><button id="enter" class="btn btn-popup">Enter</button><button id="close" class="btn btn-popup">Close</button>';
    map_display.appendChild(newDiv);
    // Add events to new form
    document.getElementById('close').addEventListener('click', () => {
        handleClose()
    })
    document.getElementById('enter').addEventListener('click', () => {
        handleSubmit();
    })
}

// searchBtn.addEventListener('click', () => {
//     var request = {
//         query: search.value,
//         fields: ['name', 'geometry'],
//       };

//       service = new google.maps.places.PlacesService(map);

//       service.findPlaceFromQuery(request, function(results, status) {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//             map.setCenter(results[0].geometry.location);
//             map.setZoom(12)
//         }
//       });
// })

function createPopupClass() {
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} content The bubble div.
     * @constructor
     * @extends {google.maps.OverlayView}
     */
    function Popup(position, content) {
      this.position = position;
  
      content.classList.add('popup-bubble');
  
      // This zero-height div is positioned at the bottom of the bubble.
      var bubbleAnchor = document.createElement('div');
      bubbleAnchor.classList.add('popup-bubble-anchor');
      bubbleAnchor.appendChild(content);
  
      // This zero-height div is positioned at the bottom of the tip.
      this.containerDiv = document.createElement('div');
      this.containerDiv.classList.add('popup-container');
      this.containerDiv.appendChild(bubbleAnchor);
  
      // Optionally stop clicks, etc., from bubbling up to the map.
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.containerDiv);
    }
    // ES5 magic to extend google.maps.OverlayView.
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);
  
    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function() {
      this.getPanes().floatPane.appendChild(this.containerDiv);
    };
  
    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function() {
      if (this.containerDiv.parentElement) {
        this.containerDiv.parentElement.removeChild(this.containerDiv);
      }
    };
  
    /** Called each frame when the popup needs to draw itself. */
    Popup.prototype.draw = function() {
      var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
  
      // Hide the popup when it is far out of view.
      var display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
          'block' :
          'none';
  
      if (display === 'block') {
        this.containerDiv.style.left = divPosition.x + 'px';
        this.containerDiv.style.top = divPosition.y + 'px';
      }
      if (this.containerDiv.style.display !== display) {
        this.containerDiv.style.display = display;
      }
    };
  
    return Popup;
  }