/// <reference path="../definitions/underscore.d.ts" />
var tsp;
(function (tsp) {
    var graph;
    (function (_graph) {
        /** The graph object used to perform calculations. This graph implementations supports only undirected edges. */
        var UndirectedGraph = (function () {
            /** Create a new graph and initialize the matrix with for the given vertexCount
                @param vertexCount The amount of vertices used to initialize the internal matrix
            */
            function UndirectedGraph(vertexCount) {
                this._vertices = [];
                this._matrix = new Array();
                for (var i = 0; i < vertexCount; i++) {
                    this._matrix[i] = new Array();
                }
            }
            /** Add a vertex to the graph. Returns the internal index of the added vertex.
                @param vertex Vertex to add.
            */
            UndirectedGraph.prototype.addVertex = function (vertex) {
                this._vertices.push(vertex);
                return _.indexOf(this._vertices, vertex);
            };
            /** Add an edge to the graph. The edges are stored internally in a multidimensional array
                to decrease lookup time.
                @param The edge to add. Must have its start and end vertex already defined.
            */
            UndirectedGraph.prototype.addEdge = function (edge) {
                var fromIndex = _.indexOf(this._vertices, edge.from);
                var toIndex = _.indexOf(this._vertices, edge.to);
                this._matrix[fromIndex][toIndex] = edge;
                this._matrix[toIndex][fromIndex] = edge;
            };
            /** Get an edge from the graph that is connected with the given vertices.
                It will lookup the indexes for the vertices and use them to access the edges in the multidimensional array.
                This should be pretty fast and is even faster if you use the index access method directly.
                @param from The start vertex the edge must be connected to
                @param to The end vertex the edge must be connected to
            */
            UndirectedGraph.prototype.getEdge = function (from, to) {
                return this.getEdgeByIndex(_.indexOf(this._vertices, from), _.indexOf(this._vertices, to));
            };
            /** Get an edge from the graph that is connected with the vertices at the given indexes.
                It will lookup the edges with the given indexes. This is the most performant access method
                @param fromIndex Index for the from vertex.
                @param toIndex Index for the to vertex.
            */
            UndirectedGraph.prototype.getEdgeByIndex = function (fromIndex, toIndex) {
                return this._matrix[fromIndex][toIndex];
            };
            /** Get all vertices in this grpah */
            UndirectedGraph.prototype.getVertices = function () {
                return this._vertices;
            };
            /** Get all edges from the internal matrix. */
            UndirectedGraph.prototype.getEdges = function () {
                var edges = [];
                for (var i = 0; i < this._matrix.length; i++) {
                    for (var j = this._matrix[i].length - 1; j > i; j--) {
                        edges.push(this._matrix[i][j]);
                    }
                }
                return edges;
            };
            /** Calculate the count of the edges depending on the vertices with an algorithm
                @param verticeCount Amount of vertices in the graph used for calculation.
            */
            UndirectedGraph.getEdgeCount = function (verticeCount) {
                return (verticeCount) * (verticeCount - 1);
            };
            return UndirectedGraph;
        })();
        _graph.UndirectedGraph = UndirectedGraph;
        /** A named vertex. You should extend the vertex in order to add custom properties. By default it does have a name. */
        var Vertex = (function () {
            function Vertex(name) {
                this.name = name;
            }
            return Vertex;
        })();
        _graph.Vertex = Vertex;
        /** A weighted edge. You can extend that to if you want to store additional information */
        var Edge = (function () {
            function Edge(from, to, weight) {
                if (weight === void 0) { weight = -1; }
                this.from = from;
                this.to = to;
                this.weight = weight;
            }
            return Edge;
        })();
        _graph.Edge = Edge;
        /** The route has a path of vertices in a specific order.
            In the tsp the route needs to touch all vertices and go back to the start point at the lowest cost.
        */
        var Route = (function () {
            /** Create a route by the given path */
            function Route(graph, path) {
                this.graph = graph;
                this._path = path;
            }
            /** Get the vertices of the path */
            Route.prototype.getVertices = function () {
                return this._path;
            };
            /** Get the edges used in the path */
            Route.prototype.getEdges = function () {
                var edges = [];
                for (var i = 0; i < this._path.length; i++) {
                    var from = this._path[i == 0 ? this._path.length - 1 : i - 1];
                    var to = this._path[i];
                    edges.push(this.graph.getEdge(from, to));
                }
                return edges;
            };
            /** Get the total weight of the route */
            Route.prototype.getTotalWeight = function () {
                return _.reduce(this.getEdges(), function (memo, edge) { return memo + edge.weight; }, 0);
            };
            return Route;
        })();
        _graph.Route = Route;
    })(graph = tsp.graph || (tsp.graph = {}));
})(tsp || (tsp = {}));
///<reference path='../definitions/knockout.d.ts' />
/// <reference path="tsp.graph.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />
var tsp;
(function (tsp) {
    var aoc;
    (function (aoc) {
        var PheromonEdge = (function (_super) {
            __extends(PheromonEdge, _super);
            function PheromonEdge() {
                _super.apply(this, arguments);
                this._pheromon = 0;
                this._pheromonUpdates = new Array();
            }
            PheromonEdge.prototype.pheronom = function () {
                return this._pheromon;
            };
            PheromonEdge.prototype.addPheromonUpdate = function (value) {
                this._pheromonUpdates.push(value);
            };
            PheromonEdge.prototype.applyDecay = function () {
                this._pheromon = (this._pheromon * (1.0 - AntColonyAlgorithm.DECAY_RATE));
            };
            PheromonEdge.prototype.applyPheromonUpdates = function () {
                for (var i = 0; i < this._pheromonUpdates.length; i++) {
                    this._pheromon += this._pheromonUpdates[i];
                }
                this._pheromonUpdates = [];
            };
            return PheromonEdge;
        })(tsp.graph.Edge);
        aoc.PheromonEdge = PheromonEdge;
        var AntColonyAlgorithm = (function () {
            function AntColonyAlgorithm(graph, options) {
                this._graph = graph;
                this._options = options;
                this.initPheromones();
            }
            AntColonyAlgorithm.prototype.initPheromones = function () {
                var edges = this._graph.getEdges();
                var totalWeight = _.reduce(edges, function (memo, edge) { return memo + edge.weight; }, 0);
                var initVal = AntColonyAlgorithm.PHEROMON_FACTOR / (totalWeight / edges.length);
                _.forEach(this._graph.getEdges(), function (edge) {
                    edge.addPheromonUpdate(initVal);
                    edge.applyPheromonUpdates();
                });
            };
            AntColonyAlgorithm.prototype.run = function (resultCallback, progressCallback) {
                var start = new Date();
                for (var i = 0; i < this._options.waves; i++) {
                    this.sendWave();
                    progressCallback(100 / this._options.waves * i);
                }
                var end = new Date();
                resultCallback({
                    algorithmMethod: 'AntColonyAlgorithm',
                    executionTime: (end.getTime() - start.getTime()) / 1000,
                    route: this.bestRoute,
                    graph: this._graph
                });
            };
            AntColonyAlgorithm.prototype.sendWave = function () {
                for (var i = 0; i < this._options.ants; i++) {
                    var vertices = this._graph.getVertices();
                    var startVertex = vertices[Math.floor(Math.random() * vertices.length)];
                    var ant = new Ant(this._graph);
                    var route = ant.findPath(startVertex);
                    if (this.bestRoute == null || route.getTotalWeight() < this.bestRoute.getTotalWeight()) {
                        this.bestRoute = route;
                    }
                }
                _.forEach(this._graph.getEdges(), function (edge) {
                    edge.applyDecay();
                    edge.applyPheromonUpdates();
                });
            };
            AntColonyAlgorithm.DECAY_RATE = 0.1;
            AntColonyAlgorithm.TIME_FACTOR = 3.0;
            AntColonyAlgorithm.PREVIOUS_DISTANCES = 0.1;
            AntColonyAlgorithm.PHEROMON_FACTOR = 1.0;
            return AntColonyAlgorithm;
        })();
        aoc.AntColonyAlgorithm = AntColonyAlgorithm;
        var Ant = (function () {
            function Ant(graph) {
                this._graph = graph;
            }
            Ant.prototype.findPath = function (startVertex) {
                var path = [];
                var vertices = this._graph.getVertices();
                var currentVertex = startVertex;
                while (path.length < vertices.length) {
                    var probabilities = new Array();
                    for (var i = 0; i < vertices.length; i++) {
                        if (_.indexOf(path, vertices[i]) == -1) {
                            var vertex = vertices[i];
                            var edge = this._graph.getEdge(currentVertex, vertex);
                            var probability = this.calculateProbability(vertex, edge);
                            probabilities[i] = probability;
                        }
                    }
                    currentVertex = this.chooseNextVertexWithProbability(probabilities);
                    path.push(currentVertex);
                }
                var route = new tsp.graph.Route(this._graph, path);
                var totalWeight = route.getTotalWeight();
                var edges = route.getEdges();
                _.forEach(edges, function (edge) {
                    var additionalPheromon = AntColonyAlgorithm.PHEROMON_FACTOR / totalWeight;
                    edge.addPheromonUpdate(additionalPheromon);
                });
                return route;
            };
            Ant.prototype.chooseNextVertexWithProbability = function (probabilities) {
                var vertices = this._graph.getVertices();
                var probabilitySum = probabilities.reduce(function (a, b) { return a + b; });
                var nextTresh = Math.random() * probabilitySum;
                for (var i = 0; i < probabilities.length; i++) {
                    if (probabilities[i] != undefined) {
                        nextTresh -= probabilities[i];
                        if (nextTresh <= 0) {
                            return vertices[i];
                        }
                    }
                }
            };
            Ant.prototype.calculateProbability = function (vertex, edge) {
                if (edge == null) {
                    return 0;
                }
                return Math.pow(edge.pheronom(), AntColonyAlgorithm.PREVIOUS_DISTANCES) * Math.pow(edge.weight, 0.0 - AntColonyAlgorithm.TIME_FACTOR);
            };
            return Ant;
        })();
    })(aoc = tsp.aoc || (tsp.aoc = {}));
})(tsp || (tsp = {}));
///<reference path='../definitions/google.maps.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
///<reference path='../definitions/knockout.d.ts' />
///<reference path="tsp.aoc.ts" />
///<reference path="tsp.visual.graph.ts" />
var tsp;
(function (tsp) {
    var visual;
    (function (visual) {
        var maps;
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
                /** Show the polylines on the map */
                PheronomTrail.prototype.show = function () {
                    var _this = this;
                    _.forEach(this._polylines, function (line) { return line.setMap(_this._map); });
                };
                /** Hide the polylines on the map */
                PheronomTrail.prototype.hide = function () {
                    _.forEach(this._polylines, function (line) { return line.setMap(null); });
                };
                /** Create polylines for all edges. The strokeWeight of the polyline is relative to its pheronom value.
                    @constructor
                    @param graph - The graph for travelling through the edges.
                    @param pheromonAvg - The pheromon average of all edges. Used to define the relative value of the strokeWeight.
                */
                PheronomTrail.prototype.createPolylinesForEdge = function (graph, pheromonAvg) {
                    var _this = this;
                    var edges = graph.getEdges();
                    _.forEach(edges, function (edge) {
                        var relativeWeight = (3 / pheromonAvg) * edge.pheronom();
                        var polyline = new google.maps.Polyline({
                            path: [edge.from.location, edge.to.location],
                            strokeColor: '#0000FF',
                            strokeOpacity: 0.7,
                            strokeWeight: relativeWeight > 1 ? relativeWeight : 1,
                        });
                        _this._polylines.push(polyline);
                    });
                };
                /** Calculate the pheromon average of all edges of a graph
                    @param graph The graph containing the pheromon edges.
                */
                PheronomTrail.prototype.getPheronomAverage = function (graph) {
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
                            path: [from.location, to.location],
                            strokeColor: '#000',
                            strokeOpacity: 0.7,
                            strokeWeight: 1,
                        });
                        _this._lines.push(line);
                    });
                }
                GoogleDistanceCobweb.prototype.show = function () {
                    var _this = this;
                    _.forEach(this._lines, function (p) { return p.setMap(_this._map); });
                };
                GoogleDistanceCobweb.prototype.hide = function () {
                    _.forEach(this._lines, function (p) { return p.setMap(null); });
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
                /** Show the markers */
                GoogleGraph.prototype.show = function () {
                    var _this = this;
                    _.forEach(this._markers, function (marker) { return marker.setMap(_this._map); });
                };
                /** Hide the markers */
                GoogleGraph.prototype.hide = function () {
                    _.forEach(this._markers, function (marker) { return marker.setMap(null); });
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
                    if (route.getVertices().length > 8) {
                        throw 'Route cannot be longer than 8 vertices. This is a restriction by google.';
                    }
                    this._map = map;
                    this._directionsService = new google.maps.DirectionsService();
                    this._directionsRenderer = new google.maps.DirectionsRenderer({ map: this._map });
                    this.getDirections(route).done(function (result) {
                        _this._directionsRenderer.setDirections(result);
                        _this.show();
                    });
                }
                /** Set map on directions renderer to display the directions */
                GoogleDirections.prototype.show = function () {
                    this._directionsRenderer.setMap(this._map);
                };
                /** Set map to null on directions renderer to hide all the directions */
                GoogleDirections.prototype.hide = function () {
                    this._directionsRenderer.setMap(null);
                };
                /** Access the google direction service using the waypoints of the route and return the result as promise
                    @param route The route to get directions for.
                */
                GoogleDirections.prototype.getDirections = function (route) {
                    var deferred = $.Deferred();
                    var vertices = route.getVertices();
                    var start = vertices[0];
                    var end = vertices[vertices.length - 1];
                    var waypoints = vertices.slice(1, vertices.length - 1).map(function (v) { return { location: v.location, stopover: true }; });
                    this._directionsService.route({
                        origin: start.location,
                        destination: end.location,
                        waypoints: waypoints,
                        travelMode: google.maps.TravelMode.DRIVING,
                        avoidHighways: false,
                        avoidTolls: false
                    }, function (result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            deferred.resolve(result);
                        }
                        else {
                            deferred.reject('Could not draw route: ' + status);
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
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                }
                /** Create  a directions object
                    @param route The route to draw. If the route is longer than 8 vertices
                    the route cannot be displayed and will throw an error.
                */
                GoogleMaps.prototype.createDirections = function (route) {
                    return new GoogleDirections(this._map, route);
                };
                /** Create a pheronom trail representation of the route.
                    @param graph - The graph to get the edges from.
                */
                GoogleMaps.prototype.createTrail = function (graph) {
                    return new PheronomTrail(this._map, graph);
                };
                /** Create a visual representation of a route.
                    @param route The route to show.
                */
                GoogleMaps.prototype.createRoute = function (route, color) {
                    return new GoogleRoute(this._map, route, color);
                };
                /** Create a trail object
                
                */
                GoogleMaps.prototype.createGraph = function (graph) {
                    return new GoogleGraph(graph, this._map);
                };
                /** Create a trail object
                
                */
                GoogleMaps.prototype.createDistanceWeb = function (graph) {
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
                            path: [from.location, to.location],
                            strokeColor: color,
                            strokeOpacity: 1,
                            strokeWeight: 7,
                        });
                        line.setMap(_this._map);
                        _this._lines.push(line);
                    });
                }
                /** Show all polylines */
                GoogleRoute.prototype.show = function () {
                    var _this = this;
                    _.forEach(this._lines, function (p) { return p.setMap(_this._map); });
                };
                /** Hide all polylines */
                GoogleRoute.prototype.hide = function () {
                    _.forEach(this._lines, function (p) { return p.setMap(null); });
                };
                return GoogleRoute;
            })();
            maps.GoogleRoute = GoogleRoute;
        })(maps = visual.maps || (visual.maps = {}));
    })(visual = tsp.visual || (tsp.visual = {}));
})(tsp || (tsp = {}));
///<reference path='../definitions/google.maps.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
///<reference path='../definitions/knockout.d.ts' />
///<reference path='../definitions/underscore.d.ts' />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.visual.maps.ts" />
var tsp;
(function (tsp) {
    var visual;
    (function (visual) {
        var graph;
        (function (_graph) {
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
                            _.forEach(_this._vertices, function (vertex) { return graph.addVertex(vertex); });
                            _.forEach(_this._distances, function (distance) { return graph.addEdge(distance.edge); });
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
                            origins: [origin.name],
                            destinations: _.map(destinations, function (d) { return d.name; }),
                            travelMode: google.maps.TravelMode.DRIVING,
                            avoidHighways: false,
                            avoidTolls: false
                        }, function (response, status) {
                            if (status == google.maps.DistanceMatrixStatus.OK) {
                                deferred.resolve(response);
                            }
                            else {
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
                        for (var j = vertices.length - 1; j > i; j--) {
                            destinations.push(vertices[j]);
                        }
                        if (destinations.length > 0) {
                            var call = _this.getDistanceMatrix(origin, destinations, throttling * i).then(function (response) {
                                _.forEach(response.rows[0].elements, function (element, k) {
                                    var from = vertex;
                                    var to = _.filter(_this._vertices, function (v) { return v.name == response.destinationAddresses[k]; })[0];
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
                        _this._geocoder.geocode({ address: name }, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                var address = new GoogleAddressVertex(results[0].formatted_address, results[0].geometry.location);
                                deferred.resolve(address);
                            }
                            else {
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
            _graph.GoogleGraphService = GoogleGraphService;
            var GoogleAddress = (function () {
                function GoogleAddress(name) {
                    this.name = ko.observable(name);
                    this.found = ko.observable(false);
                }
                return GoogleAddress;
            })();
            _graph.GoogleAddress = GoogleAddress;
            var GoogleAddressVertex = (function (_super) {
                __extends(GoogleAddressVertex, _super);
                function GoogleAddressVertex(name, location) {
                    _super.call(this, name);
                    this.location = location;
                }
                return GoogleAddressVertex;
            })(tsp.graph.Vertex);
            _graph.GoogleAddressVertex = GoogleAddressVertex;
        })(graph = visual.graph || (visual.graph = {}));
    })(visual = tsp.visual || (tsp.visual = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var wizard;
        (function (wizard) {
            /** The wizard is responsible for the whole flow of creating a graph, calculating the route and displaying it. */
            var Wizard = (function () {
                function Wizard(steps) {
                    var _this = this;
                    this.currentStep = ko.observable();
                    this._steps = steps;
                    _.forEach(this._steps, function (step, i) {
                        _this[step.key] = step; //Workaround because knockout cannot access indexer we use the name
                    });
                }
                Wizard.prototype.isActive = function (key) {
                    if (key == 'start') {
                        return true;
                    }
                    else if (key == 'graph') {
                        return this['start'].completed();
                    }
                    else if (key == 'algorithm') {
                        return this['graph'].completed();
                    }
                    else if (key == 'result') {
                        return this['algorithm'].completed();
                    }
                };
                Wizard.prototype.isVisible = function (name) {
                    return this.currentStep() == name;
                };
                return Wizard;
            })();
            wizard.Wizard = Wizard;
        })(wizard = ui.wizard || (ui.wizard = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.ui.wizard.ts" />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var start;
        (function (start) {
            var StartStep = (function () {
                function StartStep() {
                    this.key = "start";
                    this.completed = ko.observable(false);
                    this.addresses = new Array();
                }
                StartStep.prototype.userdefinedData = function () {
                    this.addresses = [new tsp.visual.graph.GoogleAddress('')];
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.predefinedDataFew = function () {
                    this.addresses = _.map(StartStep.PREDEFINED_VERTICES.slice(0, 5), function (v) { return new tsp.visual.graph.GoogleAddress(v); });
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.predefinedDataMany = function () {
                    this.addresses = StartStep.PREDEFINED_VERTICES.map(function (v) { return new tsp.visual.graph.GoogleAddress(v); });
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.enter = function () {
                };
                StartStep.PREDEFINED_VERTICES = ['Zuerich', 'Genf', 'Basel', 'Luzern', 'St.Gallen', 'Lausanne', 'Bern', 'Winterthur', 'Lugano', 'Biel', 'Thun', 'Koeniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Freiburg', 'Chur', 'Neuenburg', 'Vernier', 'Uster', 'Sitten'];
                return StartStep;
            })();
            start.StartStep = StartStep;
        })(start = ui.start || (ui.start = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.graph.ts" />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var graph;
        (function (_graph) {
            var GraphStep = (function () {
                function GraphStep() {
                    this.key = "graph";
                    this.addresses = ko.observableArray();
                    this.pending = ko.observable(false);
                    this.completed = ko.observable(false);
                    this._graphService = new tsp.visual.graph.GoogleGraphService();
                }
                GraphStep.prototype.enter = function (addresses) {
                    var _this = this;
                    if (addresses.length > 0) {
                        this.addresses.removeAll();
                        _.forEach(addresses, function (a) { return _this.addresses.push(a); });
                    }
                };
                GraphStep.prototype.addAddress = function () {
                    this.addresses.push(new tsp.visual.graph.GoogleAddress(''));
                };
                GraphStep.prototype.createGraph = function () {
                    var _this = this;
                    this.pending(true);
                    this._graphService.getGraph(this.addresses()).done(function (graph) {
                        _this.graph = graph;
                        _this.pending(false);
                        _this.completed(true);
                        router.navigate('/wizard/algorithm');
                    });
                };
                return GraphStep;
            })();
            _graph.GraphStep = GraphStep;
        })(graph = ui.graph || (ui.graph = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />
var tsp;
(function (tsp) {
    var backtracking;
    (function (backtracking) {
        var BacktrackingAlgorithm = (function () {
            function BacktrackingAlgorithm(graph) {
                this._graph = graph;
            }
            BacktrackingAlgorithm.prototype.run = function (resultCallback, progressCallback) {
                this._progressCallback = progressCallback;
                var start = new Date();
                this.findBestRoute();
                var end = new Date();
                resultCallback({
                    algorithmMethod: 'BacktrackingAlgorithm',
                    executionTime: (end.getTime() - start.getTime()) / 1000,
                    route: this._bestRoute,
                    graph: this._graph
                });
            };
            BacktrackingAlgorithm.prototype.findBestRoute = function () {
                var bestRoute = [];
                var verticesNotInRoute = this._graph.getVertices().slice(0);
                bestRoute.push(verticesNotInRoute.pop());
                this.findBestRouteRecursive(bestRoute, verticesNotInRoute);
                return this._bestRoute;
            };
            BacktrackingAlgorithm.prototype.findBestRouteRecursive = function (path, verticesNotInRoute) {
                if (verticesNotInRoute.length > 0) {
                    for (var i = 0; i < verticesNotInRoute.length; i++) {
                        var pathCopy = path.slice(0);
                        var removedVertex = verticesNotInRoute.shift();
                        pathCopy.push(removedVertex);
                        this.findBestRouteRecursive(pathCopy, verticesNotInRoute);
                        verticesNotInRoute.push(removedVertex);
                    }
                }
                else {
                    var route = new tsp.graph.Route(this._graph, path);
                    if (this.isBestRoute(route)) {
                        this._progressCallback(100 / this._graph.getVertices().length * verticesNotInRoute.length);
                        this._bestRoute = route;
                    }
                }
            };
            BacktrackingAlgorithm.prototype.isBestRoute = function (route) {
                return this._bestRoute == undefined || route.getTotalWeight() < this._bestRoute.getTotalWeight();
            };
            return BacktrackingAlgorithm;
        })();
        backtracking.BacktrackingAlgorithm = BacktrackingAlgorithm;
    })(backtracking = tsp.backtracking || (tsp.backtracking = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
var tsp;
(function (tsp) {
    var mst;
    (function (_mst) {
        var MinimumSpanningTree = (function () {
            function MinimumSpanningTree(graph) {
                this._graph = graph;
            }
            MinimumSpanningTree.prototype.run = function () {
                var vertices = this._graph.getVertices();
                var edges = this._graph.getEdges();
                var mst = [];
                var firstEdge = this.getShortestEdge(edges);
                mst.push(firstEdge);
                var validEdges = this.getValidEdges(edges, mst);
                while (validEdges.length > 0) {
                    var shortestEdge = this.getShortestEdge(validEdges);
                    mst.push(shortestEdge);
                    validEdges = this.getValidEdges(edges, mst);
                }
                return mst;
            };
            MinimumSpanningTree.prototype.getValidEdges = function (edges, mst) {
                var _this = this;
                var validEdges = [];
                _.each(edges, function (edge) {
                    var touchedVertices = _this.getTouchedVertices(mst);
                    if (!_this.edgeTouchesVerticesOneTime(edge, touchedVertices)) {
                        validEdges.push(edge);
                    }
                });
                return validEdges;
            };
            MinimumSpanningTree.prototype.getTouchedVertices = function (edges) {
                var vertices = [];
                _.each(edges, function (edge) {
                    if (_.indexOf(vertices, edge.from) == -1) {
                        vertices.push(edge.from);
                    }
                    if (_.indexOf(vertices, edge.to) == -1) {
                        vertices.push(edge.to);
                    }
                });
                return vertices;
            };
            MinimumSpanningTree.prototype.edgeTouchesVerticesOneTime = function (edge, vertices) {
                return (_.indexOf(vertices, edge.from) != -1 || _.indexOf(vertices, edge.to) == -1) && (_.indexOf(vertices, edge.from) == -1 || _.indexOf(vertices, edge.to) != -1);
            };
            MinimumSpanningTree.prototype.getShortestEdge = function (edges) {
                return _.min(edges, function (edge) { return edge.weight; });
            };
            return MinimumSpanningTree;
        })();
        _mst.MinimumSpanningTree = MinimumSpanningTree;
    })(mst = tsp.mst || (tsp.mst = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />
/// <reference path="tsp.mst.ts" />
var tsp;
(function (tsp) {
    var twoapprox;
    (function (twoapprox) {
        var TwoApproximationAlgorithm = (function () {
            function TwoApproximationAlgorithm(graph) {
                this._graph = graph;
            }
            TwoApproximationAlgorithm.prototype.run = function (resultCallback, progressCallback) {
                this._progressCallback = progressCallback;
                var start = new Date();
                var mst = new tsp.mst.MinimumSpanningTree(this._graph);
                var path = this.preorderWalk(mst.run());
                var route = new tsp.graph.Route(this._graph, path);
                var end = new Date();
                resultCallback({
                    algorithmMethod: 'TwoApproxAlgorithm',
                    executionTime: (end.getTime() - start.getTime()) / 1000,
                    route: route,
                    graph: this._graph
                });
            };
            TwoApproximationAlgorithm.prototype.preorderWalk = function (mst) {
                var vertices = [];
                _.each(mst, function (edge) {
                    if (_.indexOf(vertices, edge.from) == -1) {
                        vertices.push(edge.from);
                    }
                    if (_.indexOf(vertices, edge.to) == -1) {
                        vertices.push(edge.to);
                    }
                });
                return vertices;
            };
            return TwoApproximationAlgorithm;
        })();
        twoapprox.TwoApproximationAlgorithm = TwoApproximationAlgorithm;
    })(twoapprox = tsp.twoapprox || (tsp.twoapprox = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.aoc.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.algorithm.ts" />
/// <reference path="tsp.backtracking.ts" />
/// <reference path="tsp.twoapprox.ts" />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var algorithm;
        (function (algorithm) {
            /** Step in the wizard where the algorithm is choosen and runned. */
            var AlgorithmStep = (function () {
                function AlgorithmStep() {
                    /** Name of the step */
                    this.key = "algorithm";
                    /** Wether the algorithm step has been completed at least once and a result is set */
                    this.completed = ko.observable(false);
                    /** Wether an algorithm is running and calculating. */
                    this.calculating = ko.observable(false);
                    /** Progress of runnin galgorithm in percent */
                    this.progress = ko.observable(0);
                    /** Observable view model of the ant colony algorithm */
                    this.antColonyAlgorithm = ko.observable();
                    /** Observable view model of the backtracking algorithm */
                    this.backtrackingAlgorithm = ko.observable();
                    /** Observable vie model of the two approximation algorithm */
                    this.twoApproxAlgorithm = ko.observable();
                    this.backtrackingEnabled = ko.observable(true);
                }
                /** Create the algorithm models from the graph and assign them.
                    The result callback propages the result with the next observable and sets the step to completed.
                    The progress callback changes the progress observable.
                 */
                AlgorithmStep.prototype.enter = function (graph) {
                    var _this = this;
                    if (graph.getVertices().length > 10) {
                        this.backtrackingEnabled(false);
                    }
                    this.backtrackingAlgorithm(new BacktrackingAlgorithmViewModel(graph, function (result) { return _this.onResult(result); }, function (progress) { return _this.onProgress(progress); }));
                    this.antColonyAlgorithm(new AntColonyAlgorithmViewModel(graph, function (result) { return _this.onResult(result); }, function (progress) { return _this.onProgress(progress); }));
                    this.twoApproxAlgorithm(new TwoApproxAlgorithmViewModel(graph, function (result) { return _this.onResult(result); }, function (progress) { return _this.onProgress(progress); }));
                };
                AlgorithmStep.prototype.onResult = function (result) {
                    this.calculating(false);
                    this.completed(true);
                    if (result != null) {
                        this.algorithmResult = result;
                    }
                    router.navigate('/wizard/result');
                };
                AlgorithmStep.prototype.onProgress = function (progress) {
                    if (this.calculating() == false) {
                        this.calculating(true);
                    }
                    this.progress(progress);
                };
                return AlgorithmStep;
            })();
            algorithm.AlgorithmStep = AlgorithmStep;
            /** Base view model for an algorithm */
            var AlgorithmViewModel = (function () {
                function AlgorithmViewModel(graph) {
                    this.graph = graph;
                }
                return AlgorithmViewModel;
            })();
            algorithm.AlgorithmViewModel = AlgorithmViewModel;
            /** View model for the two approximation algorithm */
            var TwoApproxAlgorithmViewModel = (function (_super) {
                __extends(TwoApproxAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function TwoApproxAlgorithmViewModel(graph, resultCallback, progressCallback) {
                    _super.call(this, graph);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                /** Create the algorithm and run it with the callbacks of the constructor. */
                TwoApproxAlgorithmViewModel.prototype.run = function () {
                    this.algorithm = new tsp.twoapprox.TwoApproximationAlgorithm(this.graph);
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return TwoApproxAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.TwoApproxAlgorithmViewModel = TwoApproxAlgorithmViewModel;
            /** View model for the backtracking algorithm */
            var BacktrackingAlgorithmViewModel = (function (_super) {
                __extends(BacktrackingAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function BacktrackingAlgorithmViewModel(graph, resultCallback, progressCallback) {
                    _super.call(this, graph);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                /** Create the algorithm and run it with the callbacks of the constructor. */
                BacktrackingAlgorithmViewModel.prototype.run = function () {
                    this.algorithm = new tsp.backtracking.BacktrackingAlgorithm(this.graph);
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return BacktrackingAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.BacktrackingAlgorithmViewModel = BacktrackingAlgorithmViewModel;
            /** The view model for the ant colony algorithm */
            var AntColonyAlgorithmViewModel = (function (_super) {
                __extends(AntColonyAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function AntColonyAlgorithmViewModel(graph, resultCallback, progressCallback) {
                    _super.call(this, graph);
                    this.antCount = ko.observable(200);
                    this.waveCount = ko.observable(40);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                /** Create the algoorithm and run it with the callbacks of the constructor. */
                AntColonyAlgorithmViewModel.prototype.run = function () {
                    this.algorithm = new tsp.aoc.AntColonyAlgorithm(this.graph, {
                        ants: this.antCount(),
                        waves: this.waveCount()
                    });
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return AntColonyAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.AntColonyAlgorithmViewModel = AntColonyAlgorithmViewModel;
        })(algorithm = ui.algorithm || (ui.algorithm = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.visual.maps.ts" />
/// <reference path="tsp.ui.wizard.ts" />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var result;
        (function (_result) {
            var ResultStep = (function () {
                function ResultStep() {
                    var _this = this;
                    this.completed = ko.observable(false);
                    this.key = "result";
                    this.algorithmResult = ko.observable();
                    this.showDistances = ko.observable(true);
                    this.showVertices = ko.observable(true);
                    this.showDistances.subscribe(function (show) {
                        if (show) {
                            _this._googleDistances.show();
                        }
                        else {
                            _this._googleDistances.hide();
                        }
                    });
                    this.showVertices.subscribe(function (show) {
                        if (show) {
                            _this._googleGraph.show();
                        }
                        else {
                            _this._googleGraph.hide();
                        }
                    });
                }
                ResultStep.prototype.enter = function (args) {
                    var _this = this;
                    this._graph = args.graph;
                    setTimeout(function () {
                        if (!_this._maps) {
                            var mapCanvas = document.getElementById('tsp-map-canvas');
                            $(mapCanvas).css('height', '600px');
                            _this._maps = new tsp.visual.maps.GoogleMaps(mapCanvas);
                        }
                        if (!_this._googleGraph) {
                            _this._googleGraph = _this._maps.createGraph(_this._graph);
                            _this._googleGraph.show();
                        }
                        if (!_this._googleDistances) {
                            _this._googleDistances = _this._maps.createDistanceWeb(_this._graph);
                            _this._googleDistances.show();
                        }
                        var pheronomTrail = args.algorithmMethod == 'AntColonyAlgorithm' ? _this._maps.createTrail(args.graph) : null;
                        var googleRoute = _this._maps.createRoute(args.route, ResultStep.RESULT_COLORS[0]);
                        var result = new ResultViewModel(args.executionTime, args.route, googleRoute, pheronomTrail);
                        if (_this.algorithmResult() != undefined) {
                            _this.algorithmResult().dispose();
                        }
                        _this.algorithmResult(result);
                        _this.completed(true);
                    }, 1000);
                };
                ResultStep.prototype.recalculate = function () {
                    this.dispose();
                    router.navigate('/wizard/algorithm');
                };
                ResultStep.RESULT_COLORS = ['#FF3366', '#33FF66', '#FFCC33', '#33FFCC', '#FF33CC'];
                return ResultStep;
            })();
            _result.ResultStep = ResultStep;
            var ResultViewModel = (function () {
                function ResultViewModel(executionTime, route, visualRoute, pheronomTrail) {
                    var _this = this;
                    this.pheromonTrailEnabled = ko.observable(false);
                    this.showRoute = ko.observable(true);
                    this.showDrivingRoute = ko.observable(false);
                    this.showPheronomTrail = ko.observable(false);
                    this.totalWeight = ko.observable(route.getTotalWeight() / 1000);
                    this.executionTime = ko.observable(executionTime);
                    this._route = route;
                    this._visualRoute = visualRoute;
                    this.graphColor = ko.observable(this._visualRoute.color);
                    this._pheronomTrail = pheronomTrail;
                    this.pheromonTrailEnabled = ko.observable(this._pheronomTrail != null);
                    this.showDrivingRoute.subscribe(function (show) {
                    });
                    this.showPheronomTrail.subscribe(function (show) {
                        if (_this._pheronomTrail != null) {
                            if (show) {
                                _this._pheronomTrail.show();
                            }
                            else {
                                _this._pheronomTrail.hide();
                            }
                        }
                    });
                    this.showRoute.subscribe(function (show) {
                        if (show) {
                            _this._visualRoute.show();
                        }
                        else {
                            _this._visualRoute.hide();
                        }
                    });
                }
                ResultViewModel.prototype.dispose = function () {
                    this.showRoute(false);
                    this.showDrivingRoute(false);
                    this.showPheronomTrail(false);
                };
                return ResultViewModel;
            })();
            _result.ResultViewModel = ResultViewModel;
        })(result = ui.result || (ui.result = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
///<reference path='../definitions/knockout.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
var tsp;
(function (tsp) {
    var ui;
    (function (ui) {
        var bindings;
        (function (bindings) {
            var fadeVisibleBinding = (function () {
                function fadeVisibleBinding() {
                }
                fadeVisibleBinding.apply = function () {
                    ko.bindingHandlers['fadeVisible'] = {
                        init: function (element, valueAccessor) {
                            // Initially set the element to be instantly visible/hidden depending on the value
                            var value = valueAccessor();
                            $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
                        },
                        update: function (element, valueAccessor) {
                            // Whenever the value subsequently changes, slowly fade the element in or out
                            var value = valueAccessor();
                            ko.utils.unwrapObservable(value) ? $(element).delay(400).fadeIn() : $(element).fadeOut();
                        }
                    };
                };
                return fadeVisibleBinding;
            })();
            bindings.fadeVisibleBinding = fadeVisibleBinding;
        })(bindings = ui.bindings || (ui.bindings = {}));
    })(ui = tsp.ui || (tsp.ui = {}));
})(tsp || (tsp = {}));
///<reference path='../definitions/jquery.d.ts' />
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/simrou.d.ts" />
/// <reference path="../definitions/lawnchair.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.ui.start.ts" />
/// <reference path="tsp.ui.graph.ts" />
/// <reference path="tsp.ui.algorithm.ts" />
/// <reference path="tsp.ui.result.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.ui.bindings.ts" />
/// <reference path="tsp.graph.ts" />
var tsp;
(function (tsp) {
    var App = (function () {
        function App() {
        }
        App.prototype.start = function () {
            tsp.ui.bindings.fadeVisibleBinding.apply();
            var step1 = new tsp.ui.start.StartStep();
            var step2 = new tsp.ui.graph.GraphStep();
            var step3 = new tsp.ui.algorithm.AlgorithmStep();
            var step4 = new tsp.ui.result.ResultStep();
            var wiz = new tsp.ui.wizard.Wizard([step1, step2, step3, step4]);
            router = new Simrou();
            var indexRoute = router.addRoute('/');
            indexRoute.get(function (event, params) {
                router.navigate('/wizard/start');
            });
            var wizardRoute = router.addRoute('/wizard/:step');
            wizardRoute.get(function (event, params) {
                if (params.step == 'start') {
                    wiz.currentStep('start');
                }
                else if (params.step == 'graph') {
                    var addresses = wiz['start'].addresses;
                    if (addresses) {
                        wiz['graph'].enter(addresses);
                        wiz.currentStep('graph');
                    }
                    else {
                        router.navigate('/wizard/start');
                    }
                }
                else if (params.step == 'algorithm') {
                    var graph = wiz['graph'].graph;
                    if (graph) {
                        wiz['algorithm'].enter(graph);
                        wiz.currentStep('algorithm');
                    }
                    else {
                        router.navigate('/wizard/start');
                    }
                }
                else if (params.step == 'result') {
                    var algorithmResult = wiz['algorithm'].algorithmResult;
                    if (algorithmResult) {
                        wiz['result'].enter(algorithmResult);
                        wiz.currentStep('result');
                    }
                    else {
                        router.navigate('/wizard/start');
                    }
                }
            });
            router.start('#/');
            ko.applyBindings(wiz);
        };
        return App;
    })();
    tsp.App = App;
})(tsp || (tsp = {}));
