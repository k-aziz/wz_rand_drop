let MAP_ID = 'wzMap'

// const DAM = "Dam";
// const MILITARY_BASE = "Military Base";
// const QUARRY = "Quarry";
// const TV_STATION = "TV Station";
// const AIRPORT = "Airport";
// const STORAGE_TOWN = "Storage Town";
// const SUPERSTORE = "Superstore";
// const STADIUM = "Stadium";
// const LUMBER = "Lumber";
// const BONEYARD = "Boneyard";
// const TRAIN_STATION = "Train Station";
// const HOSPITAL = "Hospital";
// const DOWNTOWN = "Downtown"
// const FARMLAND = "Farmland";
// const PROMENADE_WEST = "Promenade West";
// const PROMENADE_EAST = "Promenade East";
// const HILLS = "Hills";
// const PARK = "Park";
// const PORT = "Port";
// const PRISON = "Prison";


// referenced from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    var new_array = array;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [new_array[i], new_array[j]] = [array[j], array[i]];
    }
    return new_array;
}

function makeStruct(names) {
    names = names.split(' ');
    var count = names.length;

    function constructor() {
        for (var i = 0; i < count; i++) {
          this[names[i]] = arguments[i];
        }
      }
      return constructor;
}

var Location = makeStruct('name latLng');

// var dam = new Location(DAM, [820, 200]);
// var militaryBase = new Location(MILITARY_BASE, [835, 480]);
// var quarry = new Location(QUARRY, [785, 750]);
// var tvStation = new Location(TV_STATION, [555, 555]);
// var airport = new Location(AIRPORT, [585, 250]);
// var storageTown = new Location(STORAGE_TOWN, [480, 170]);
// var superstore = new Location(SUPERSTORE, [460, 300]);
// var stadium = new Location(STADIUM, [420, 690]);
// var lumber = new Location(LUMBER, [430, 910]);
// var boneyard = new Location(BONEYARD, [310, 155]);
// var trainStation = new Location(TRAIN_STATION, [270, 300]);
// var hospital = new Location(HOSPITAL, [300, 500]);
// var downtown = new Location(DOWNTOWN, [270, 640]);
// var farmland = new Location(FARMLAND, [250, 890]);
// var promenadeWest = new Location(PROMENADE_WEST, [180, 240]);
// var promenadeEast = new Location(PROMENADE_EAST, [200, 425]);
// var hills = new Location(HILLS, [145, 300]);
// var park = new Location(PARK, [155,  610]);
// var port = new Location(PORT, [160, 750]);
// var prison = new Location(PRISON, [50, 900]);

// var locations = [
//     dam,
//     militaryBase,
//     quarry,
//     tvStation,
//     airport,
//     storageTown,
//     superstore,
//     stadium,
//     lumber,
//     boneyard,
//     trainStation,
//     hospital,
//     downtown,
//     farmland,
//     promenadeWest,
//     promenadeEast,
//     hills,
//     park,
//     port,
//     prison,
// ];

var locations = [];
var markers = [];

var map = L.map('leafletMap', {
    crs: L.CRS.Simple,
    minZoom: -2,
    zoomDelta: 0.25,
    zoomSnap: 0.05
});

var yx = L.latLng;

var xy = function(x, y) {
    if (L.Util.isArray(x)) {    // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x);  // When doing xy(x, y);
};

var bounds = [xy(0, 0), xy(1000, 1000)];
var image = L.imageOverlay('/static/img/wz_map.png', bounds).addTo(map);
map.setView(L.latLng(500,500), -0.5);

window.onload = function(e){ getNamedLocations(); loadMap(); resize(); setMapHandlers();}
window.onscroll = function(e){ }
window.onresize = function(e){ loadMap(); resize(); setMapHandlers();}


$("#genDropBtn").click(function sendLocations(e) {
    let url = "/generate_drop";

    let payload = {
        "locations": locations
    }
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(payload),
        contentType: "application/json",
    }).done(async function(data) {
        console.log(data);
        var location = data.location;
        locations = data.all_locations;

        setLocationMarkers();

        for(let i = 0; i < markers.length; i++) {
            let current_marker = markers[i]
            let markerLatLng = current_marker.getLatLng()

            if(
                markerLatLng.lat === location.latLng.lat &&
                markerLatLng.lng === location.latLng.lng
            ) {
                randomBounceAllMarkers(current_marker);
            }
        }
    })
})


