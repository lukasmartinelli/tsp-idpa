var tsp;
(function (tsp) {
    (function (visual) {
        ///<reference path='../definitions/google.maps.d.ts' />
        ///<reference path='../definitions/jquery.d.ts' />
        ///<reference path='../definitions/knockout.d.ts' />
        ///<reference path="tsp.aoc.ts" />
        ///<reference path="tsp.visual.graph.ts" />
        (function (maps) {
            /** Pheronom trail displays all edges and their pheronom value visually. */
            var PheronomTrail = (function () {
                /** Create a new pheronom trail. You have to call show() in order to render the edges.
                @constructor
                @param map - The google map used to draw the polylines for the edges.
                @param graph - The graph to get the edges from.
                */
                function PheronomTrail(map, graph) {
                    this._map = map;
                    this._polylines = [];
                    this.createPolylinesForEdge(graph, this.getPheronomAverage(graph));
                }
                PheronomTrail.prototype.show = /** Show the polylines on the map */
                function () {
                    var _this = this;
                    _.forEach(this._polylines, function (line) {
                        return line.setMap(_this._map);
                    });
                };
                PheronomTrail.prototype.hide = /** Hide the polylines on the map */
                function () {
                    _.forEach(this._polylines, function (line) {
                        return line.setMap(null);
                    });
                };
                PheronomTrail.prototype.createPolylinesForEdge = /** Create polylines for all edges. The strokeWeight of the polyline is relative to its pheronom value.
                @constructor
                @param graph - The graph for travelling through the edges.
                @param pheromonAvg - The pheromon average of all edges. Used to define the relative value of the strokeWeight.
                */
                function (graph, pheromonAvg) {
                    var _this = this;
                    var edges = graph.getEdges();
                    _.forEach(edges, function (edge) {
                        var relativeWeight = (3 / pheromonAvg) * edge.pheronom();
                        var polyline = new google.maps.Polyline({
                            path: [
                                (edge.from).location, 
                                (edge.to).location
                            ],
                            strokeColor: '#0000FF',
                            strokeOpacity: 0.7,
                            strokeWeight: relativeWeight > 1 ? relativeWeight : 1
                        });
                        _this._polylines.push(polyline);
                    });
                };
                PheronomTrail.prototype.getPheronomAverage = /** Calculate the pheromon average of all edges of a graph
                @param graph The graph containing the pheromon edges.
                */
                function (graph) {
                    var pheromonSum = 0;
                    var edgeCount = 0;
                    var edges = graph.getEdges();
                    _.forEach(edges, function (edge) {
                        pheromonSum += edge.pheronom();
                        edgeCount++;
                    });
                    return pheromonSum / edgeCount;
                };
                return PheronomTrail;
            })();
            maps.PheronomTrail = PheronomTrail;            
            /** A visual representation of the edges on the graph */
            var GoogleDistanceCobweb = (function () {
                /**
                Create polylines for all edges of the graph.
                @param graph The graph to get the edges from
                @map Google map to draw the polylines to
                */
                function GoogleDistanceCobweb(graph, map) {
                    var _this = this;
                    this._lines = [];
                    this._map = map;
                    var edges = graph.getEdges();
                    _.forEach(edges, function (edge) {
                        var from = edge.from;
                        var to = edge.to;
                        var line = new google.maps.Polyline({
                            path: [
                                from.location, 
                                to.location
                            ],
                            strokeColor: '#000',
                            strokeOpacity: 0.7,
                            strokeWeight: 1
                        });
                        _this._lines.push(line);
                    });
                }
                GoogleDistanceCobweb.prototype.show = function () {
                    var _this = this;
                    _.forEach(this._lines, function (p) {
                        return p.setMap(_this._map);
                    });
                };
                GoogleDistanceCobweb.prototype.hide = function () {
                    _.forEach(this._lines, function (p) {
                        return p.setMap(null);
                    });
                };
                return GoogleDistanceCobweb;
            })();
            maps.GoogleDistanceCobweb = GoogleDistanceCobweb;            
            /** A visual representation of a graph on the google map */
            var GoogleGraph = (function () {
                /** Create a new graph representation
                @graph Graph to get verticese and edges from
                @map The google map to draw the markers to
                */
                function GoogleGraph(graph, map) {
                    var _this = this;
                    this._markers = [];
                    this._map = map;
                    _.forEach(graph.getVertices(), function (vertex) {
                        var marker = new google.maps.Marker({
                            position: vertex.location
                        });
                        _this._markers.push(marker);
                    });
                }
                GoogleGraph.prototype.show = /** Show the markers */
                function () {
                    var _this = this;
                    _.forEach(this._markers, function (marker) {
                        return marker.setMap(_this._map);
                    });
                };
                GoogleGraph.prototype.hide = /** Hide the markers */
                function () {
                    _.forEach(this._markers, function (marker) {
                        return marker.setMap(null);
                    });
                };
                return GoogleGraph;
            })();
            maps.GoogleGraph = GoogleGraph;            
            var GoogleDirections = (function () {
                /**
                Create a new directions visualization of the route.
                @param map The google map used for the renderer.
                @param route The route to draw. If the route is longer than 8 vertices
                the route cannot be displayed and will throw an error.
                */
                function GoogleDirections(map, route) {
                    var _this = this;
                    if(route.getVertices().length > 8) {
                        throw 'Route cannot be longer than 8 vertices. This is a restriction by google.';
                    }
                    this._map = map;
                    this._directionsService = new google.maps.DirectionsService();
                    this._directionsRenderer = new google.maps.DirectionsRenderer({
                        map: this._map
                    });
                    this.getDirections(route).done(function (result) {
                        _this._directionsRenderer.setDirections(result);
                        _this.show();
                    });
                }
                GoogleDirections.prototype.show = /** Set map on directions renderer to display the directions */
                function () {
                    this._directionsRenderer.setMap(this._map);
                };
                GoogleDirections.prototype.hide = /** Set map to null on directions renderer to hide all the directions */
                function () {
                    this._directionsRenderer.setMap(null);
                };
                GoogleDirections.prototype.getDirections = /** Access the google direction service using the waypoints of the route and return the result as promise
                @param route The route to get directions for.
                */
                function (route) {
                    var deferred = $.Deferred();
                    var vertices = route.getVertices();
                    var start = vertices[0];
                    var end = vertices[vertices.length - 1];
                    var waypoints = vertices.slice(1, vertices.length - 1).map(function (v) {
                        return {
                            location: v.location,
                            stopover: true
                        };
                    });
                    this._directionsService.route({
                        origin: start.location,
                        destination: end.location,
                        waypoints: waypoints,
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false
                    }, function (result, status) {
                        if(status == google.maps.DirectionsStatus.OK) {
                            deferred.resolve(result);
                        } else {
                            deferred.fail('Could not draw route: ' + status);
                        }
                    });
                    return deferred;
                };
                return GoogleDirections;
            })();
            maps.GoogleDirections = GoogleDirections;            
            /** A google map where various elements can be created on. */
            var GoogleMaps = (function () {
                /** Create the google map on the given map placeholder. The map will center to switzerland.
                @param mapDiv The html element of the placeholder.
                */
                function GoogleMaps(mapDiv) {
                    this._map = new google.maps.Map(mapDiv, {
                        zoom: 8,
                        center: new google.maps.LatLng(46.961511, 8.129425),
                        mapTypeId: //Center of switzerland
                        google.maps.MapTypeId.ROADMAP
                    });
                }
                GoogleMaps.prototype.createDirections = /** Create  a directions object
                @param route The route to draw. If the route is longer than 8 vertices
                the route cannot be displayed and will throw an error.
                */
                function (route) {
                    return new GoogleDirections(this._map, route);
                };
                GoogleMaps.prototype.createTrail = /** Create a pheronom trail representation of the route.
                @param graph - The graph to get the edges from.
                */
                function (graph) {
                    return new PheronomTrail(this._map, graph);
                };
                GoogleMaps.prototype.createRoute = /** Create a visual representation of a route.
                @param route The route to show.
                */
                function (route, color) {
                    return new GoogleRoute(this._map, route, color);
                };
                GoogleMaps.prototype.createGraph = /** Create a trail object
                
                */
                function (graph) {
                    return new GoogleGraph(graph, this._map);
                };
                GoogleMaps.prototype.createDistanceWeb = /** Create a trail object
                
                */
                function (graph) {
                    return new GoogleDistanceCobweb(graph, this._map);
                };
                return GoogleMaps;
            })();
            maps.GoogleMaps = GoogleMaps;            
            /** A visual representation of a route */
            var GoogleRoute = (function () {
                /**
                Creates polylines foreach route part.
                @param map The google map to render the polylines to.
                @param route The route to show.
                */
                function GoogleRoute(map, route, color) {
                    var _this = this;
                    this.color = color;
                    this._route = route;
                    this._lines = [];
                    this._map = map;
                    var edges = route.getEdges();
                    _.forEach(edges, function (edge) {
                        var from = edge.from;
                        var to = edge.to;
                        var line = new google.maps.Polyline({
                            path: [
                                from.location, 
                                to.location
                            ],
                            strokeColor: color,
                            strokeOpacity: 1,
                            strokeWeight: 7
                        });
                        line.setMap(_this._map);
                        _this._lines.push(line);
                    });
                }
                GoogleRoute.prototype.show = /** Show all polylines */
                function () {
                    var _this = this;
                    _.forEach(this._lines, function (p) {
                        return p.setMap(_this._map);
                    });
                };
                GoogleRoute.prototype.hide = /** Hide all polylines */
                function () {
                    _.forEach(this._lines, function (p) {
                        return p.setMap(null);
                    });
                };
                return GoogleRoute;
            })();
            maps.GoogleRoute = GoogleRoute;            
        })(visual.maps || (visual.maps = {}));
        var maps = visual.maps;
    })(tsp.visual || (tsp.visual = {}));
    var visual = tsp.visual;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.visual.maps.js.map
