/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />
/// <reference path="tsp.mst.ts" />

module tsp.twoapprox {

    export class TwoApproximationAlgorithm implements tsp.algorithm.Algorithm {
        private _graph: tsp.graph.UndirectedGraph;
        private _bestRoute: tsp.graph.Route;
        private _progressCallback: (progress: number) => void;
        constructor(graph: tsp.graph.UndirectedGraph) {
            this._graph = graph;
        }

        run(resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
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
        }

        private preorderWalk(mst : tsp.graph.Edge[]): tsp.graph.Vertex[] {
            var vertices: tsp.graph.Vertex[] = [];

            _.each(mst, (edge: tsp.graph.Edge) => {
                if (_.indexOf(vertices, edge.from) == -1) {
                    vertices.push(edge.from);
                }
                if (_.indexOf(vertices, edge.to) == -1) {
                    vertices.push(edge.to);
                }
            });

            return vertices;
        }
    }

}