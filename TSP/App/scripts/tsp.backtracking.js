var tsp;
(function (tsp) {
    /// <reference path="../definitions/knockout.d.ts" />
    /// <reference path="../definitions/underscore.d.ts" />
    /// <reference path="tsp.graph.ts" />
    /// <reference path="tsp.algorithm.ts" />
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
                if(verticesNotInRoute.length > 0) {
                    for(var i = 0; i < verticesNotInRoute.length; i++) {
                        var pathCopy = path.slice(0);
                        var removedVertex = verticesNotInRoute.shift();
                        pathCopy.push(removedVertex);
                        this.findBestRouteRecursive(pathCopy, verticesNotInRoute);
                        verticesNotInRoute.push(removedVertex);
                    }
                } else {
                    var route = new tsp.graph.Route(this._graph, path);
                    if(this.isBestRoute(route)) {
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
    })(tsp.backtracking || (tsp.backtracking = {}));
    var backtracking = tsp.backtracking;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.backtracking.js.map
