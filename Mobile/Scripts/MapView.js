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
        Map.resize();
    }

    this.initialize();
}

//MapView.template = Handlebars.compile($("#map-tpl").html());

var Map = {
    watchID: null,
    date: null,
    marker: null,
    map: null,
    mapOut: null,
    mapMessage: null,
    mapDiv: null,
    initialize: function (el) {

        var sc = $('<div class="scroll"/>').appendTo(el);
        Map.mapDiv = $('<div id="mapDiv"/>').appendTo(sc);
        Map.mapMessage = $('<div id="mapMessage">Waiting ...</div>').appendTo(sc);
        Map.mapOut = $('<div id="mapOut"/>').appendTo(sc);

        Map.message("Waiting watch position ...");
        try {
            Map.watchID = navigator.geolocation.watchPosition(Map.success, Map.error, { frequency: 2000 });
        }
        catch (err) {
            Map.message("Error: " + err.message, true);
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
    },
    error: function (err) {
        Map.message("Error: " + err.message, true);
    },
    message: function (t, error) {
        Map.mapMessage.html(t);
        Map.mapMessage.css("color", error ? "red" : "black");
    },
    setMap: function (position) {
        if (google.maps) {
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
    },
    resize: function(){
        if (Map.map) {
            google.maps.event.trigger(Map.map, "resize");
            Map.map.setCenter(Map.point);
        }
    }
};