var MapView = function (store) {

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function() {
        //this.el.html(MapView.template(store));
        Map.initialize(this.el);
        return this;
    };

    this.onShow = function(){
        Map.showPosition();
    }

    this.initialize();
}

//MapView.template = Handlebars.compile($("#map-tpl").html());

var Map = {
    date: null,
    marker: null,
    map: null,
    mapOut: null,
    mapMessage: null,
    mapDiv: null,
    mess: null,
    messError: null,
    initialize: function (el) {
        var header = $('<div class="header"><button data-route="orders" class="icon ico_back">&nbsp;</button></div>').appendTo(el);
        var sc = $('<div class="scroll"/>').appendTo(header);
        Map.mapDiv = $('<div id="mapDiv"/>').appendTo(sc);
        Map.mapMessage = $('<div id="mapMessage">Waiting ...</div>').appendTo(sc);
        Map.mapOut = $('<div id="mapOut"/>').appendTo(sc);

        if (Map.mess) {
            Map.message(Map.mess, Map.messError);
        }
    },
    success: function (position) {
        Map.date = new Date().toTimeString();
        Map.message("Success " + Map.date);
        var d = 'Latitude: ' + position.coords.latitude + '<br />' +
       'Longitude: ' + position.coords.longitude + '<br />' +
       //'Altitude: ' + position.coords.altitude + '<br />' +
       //'Accuracy: ' + position.coords.accuracy + '<br />' +
       //'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
       //'Heading: ' + position.coords.heading + '<br />' +
       'Speed: ' + Math.ceil(position.coords.speed * 3.6) + ' km/h<br />';// +
        //'Timestamp: ' + new Date(position.timestamp) + '<br />';
        Map.mapOut.html(d);
        Map.setMap(position);
        PositionService.lat = position.coords.latitude;
        PositionService.lng = position.coords.longitude;
    },
    error: function (err) {
        Map.message("Error: " + err.message, true);
    },
    message: function (t, err) {
        if (Map.mapMessage) {
            Map.mapMessage.html(t);
            Map.mapMessage.css("color", err ? "red" : "black");
        }
        else {
            Map.mess = t;
            Map.messError = err;
        }
    },
    setMap: function (position) {
        try {
            if(window.google && window.google.maps)
            {
                Map.point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!Map.marker) {
                    Map.mapDiv.css("display", "block");
                    Map.map = new google.maps.Map(Map.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
                    Map.map.setCenter(Map.point);
                    Map.marker = new google.maps.Marker({
                        clickable: false,
                        map: Map.map,
                        title: "You are here"
                    });
                }
                //if (position.coords.speed > 0)
                //    app.marker.setOptions({path:google.maps.SymbolPath.BACKWARD_CLOSED_ARROW});

                Map.marker.setPosition(Map.point);
                Map.map.setCenter(Map.point);
            }
            else{
                Map.message("Mapy sú nedostupné", true);
            }
        }
        catch (err) {
            Map.message(err.message, true);
        }
    },
    showPosition: function () {
        try {
        if (window.google && window.google.maps)
            Map.showPosition2();
        else
            $('body').append($('script').attr("src", "http://maps.google.com/maps/api/js?sensor=false&callback=Map.showPosition2"));
        }
        catch (err) {
            Map.message(err.message, true);
        }
    },
    showPosition2: function () {
        Map.message("Hľadám pozíciu ...");
        try {
            navigator.geolocation.getCurrentPosition(Map.success, Map.error, { enableHighAccuracy: true, maximumAge: 0 }); //, { frequency: 2000 }
        }
        catch (err) {
            Map.message(err.message, true);
        }
    }
};