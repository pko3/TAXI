var DetailMap = {
    date: null,
    marker: null,
    tmarker: null,
    map: null,
    mapDiv: null,
    mess: null,
    messError: null,
    apiIsOk: false,
    geocoder: null,
    initialize: function (mapOut) {
        DetailMap.mapDiv = mapOut;
        DetailMap.map = null;
    },
    //geocode: function (props, postback) {
    //    var self = this, a = {}, lat, lng;
    //    if (self.geocoder)
    //        self.geocoder.geocode(props, function (results, status) {
    //            if (status == google.maps.GeocoderStatus.OK) {
    //                if (results[0]) {
    //                    a = self.placeToAddress(results[0]);
    //                    lat = a.Latitude;
    //                    lng = a.Longitude;
    //                }
    //            }

    //            if (postback) {
    //                postback({
    //                    lat: lat, lng: lng,
    //                    City: a.City,
    //                    Status: status,
    //                    Address: (a.Street ? a.Street + " " + (a.StreetNumber ? a.StreetNumber : "") : (a.PointOfInterest ? a.PointOfInterest + " " : ""))
    //                });
    //            }
    //        });
    //    else
    //        postback({});
    //},
    //placeToAddress: function (place) {
    //    var address = {};
    //    if (place.geometry) {
    //        address.Latitude = place.geometry.location.lat();
    //        address.Longitude = place.geometry.location.lng();
    //    }
    //    $(place.address_components).each(
    //        function () {
    //            var a = this;
    //            if (a.types.length > 0)
    //                switch (a.types[0]) {
    //                    case "country":
    //                        address.Country = a.long_name;
    //                        address.CountryShortName = a.short_name;
    //                        break;
    //                    case "locality":
    //                        address.City = a.long_name;
    //                        break;
    //                    case "sublocality":
    //                        address.sublocality = a.long_name;
    //                        break;
    //                    case "postal_code":
    //                        address.PostalCode = a.long_name;
    //                        break;
    //                    case "route":
    //                        address.Street = a.long_name;
    //                        break;
    //                    case "street_number":
    //                        address.StreetNumber = a.long_name;
    //                        break;
    //                    case "point_of_interest":
    //                        address.PointOfInterest = a.long_name;
    //                        break;
    //                    case "establishment":
    //                        address.PointOfInterest = a.long_name;
    //                        break;
    //                }
    //        }
    //    );
    //    return address;
    //},
    setMap: function (lat, lng, tlat, tlng) {
        //try {
        if (Map.apiIsOk) {
            DetailMap.point = new google.maps.LatLng(lat, lng);

            if (!DetailMap.map) {
                DetailMap.mapDiv.css("display", "block");
                DetailMap.map = new google.maps.Map(DetailMap.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
                DetailMap.map.setCenter(DetailMap.point);
                DetailMap.marker = new google.maps.Marker({
                    clickable: false,
                    icon: { url: "http://maps.gstatic.com/mapfiles/ms2/micons/man.png" },
                    shadow: new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/ms2/micons/man.shadow.png",
                    new google.maps.Size(59.0, 32.0),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16.0, 32.0)
                    ),
                    map: DetailMap.map
                });
                DetailMap.tmarker = new google.maps.Marker({

                    icon: { url: "http://maps.gstatic.com/mapfiles/ms2/micons/cabs.png" },
                    shadow: new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/ms2/micons/cabs.shadow.png",
                    new google.maps.Size(59.0, 32.0),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(16.0, 32.0)
                    ),
                    clickable: false,
                    map: DetailMap.map
                });
            }

            google.maps.event.trigger(DetailMap.map, "resize");
            DetailMap.map.setCenter(DetailMap.point);
            DetailMap.marker.setPosition(DetailMap.point);
            if (tlat && tlng) {
                var tPoint = new google.maps.LatLng(tlat, tlng);
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(DetailMap.point);
                bounds.extend(tPoint);
                DetailMap.tmarker.setPosition(tPoint);
                DetailMap.map.fitBounds(bounds);
            }
        }
        else {
           
        }
    }
};