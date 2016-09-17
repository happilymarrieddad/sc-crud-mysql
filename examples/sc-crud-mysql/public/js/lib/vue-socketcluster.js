;(function () {
    var version = '1.1.0';
    window.VueSocketcluster = {};

    if (!socketCluster) {
        throw new Error("[Vue-Socketcluster] cannot locate socketcluster-client");
    }

    var VueSocketcluster = {
        install: function (Vue, config) {

            if (typeof config == 'object') {
                if (!config.hostname || !config.port) {
                    config.hostname = 'localhost';
                    config.port = 3000;
                }
                
            } else {
                config = {
                    hostname:'localhost',
                    port:3000
                };
            }

            var socket = socketCluster.connect(config);

            var onevent = socket.onevent;
            socket.onevent = function (packet) {
                var args = packet.data || [];
                onevent.call(this, packet);
                packet.data = ["*"].concat(args);
                onevent.call(this, packet);
            }

            var methods = [
                "error",
                "connect",
                "disconnect",
                "connectAbort",
                "raw",
                "kickOut",
                "subscribe",
                "subscribeFail",
                "unsubscribe",
                "authStateChange",
                "authTokenChange",
                "subscribeStateChange",
                "subscribeRequest",
                "authenticate",
                "deauthenticate",
                "message"
            ];

            Vue.mixin({
                created: function () {
                    var self = this;
                    if (this.$options.hasOwnProperty("sockets")) {
                        
                        for (var key in self.$options.sockets) {
                            if (self.$options.sockets.hasOwnProperty(key) && methods.indexOf(key) < 0) {
                                socket.on(key,function(emit,data,respond) {
                                    self.$options.sockets[key].call(self,data,respond);
                                })
                            }
                        }

                        methods.forEach(function (event) {
                            socket.on(event, function (d,r) {
                                if (self.$options.sockets.hasOwnProperty(event)) {
                                    self.$options.sockets[event].call(self, d, r);
                                }
                            })
                        })
                    }

                    // Global VueSocketcluster instance
                    this.$sc = socket;
                }
            })


        }
    };

    if (typeof exports == "object") {
        module.exports = VueSocketcluster;
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return VueSocketcluster;
        })
    } else if (window.Vue) {
        window.VueSocketcluster = VueSocketcluster;
    }


})();