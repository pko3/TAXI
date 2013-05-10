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
        if (!google || !google.maps) {
            this.require("http://maps.google.com/maps/api/js?sensor=true", function () { Map.setMap2(position); });
        }
        else this.setMap2(position);
    },
    setMap2: function (position) {
        if (google && google.maps) {
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
        else Map.message("Mapy sú nedostupné");
    },
    showPosition: function () {
        // if (Map.map) {
        Map.message("H¾adám pozíciu ...");
        try {
            navigator.geolocation.getCurrentPosition(Map.success, Map.error); //, { frequency: 2000 }
        }
        catch (err) {
            Map.message("Error: " + err.message, true);
        }
        //}
    },
    require: function (file, callback) {
        var script = document.getElementsByTagName('script')[0], self = this;
        this.newjs = document.createElement('script');

        // IE
        this.newjs.onreadystatechange = function () {
            if (self.newjs.readyState === 'loaded' || self.newjs.readyState === 'complete') {
                self.newjs.onreadystatechange = null;
                callback();
            }
        };
        // others
        this.newjs.onload = function () {
            callback();
        };
        this.newjs.src = file;
        script.parentNode.insertBefore(this.newjs, script);
    }
};