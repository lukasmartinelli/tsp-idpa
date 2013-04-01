var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsp;
(function (tsp) {
    /// <reference path="../definitions/knockout.d.ts" />
    /// <reference path="../definitions/underscore.d.ts" />
    /// <reference path="tsp.graph.ts" />
    /// <reference path="tsp.algorithm.ts" />
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
                for(var i = 0; i < this._pheromonUpdates.length; i++) {
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
            AntColonyAlgorithm.DECAY_RATE = 0.1;
            AntColonyAlgorithm.TIME_FACTOR = 3.0;
            AntColonyAlgorithm.PREVIOUS_DISTANCES = 0.1;
            AntColonyAlgorithm.PHEROMON_FACTOR = 1.0;
            AntColonyAlgorithm.prototype.initPheromones = function () {
                var edges = this._graph.getEdges();
                var totalWeight = _.reduce(edges, function (memo, edge) {
                    return memo + edge.weight;
                }, 0);
                var initVal = AntColonyAlgorithm.PHEROMON_FACTOR / (totalWeight / edges.length);
                _.forEach(this._graph.getEdges(), function (edge) {
                    edge.addPheromonUpdate(initVal);
                    edge.applyPheromonUpdates();
                });
            };
            AntColonyAlgorithm.prototype.run = function (resultCallback, progressCallback) {
                var start = new Date();
                for(var i = 0; i < this._options.waves; i++) {
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
                for(var i = 0; i < this._options.ants; i++) {
                    var vertices = this._graph.getVertices();
                    var startVertex = vertices[Math.floor(Math.random() * vertices.length)];
                    var ant = new Ant(this._graph);
                    var route = ant.findPath(startVertex);
                    if(this.bestRoute == null || route.getTotalWeight() < this.bestRoute.getTotalWeight()) {
                        this.bestRoute = route;
                    }
                }
                _.forEach(this._graph.getEdges(), function (edge) {
                    edge.applyDecay();
                    edge.applyPheromonUpdates();
                });
            };
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
                while(path.length < vertices.length) {
                    var probabilities = new Array();
                    for(var i = 0; i < vertices.length; i++) {
                        if(_.indexOf(path, vertices[i]) == -1) {
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
                var probabilitySum = probabilities.reduce(function (a, b) {
                    return a + b;
                });
                var nextTresh = Math.random() * probabilitySum;
                for(var i = 0; i < probabilities.length; i++) {
                    if(probabilities[i] != undefined) {
                        nextTresh -= probabilities[i];
                        if(nextTresh <= 0) {
                            return vertices[i];
                        }
                    }
                }
            };
            Ant.prototype.calculateProbability = function (vertex, edge) {
                if(edge == null) {
                    return 0;
                }
                return Math.pow(edge.pheronom(), AntColonyAlgorithm.PREVIOUS_DISTANCES) * Math.pow(edge.weight, 0.0 - AntColonyAlgorithm.TIME_FACTOR);
            };
            return Ant;
        })();        
    })(tsp.aoc || (tsp.aoc = {}));
    var aoc = tsp.aoc;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.aoc.js.map
