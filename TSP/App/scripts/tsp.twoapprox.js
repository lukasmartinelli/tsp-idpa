var tsp;
(function (tsp) {
    /// <reference path="../definitions/knockout.d.ts" />
    /// <reference path="../definitions/underscore.d.ts" />
    /// <reference path="tsp.graph.ts" />
    /// <reference path="tsp.algorithm.ts" />
    /// <reference path="tsp.mst.ts" />
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
                    if(_.indexOf(vertices, edge.from) == -1) {
                        vertices.push(edge.from);
                    }
                    if(_.indexOf(vertices, edge.to) == -1) {
                        vertices.push(edge.to);
                    }
                });
                return vertices;
            };
            return TwoApproximationAlgorithm;
        })();
        twoapprox.TwoApproximationAlgorithm = TwoApproximationAlgorithm;        
    })(tsp.twoapprox || (tsp.twoapprox = {}));
    var twoapprox = tsp.twoapprox;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.twoapprox.js.map
