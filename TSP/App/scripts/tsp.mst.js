var tsp;
(function (tsp) {
    /// <reference path="../definitions/underscore.d.ts" />
    /// <reference path="tsp.graph.ts" />
    (function (mst) {
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
                while(validEdges.length > 0) {
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
                    if(!_this.edgeTouchesVerticesOneTime(edge, touchedVertices)) {
                        validEdges.push(edge);
                    }
                });
                return validEdges;
            };
            MinimumSpanningTree.prototype.getTouchedVertices = function (edges) {
                var vertices = [];
                _.each(edges, function (edge) {
                    if(_.indexOf(vertices, edge.from) == -1) {
                        vertices.push(edge.from);
                    }
                    if(_.indexOf(vertices, edge.to) == -1) {
                        vertices.push(edge.to);
                    }
                });
                return vertices;
            };
            MinimumSpanningTree.prototype.edgeTouchesVerticesOneTime = function (edge, vertices) {
                return (_.indexOf(vertices, edge.from) != -1 || _.indexOf(vertices, edge.to) == -1) && (_.indexOf(vertices, edge.from) == -1 || _.indexOf(vertices, edge.to) != -1);
            };
            MinimumSpanningTree.prototype.getShortestEdge = function (edges) {
                return _.min(edges, function (edge) {
                    return edge.weight;
                });
            };
            return MinimumSpanningTree;
        })();
        mst.MinimumSpanningTree = MinimumSpanningTree;        
    })(tsp.mst || (tsp.mst = {}));
    var mst = tsp.mst;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.mst.js.map
