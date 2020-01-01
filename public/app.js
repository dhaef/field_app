//Define map to allow access to the rest of the project
let map, popup, Popup;
let new_marker_lat, 
    new_marker_lng, 
    viewmode = 'enable';

// Get Elements
const new_marker_form = document.getElementById('new-marker-form'),
      map_display = document.getElementById('map-display')
      viewmode_btn = document.getElementById('viewmode')
      directions = document.getElementById('directions')
      container = document.getElementById('container');

container.style.height = window.innerHeight;
viewmode_btn.textContent = `Click to ${viewmode} adding a field`;

//Google Maps link calls to initalize the map
function initMap() {
    let lat, lng;

    //Create map at the center of the U.S.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.0902, lng: -95.7129 },
        zoom: 4,
        gestureHandling: 'greedy'
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


    // Add click event to map for user to add a point
    google.maps.event.addListener(map, 'click', (e) => {
        if (viewmode === 'disable') {
            // Grab hidden form div from HTML
            const content = document.getElementById('content');
            // Display the form to add ontop of the map
            content.style.display = 'block';
            // If the users device is less than 600px than center form on map
            if (window.innerWidth < 600) {
                map.panTo({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
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

    viewmode_btn.addEventListener('click', () => {
        if (viewmode === 'enable') {
            viewmode = 'disable';
            // directions.textContent = `Click to ${viewmode} adding a field`;
            viewmode_btn.textContent =  `Click to ${viewmode} adding a field`;
        } else {
            viewmode = 'enable';
            // directions.textContent = `Click to ${viewmode} adding a field`;
            viewmode_btn.textContent =  `Click to ${viewmode} adding a field`;
        }
        // viewmode_btn.textContent =  `Viewmode ${viewmode}`;
    })

    // Add recenter button on desktop and tablet
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
        lat: new_marker_lat,
        lon: new_marker_lng
    }

    // Check the user has added a name for the field
    if (fieldName !== '') {
        try {
            // If yes, send data to backend
            const ajax = new XMLHttpRequest();
            ajax.open('POST', '/field_api');
            ajax.setRequestHeader('Content-Type', 'application/json');
            ajax.send(JSON.stringify(newMarkerData));

            // Close custom popup
            handleClose();
            // Add the new point to the map
            getData();
        } catch (error) {
            console.log('error');
        }
    } else {
        // If no, display alert
        document.querySelector('.alert').style.display = 'block';
    }; 
    
}

// Handle close function
const handleClose = function() {
    // remove the popup from the map by setting it to null
    popup.setMap(null);
    // recreate the new marker form
    let newDiv = document.createElement('div');
    newDiv.id = 'content';
    newDiv.innerHTML = '<label>Field Name</label><br><input type="text" name="fieldName" id="fieldName" placeholder="Add a fieldname..."><br><p class="alert">Fieldname is required!</p><label>Sport</label><br><select id="sport" name="sport"><option value="soccer">Soccer</option><option value="football">Football</option><option value="baseball">Baseball</option><option value="basketball">Basketball</option></select><br><label>Description</label><br><input type="text" id="description" name="description" placeholder="Add a description..."><br><button id="enter" class="btn">Enter</button><button id="close" class="btn">Close</button>';
    map_display.appendChild(newDiv);
    // Add events to new form
    document.getElementById('close').addEventListener('click', () => {
        handleClose()
    })
    document.getElementById('enter').addEventListener('click', () => {
        handleSubmit();
    })
}

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