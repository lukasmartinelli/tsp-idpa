/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />

module tsp.mst {
    export class MinimumSpanningTree {
        private _graph: tsp.graph.UndirectedGraph;
        constructor(graph: tsp.graph.UndirectedGraph) {
            this._graph = graph;
        }

        run(): tsp.graph.Edge[] {
            var vertices = this._graph.getVertices();
            var edges = this._graph.getEdges();
            var mst: tsp.graph.Edge[] = [];

            var firstEdge = this.getShortestEdge(edges);
            mst.push(firstEdge);

            var validEdges = this.getValidEdges(edges, mst);
            while (validEdges.length > 0) {
                var shortestEdge = this.getShortestEdge(validEdges);
                mst.push(shortestEdge);
                validEdges = this.getValidEdges(edges, mst);
            }
            return mst;
        }

        private getValidEdges(edges: tsp.graph.Edge[], mst: tsp.graph.Edge[]): tsp.graph.Edge[] {
            var validEdges: tsp.graph.Edge[] = [];
            _.each(edges, (edge: tsp.graph.Edge) => {
                var touchedVertices = this.getTouchedVertices(mst);
                if (!this.edgeTouchesVerticesOneTime(edge, touchedVertices)) {
                    validEdges.push(edge);
                }
            });
            return validEdges;
        }

        private getTouchedVertices(edges: tsp.graph.Edge[]): tsp.graph.Vertex[] {
            var vertices: tsp.graph.Vertex[] = [];

            _.each(edges, (edge: tsp.graph.Edge) => {
                if (_.indexOf(vertices, edge.from) == -1) {
                    vertices.push(edge.from);
                }

                if (_.indexOf(vertices, edge.to) == -1) {
                    vertices.push(edge.to);
                }
            });

            return vertices;
        }

        private edgeTouchesVerticesOneTime(edge: tsp.graph.Edge, vertices: tsp.graph.Vertex[]): boolean {
            return (_.indexOf(vertices, edge.from) != -1 || _.indexOf(vertices, edge.to) == -1) && (_.indexOf(vertices, edge.from) == -1 || _.indexOf(vertices, edge.to) != -1);
        }

        private getShortestEdge(edges: tsp.graph.Edge[]): tsp.graph.Edge {
            return _.min(edges, edge => edge.weight);
        }
    }

}
