//Define map to allow access to the rest of the project
let map, popup, Popup;
let new_marker_lat, new_marker_lng;

// Get Elements
const new_marker_form = document.getElementById('new-marker-form'),
      map_display = document.getElementById('map-display');

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

    google.maps.event.addListener(map, 'click', (e) => {
        const content = document.getElementById('content');
        content.style.display = 'block';
        if (window.innerWidth < 600) {
            map.setCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
        Popup = createPopupClass();
        popup = new Popup(
            new google.maps.LatLng(e.latLng.lat(), e.latLng.lng()),
            content);
        popup.setMap(map);

        new_marker_lat = e.latLng.lat();
        new_marker_lng = e.latLng.lng();
    })

    // //Listener to click and add Lat/Long to form and create new marker
    // google.maps.event.addListener(map, 'click', (e) => {

    //     //Show form when user clicks the map
    //     new_marker_form.style.display = 'block';
    //     map_display.style.display = 'none';

    //     //Set input for the Lat and Long where user clicks
    //     new_marker_lat = e.latLng.lat();
    //     new_marker_lng = e.latLng.lng();
    // })

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
// document.getElementById('submit').addEventListener('click', async e => {

//     //Set values to an objest
//     const data = { 
//         fieldName: fieldName.value, 
//         sport: sport.value, 
//         description: description.value,
//         lat: new_marker_lat, 
//         lon: new_marker_lng 
//     };

//     //Check inputs value to see if they are filled in
//     if (fieldName !== '') {
//         try {
//             // await fetch('/field_api/', options);
//             const ajax = new XMLHttpRequest();
//             ajax.open('POST', '/field_api');
//             ajax.setRequestHeader('Content-Type', 'application/json');
//             ajax.send(JSON.stringify(data));
//         } catch (error) {
//             console.log('error');
//         }
//     }; 

//     //Hide form
//     new_marker_form.style.display = 'none';
//     map_display.style.display = 'block';
    
//     // Function fetches via GET and loads all markers
//     getData();

//     //Clear values from inputs
//     fieldName.value = '';
//     sport.value = '';
    
//     e.preventDefault();
// });

//Listener to cancel new field
// document.getElementById('cancel').addEventListener('click', () => {
//     fieldName.value = '';
//     sport.value = '';
//     new_marker_form.style.display = 'none';
//     map_display.style.display = 'block';
// });

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

  document.getElementById('enter').addEventListener('click', () => {
      handleSubmit();
  })

  document.getElementById('close').addEventListener('click', () => {
    handleClose();
});

const handleSubmit = function() {
    const newMarkerData = {
        fieldName: document.getElementById('fieldName').value,
        sport: document.getElementById('sport').value,
        description: document.getElementById('description').value,
        lat: new_marker_lat,
        lon: new_marker_lng
    }

    if (fieldName !== '') {
        try {
            const ajax = new XMLHttpRequest();
            ajax.open('POST', '/field_api');
            ajax.setRequestHeader('Content-Type', 'application/json');
            ajax.send(JSON.stringify(newMarkerData));
        } catch (error) {
            console.log('error');
        }
    }; 

    handleClose();
    getData();
}

const handleClose = function() {
    popup.setMap(null);
    let newDiv = document.createElement('div');
    newDiv.id = 'content';
    newDiv.innerHTML = '<label>Field Name</label><br><input type="text" name="fieldName" id="fieldName"><br><label>Sport</label><br><select id="sport" name="sport"><option value="soccer">Soccer</option><option value="football">Football</option><option value="baseball">Baseball</option><option value="basketball">Basketball</option></select><br><label>Description</label><br><input type="text" id="description" name="description"><br><button id="enter" class="btn">Enter</button><button id="close" class="btn">Close</button>';
    map_display.appendChild(newDiv);
    document.getElementById('close').addEventListener('click', () => {
        handleClose()
    })
    document.getElementById('enter').addEventListener('click', () => {
        handleSubmit();
    })
}