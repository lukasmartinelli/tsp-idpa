/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />

module tsp.backtracking {

    export class BacktrackingAlgorithm implements tsp.algorithm.Algorithm {
        private _graph: tsp.graph.UndirectedGraph;
        private _bestRoute: tsp.graph.Route;
        private _progressCallback: (progress: number) => void;
        constructor(graph: tsp.graph.UndirectedGraph) {
            this._graph = graph;
        }


        run(resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
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
        }

        findBestRoute(): tsp.graph.Route {
            var bestRoute = [];
            var verticesNotInRoute = this._graph.getVertices().slice(0);
            bestRoute.push(verticesNotInRoute.pop());
            this.findBestRouteRecursive(bestRoute, verticesNotInRoute);
            return this._bestRoute;
        }

        private findBestRouteRecursive(path: tsp.graph.Vertex[], verticesNotInRoute: tsp.graph.Vertex[]) {
            if (verticesNotInRoute.length > 0) {
                for (var i = 0; i < verticesNotInRoute.length; i++) {
                    var pathCopy = path.slice(0);
                    var removedVertex = verticesNotInRoute.shift();
                    pathCopy.push(removedVertex);
                    this.findBestRouteRecursive(pathCopy, verticesNotInRoute);
                    verticesNotInRoute.push(removedVertex);
                }
            } else {
                var route = new tsp.graph.Route(this._graph, path);
                if (this.isBestRoute(route)) {
                    this._progressCallback(100 / this._graph.getVertices().length * verticesNotInRoute.length);
                    this._bestRoute = route;
                }
            }
        }

        private isBestRoute(route: tsp.graph.Route): boolean {
            return this._bestRoute == undefined || route.getTotalWeight() < this._bestRoute.getTotalWeight();
        }
    }

}
