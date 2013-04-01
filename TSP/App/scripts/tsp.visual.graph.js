var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsp;
(function (tsp) {
    (function (visual) {
        ///<reference path='../definitions/google.maps.d.ts' />
        ///<reference path='../definitions/jquery.d.ts' />
        ///<reference path='../definitions/knockout.d.ts' />
        ///<reference path='../definitions/underscore.d.ts' />
        /// <reference path="tsp.graph.ts" />
        /// <reference path="tsp.visual.maps.ts" />
        (function (graph) {
            var GoogleGraphService = (function () {
                function GoogleGraphService() {
                    this._geocoder = new google.maps.Geocoder();
                    this._distanceService = new google.maps.DistanceMatrixService();
                    this._vertices = [];
                    this._distances = [];
                }
                GoogleGraphService.prototype.getGraph = function (addresses) {
                    var _this = this;
                    var deferred = $.Deferred();
                    this.findAddresses(addresses).done(function () {
                        _this.getDistances(_this._vertices).done(function () {
                            var graph = new tsp.graph.UndirectedGraph(addresses.length);
                            _.forEach(_this._vertices, function (vertex) {
                                return graph.addVertex(vertex);
                            });
                            _.forEach(_this._distances, function (distance) {
                                return graph.addEdge(distance.edge);
                            });
                            deferred.resolve(graph);
                        });
                    });
                    return deferred;
                };
                GoogleGraphService.prototype.getDistanceMatrix = function (origin, destinations, timeout) {
                    var _this = this;
                    var deferred = $.Deferred();
                    window.setTimeout(function () {
                        _this._distanceService.getDistanceMatrix({
                            origins: [
                                origin.name
                            ],
                            destinations: _.map(destinations, function (d) {
                                return d.name;
                            }),
                            travelMode: google.maps.TravelMode.DRIVING,
                            avoidHighways: false,
                            avoidTolls: false
                        }, function (response, status) {
                            if(status == google.maps.DistanceMatrixStatus.OK) {
                                deferred.resolve(response);
                            } else {
                                deferred.reject(status);
                            }
                        });
                    }, timeout);
                    return deferred;
                };
                GoogleGraphService.prototype.getDistances = function (vertices) {
                    var _this = this;
                    var throttling = tsp.graph.UndirectedGraph.getEdgeCount(vertices.length) * 3;
                    var calls = [];
                    _.forEach(vertices, function (vertex, i) {
                        var origin = vertex;
                        var destinations = new Array();
                        for(var j = vertices.length - 1; j > i; j--) {
                            destinations.push(vertices[j]);
                        }
                        if(destinations.length > 0) {
                            var call = _this.getDistanceMatrix(origin, destinations, throttling * i).then(function (response) {
                                _.forEach(response.rows[0].elements, function (element, k) {
                                    var from = vertex;
                                    var to = _.filter(_this._vertices, function (v) {
                                        return v.name == response.destinationAddresses[k];
                                    })[0];
                                    var edge = new tsp.aoc.PheromonEdge(from, to, element.distance.value);
                                    _this._distances.push({
                                        from: from,
                                        to: to,
                                        edge: edge
                                    });
                                });
                            }, function (failureStatus) {
                                alert(failureStatus + '\nDistanzen konnten nicht berechnet werden.');
                            });
                            calls.push(call);
                        }
                    });
                    return $.when.apply($, calls);
                };
                GoogleGraphService.prototype.findAddress = function (name, timeout) {
                    var _this = this;
                    var deferred = $.Deferred();
                    window.setTimeout(function () {
                        _this._geocoder.geocode({
                            address: name
                        }, function (results, status) {
                            if(status == google.maps.GeocoderStatus.OK) {
                                var address = new GoogleAddressVertex(results[0].formatted_address, results[0].geometry.location);
                                deferred.resolve(address);
                            } else {
                                deferred.reject(status);
                            }
                        });
                    }, timeout);
                    return deferred;
                };
                GoogleGraphService.prototype.findAddresses = function (addresses) {
                    var _this = this;
                    var throttling = addresses.length * 25;
                    var calls = [];
                    _.forEach(addresses, function (address, index) {
                        var call = _this.findAddress(address.name(), index * throttling).then(function (foundAddress) {
                            address.found(true);
                            address.name(foundAddress.name);
                            _this._vertices.push(foundAddress);
                        }, function (failureStatus) {
                            address.found(false);
                            alert(failureStatus + '\nCould not find address ' + address.name);
                        });
                        calls.push(call);
                    });
                    return $.when.apply($, calls);
                };
                return GoogleGraphService;
            })();
            graph.GoogleGraphService = GoogleGraphService;            
            var GoogleAddress = (function () {
                function GoogleAddress(name) {
                    this.name = ko.observable(name);
                    this.found = ko.observable(false);
                }
                return GoogleAddress;
            })();
            graph.GoogleAddress = GoogleAddress;            
            var GoogleAddressVertex = (function (_super) {
                __extends(GoogleAddressVertex, _super);
                function GoogleAddressVertex(name, location) {
                                _super.call(this, name);
                    this.location = location;
                }
                return GoogleAddressVertex;
            })(tsp.graph.Vertex);
            graph.GoogleAddressVertex = GoogleAddressVertex;            
        })(visual.graph || (visual.graph = {}));
        var graph = visual.graph;
    })(tsp.visual || (tsp.visual = {}));
    var visual = tsp.visual;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.visual.graph.js.map
