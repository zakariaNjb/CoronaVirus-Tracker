/**global variables**/
var map;
var lastWindowInfo;
var lastMarker;
var markerTable = [];
/**urls and apikey**/
var urlAllCountries = "https://api.covid19api.com/summary";
/**functions**/
let createMarker = function(geoObj) {
    let marker = new window.google.maps.Marker({
        position: geoObj,
        map: map
    });
    return marker
};
//call geo api for the country+create marker+attach the marker with associated windo info
let callCountLocApi = function(CountryCode, windowInfo) {
    url = "http://api.worldbank.org/v2/country/" + CountryCode + "?format=json";
    fetch(url).then((response) => {
        if (response.ok == false) throw Error("there is something wrong!!");
        return response.json();
    }).then((data) => {
        let geoObj = {
            lat: parseFloat(data[1][0].latitude),
            lng: parseFloat(data[1][0].longitude)
        };
        let marker = createMarker(geoObj);
        markerTable.push(marker);
        window.google.maps.event.addListener(marker, 'click', (e) => {
            if (lastWindowInfo != null && lastMarker != null) {
                lastWindowInfo.close();
                lastMarker.setAnimation(null);
                lastMarker.setIcon(null);
            }
            windowInfo.open(map, marker);
            marker.setIcon('marker.png');
            lastMarker = marker;
            lastWindowInfo = windowInfo;
        });
    }).catch((message) => {
        console.log(message);
    });
};
let createCoronaInfoAllC = function(contr, CountryCode) { //i have to pass the country object that includes corona data
    var windowInfo;
    fetch('https://pixabay.com/api/?key=13099347-347f019cc9542fc3d10c5ad06&q=' + contr.Country + '+flag&image_type=photo&category=travel').then((response) => {
        if (response.ok == false) throw Error("there is something wrong!!");
        return response.json();
    }).then((data) => {
        let imgUrl = data.hits[0].webformatURL;
        windowInfo = new window.google.maps.InfoWindow({
            content: '<div id="info">' +
                '<img src=' + imgUrl + '>' +
                '<div class="data">' +
                '<a>Country:<span style="color:blue">' + contr.Country + '</span></a>' +
                '<a>CountryCode:<span style="color:blue">' + contr.CountryCode + '</span></a>' +
                '<a>NewConfirmed:<span style="color:orangered">' + contr.NewConfirmed + '</span></a>' +
                '<a>NewDeaths:<span style="color:red">' + contr.NewDeaths + '</span></a>' +
                '<a>NewRecovered:<span style="color:green">' + contr.NewRecovered + '</span></a>' +
                '<a>TotalConfirmed:<span>' + contr.TotalConfirmed + '</span></a>' +
                '<a>TotalDeaths:<span style="color:red">' + contr.TotalDeaths + '</span></a>' +
                '<a>TotalRecovered:<span style="color:green">' + contr.TotalRecovered + '</span></a>' +
                '<a>Date:<span>2020-07-16T16:51:34Z</span></a>' +
                '</div>' +
                '</div>'
        });
        window.google.maps.event.addListener(windowInfo, 'closeclick', (e) => lastMarker.setIcon(null));
    }).then(() => {
        callCountLocApi(CountryCode, windowInfo);
    }).catch((message) => {
        console.log(message);
    });
};
//callCountLocApi + create info window of data of the country
let coronaAllCountries = function(urlAllCountries) {
    fetch(urlAllCountries).then((response) => {
        if (response.ok == false) throw Error("there is something wrong!!");
        return response.json();
    }).then((data) => {
        for (let i = 0; i < data.Countries.length; i++) createCoronaInfoAllC(data.Countries[i], data.Countries[i].CountryCode);
    }).catch((message) => {
        console.log(message);
    });
};
/**Main function**/
(function(window, google) {
    //create intial option
    var option = {
        center: {
            lat: 33.589886,
            lng: -7.603869
        },
        zoom: 5
    };
    //create our map object
    map = new google.maps.Map(document.getElementById("map"), option);
    //add zoom event to our nap object
    google.maps.event.addListener(map, 'zoom_changed', () => { let cluster = new MarkerClusterer(map, markerTable); });
    //corona virus statistics for all countries
    coronaAllCountries(urlAllCountries);
}(window, window.google));