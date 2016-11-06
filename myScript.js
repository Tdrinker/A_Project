var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 13,
    center: me,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

var station_list = [
    {station_name: "Iapm", lat:31.215907, lng: 121.458294, location: new google.maps.LatLng(31.215907, 121.458294)},
    {station_name: "SWFC", lat:31.2346983, lng: 121.50755879999997, location: new google.maps.LatLng(31.2346983, 121.50755879999997)},
    {station_name: "Jiali", lat:31.224423, lng: 121.450200, location: new google.maps.LatLng(31.224423, 121.450200)},
]


var map;
var present_icon = "present.png";
var me_photo = "me.png";
var marker_me;
var infowindow = new google.maps.InfoWindow();

function init() {
    map = new google.maps.Map(document.getElementById("map"), myOptions);
    getMyLocation();
}


function getMyLocation() {
    if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
         navigator.geolocation.getCurrentPosition(function(position) {
            this.myLat = position.coords.latitude;
            this.myLng = position.coords.longitude;

            renderMap();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser.  What a shame!");
    }
}

var nearest_index;
var nearest_distance;


function renderMap()
{
    me = new google.maps.LatLng(myLat, myLng);
                
    map.panTo(me);

    update_nearest_station();

    var contentString = '<p>closest station: '
    + station_list[nearest_index].station_name + '</p>'
    + '<p>which is </p>' + nearest_distance
    + '<p> miles from you</p>' ;

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker_me = new google.maps.Marker({
        position: me,
        title: "Here I Am!",
        map: map,
        icon: me_photo,
        animation: google.maps.Animation.BOUNCE
    });

    google.maps.event.addListener(marker_me, 'click', function() {
        show_nearest_station(); // nearest_index is now updated
        infowindow.open(map, marker_me);
    });

    marker_me.setMap(map);

    var infowindow_stations = {};
    for (let i = 0; i < 3; i++){
        var contentStrings = '<p>station name: </p>'
        + station_list[i].station_name;

        infowindow_stations[i] = new google.maps.InfoWindow({
            content: contentStrings
        });

        var Marker = new google.maps.Marker({
            position: station_list[i].location,
            title: station_list[i].station_name,
            time_remaining: station_list[i].time_remain,
            map: map,
            icon: present_icon,
            animation: google.maps.Animation.DROP
        });
        google.maps.event.addListener(Marker, 'click', function() {
            infowindow_stations[i].open(map, this);
            for (j = 0; j < 3; j++){
                if (j!=i){
                    infowindow_stations[j].close(map, this);
                }
            }
        });
    }

}

function update_nearest_station(){
    var index_received = get_cloest_station(station_list);
    var lat_nearest = station_list[index_received].lat;
    var lng_nearest = station_list[index_received].lng;

    var Coordinates_me_to_closest_station = [
        {lat: lat_nearest, lng: lng_nearest},
        {lat: myLat, lng: myLng}
    ]

    nearest_index = index_received;
}

function show_nearest_station(){
    var index_received = get_cloest_station(station_list);
    var lat_nearest = station_list[index_received].lat;
    var lng_nearest = station_list[index_received].lng;

    var Coordinates_me_to_closest_station = [
        {lat: lat_nearest, lng: lng_nearest},
        {lat: myLat, lng: myLng}
    ]
    var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 4
    }
    var nearest_path = new google.maps.Polyline({
        path: Coordinates_me_to_closest_station,
        //geodesic: true,
        strokeColor: 'blue',
        strokeOpacity: 0,
        //strokeOpacity: 1.0,
        //strokeWeight: 2,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '15px'
        }],
    })
    nearest_path.setMap(map);

    nearest_index = index_received;
}


function get_cloest_station(station_list){
    var index = 0;
    var lat_station = station_list[0].lat;
    var lng_station = station_list[0].lng;

    var smallest_distance = get_distance(lat_station, lng_station, myLat, myLng);

    for (i = 0; i < 3; i++){
        lat_station = station_list[i].lat;
        lng_station = station_list[i].lng;
        var potential_smallest_distance = get_distance(lat_station, lng_station, myLat, myLng);
        if (potential_smallest_distance < smallest_distance){
            smallest_distance = potential_smallest_distance;
            index = i;
        }
    }
    nearest_distance = smallest_distance;
    return index;
}

function get_distance(lat1, lon1, lat2, lon2){
    if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        }
    }
    var R = 6371;
    var φ1 = lat1.toRad();
    var φ2 = lat2.toRad();
    var Δφ = (lat2-lat1).toRad();
    var Δλ = (lon2-lon1).toRad();

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;

    return d;
}