function loadMap() {
    setLocationMarkers();

}

var widthHeightRatio = 0.9307228915662651
var originalWidth = 927
var originalHeight = 996


function resize(){
    var map_width = parseInt($("#leafletMap").css("width").replace("px", ""))
    var window_width = $(window).width();

    if(window_width >= 992){

        $('#leafletMap').css("height", originalHeight - 50);
        map.setView(L.latLng(500,500), -0.3);

    } else if (window_width < 992 && window_width >= 768){
        $('#leafletMap').css("height", (map_width / originalWidth * originalHeight));
        map.setView(L.latLng(500,500), -0.6);

    } else if (window_width < 768 && window_width >= 576){
        $('#leafletMap').css("height", (map_width / originalWidth * originalHeight));
        map.setView(L.latLng(500,500), -1);
    } else if (window_width < 576){
        $('#leafletMap').css("height", (map_width / originalWidth * originalHeight));
        map.setView(L.latLng(500,500), -1.3);
    }
    map.invalidateSize();
    setLocationMarkers();
}


function onMapClick(e) {
    var location = new Location("Custom Location", e.latlng);
    locations.push(location);
    addMarker(location);
}


function onMapRightClick(e) {
    var targetLatLng = e.target.getLatLng();

    map.removeLayer(e.target);
    for(let i = 0; i < markers.length; i++) {
        let latLng = markers[i].getLatLng();
        if(latLng.lat === targetLatLng.lat && latLng.lng === targetLatLng.lng) {
            markers.splice(i, 1);
            console.log("removed marker");
        }
    }

    for(let i = 0; i < locations.length; i++) {
        let latLng = locations[i].latLng;
        if(latLng.lat === targetLatLng.lat && latLng.lng === targetLatLng.lng) {
            locations.splice(i, 1);
            console.log("removed location");
        }
    }
}


function setMapHandlers() {
    map.on('click', onMapClick);
}


function getNamedLocations() {
    var url = "/named_locations"
    $.ajax({
        url: url,
        type: "GET",
    }).done(function(data) {
        console.log(data);
        locations = data;
        setLocationMarkers();
    })
}


function setLocationMarkers() {
    // Remove old markers
    for(let i = 0; i < markers.length; i++) {
        if (markers[i] != undefined) {
            map.removeLayer(markers[i]);
        }
    }
    markers = []
    // Add new markers
    for(let i = 0; i < locations.length; i++) {
        addMarker(locations[i]);
    }
}


function addMarker(location) {
    var marker = L.marker(location.latLng, {"title": location.name})
    .addTo(map)
    .bindPopup(
        location.name,
        {
            closeButton: false
        }
    );
    marker.on("contextmenu", onMapRightClick)
    markers.push(marker)
}


function randomBounceAllMarkers(active_marker) {

    function bounceSingleMarker(marker){
        marker.bounce(1);
    }
    var randomised_markers = shuffleArray(markers)
    var i = 0;

    function myLoop() {
        setTimeout(function() {
            bounceSingleMarker(randomised_markers[i]);
            i++;
            if (i < randomised_markers.length) {
                myLoop();
            } else if(i === randomised_markers.length) {
                active_marker.setBouncingOptions({exclusive: true}).bounce();
                setTimeout(function() { active_marker.openPopup(); }, 1500)
            }
        }, 200)
    }

    myLoop();
}