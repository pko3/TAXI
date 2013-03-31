var Service = {
    _settings: {
        id:"12"
    },
    initialize: function(callback){
        Service.callLater(callback);
    },
    getOrders: function (callback) {
        Service.callLater(callback, [
            { title:"Ahoj", description:"", id:"", fk:"" }
        ]);
    },
    getStates: function (callback) {
        Service.callLater(callback, [
            { title: "Voľné", index: 0, selected: true },
            { title: "Obsadené zakázkou", index: 1, selected: false },
            { title: "Inak obsadené", index: 2, selected: false },
            { title: "Čaká", index: 3, selected: false },
            { title: "Tranzit", index: 4, selected: false },
            { title: "Prestávka", index: 5, selected: false },
            { title: "Porucha", index: 6, selected: false },
        ]);
    },
    getSettings: function () {
        if (!Service._settings)
            Service._settings = JSON.parse(window.localStorage.getItem("settings"));
        return Service._settings;
    },
    saveSettings: function (data) {
        Service._settings = data;
        window.localStorage.setItem("settings", JSON.stringify(Service._settings));
    },
    callLater: function(callback, data) {
        if (callback) {
            setTimeout(function() {
                callback(data);
            });
        }
    }
}