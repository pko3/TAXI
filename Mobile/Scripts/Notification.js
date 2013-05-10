﻿Notification =
       {
           isInitialized: false,
           newjs: undefined,
           initialize: function () {
               if (!this.isInitialized) {
                   try {
                       
                       if (this.newjs) {
                           Notification.hubLoad();
                       }
                       else {
                           var s = Service.getSettings();
                           this.require(s.url + "/signalr/hubs", function () { Notification.hubLoad(); });
                       }
                   }
                   catch (err) {
                       this.isInitialized = false;
                       app.showAlert(err, "Notification");
                   }
               }
           },
           hubLoad: function () {
               if (!this.isInitialized) {
                   this.isInitialized = true;
                   try {
                       var s = Service.getSettings();
                       $.connection.hub.url = s.url + "/signalr";
                       var h = $.connection.mobileHub, self = this;
                       h.client.notifi = function (data) {
                           if (data) {
                               if (data.Message) {
                                   app.showAlert(data.Message, "Notification");
                               }
                               if (data.RefreshDataId) {
                                   app.refreshData(data.RefreshDataId);
                               }
                           }
                       };
                       $.connection.hub.stateChanged(function (change) {
                           if (change.newState === $.signalR.connectionState.reconnecting) {
                               app.info("Notification is reconnecting!");
                           }
                           else if (change.newState === $.signalR.connectionState.connected) {
                               app.info("Notification is connected!");
                           }
                           else
                               app.info("Notification is " + change.newState);
                       });
                       this.connect();
                   }
                   catch (err) {
                       this.isInitialized = false;
                       app.showAlert(err, "Notification");
                   }
               }
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
           },
           connect: function(){
               $.connection.hub.start({ jsonp: true }) //{jsonp: true}
                           .done(function () {
                               self.isInitialized = true;
                           })
                           .fail(function (err) {
                               self.isInitialized = false;
                               app.showAlert(err, "Notification");
                           });
           },
           reconnect: function () {
               $.connection.hub.stop();
               this.connect();
           }
       }