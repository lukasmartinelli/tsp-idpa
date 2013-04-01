var tsp;
(function (tsp) {
    /// <reference path="../definitions/underscore.d.ts" />
    (function (graph) {
        /** The graph object used to perform calculations. This graph implementations supports only undirected edges. */
        var UndirectedGraph = (function () {
            /** Create a new graph and initialize the matrix with for the given vertexCount
            @param vertexCount The amount of vertices used to initialize the internal matrix
            */
            function UndirectedGraph(vertexCount) {
                this._vertices = [];
                this._matrix = new Array();
                for(var i = 0; i < vertexCount; i++) {
                    this._matrix[i] = new Array();
                }
            }
            UndirectedGraph.prototype.addVertex = /** Add a vertex to the graph. Returns the internal index of the added vertex.
            @param vertex Vertex to add.
            */
            function (vertex) {
                this._vertices.push(vertex);
                return _.indexOf(this._vertices, vertex);
            };
            UndirectedGraph.prototype.addEdge = /** Add an edge to the graph. The edges are stored internally in a multidimensional array
            to decrease lookup time.
            @param The edge to add. Must have its start and end vertex already defined.
            */
            function (edge) {
                var fromIndex = _.indexOf(this._vertices, edge.from);
                var toIndex = _.indexOf(this._vertices, edge.to);
                this._matrix[fromIndex][toIndex] = edge;
                this._matrix[toIndex][fromIndex] = edge;
            };
            UndirectedGraph.prototype.getEdge = /** Get an edge from the graph that is connected with the given vertices.
            It will lookup the indexes for the vertices and use them to access the edges in the multidimensional array.
            This should be pretty fast and is even faster if you use the index access method directly.
            @param from The start vertex the edge must be connected to
            @param to The end vertex the edge must be connected to
            */
            function (from, to) {
                return this.getEdgeByIndex(_.indexOf(this._vertices, from), _.indexOf(this._vertices, to));
            };
            UndirectedGraph.prototype.getEdgeByIndex = /** Get an edge from the graph that is connected with the vertices at the given indexes.
            It will lookup the edges with the given indexes. This is the most performant access method
            @param fromIndex Index for the from vertex.
            @param toIndex Index for the to vertex.
            */
            function (fromIndex, toIndex) {
                return this._matrix[fromIndex][toIndex];
            };
            UndirectedGraph.prototype.getVertices = /** Get all vertices in this grpah */
            function () {
                return this._vertices;
            };
            UndirectedGraph.prototype.getEdges = /** Get all edges from the internal matrix. */
            function () {
                var edges = [];
                for(var i = 0; i < this._matrix.length; i++) {
                    for(var j = this._matrix[i].length - 1; j > i; j--) {
                        edges.push(this._matrix[i][j]);
                    }
                }
                return edges;
            };
            UndirectedGraph.getEdgeCount = /** Calculate the count of the edges depending on the vertices with an algorithm
            @param verticeCount Amount of vertices in the graph used for calculation.
            */
            function getEdgeCount(verticeCount) {
                return (verticeCount) * (verticeCount - 1);
            };
            return UndirectedGraph;
        })();
        graph.UndirectedGraph = UndirectedGraph;        
        /** A named vertex. You should extend the vertex in order to add custom properties. By default it does have a name. */
        var Vertex = (function () {
            function Vertex(name) {
                this.name = name;
            }
            return Vertex;
        })();
        graph.Vertex = Vertex;        
        /** A weighted edge. You can extend that to if you want to store additional information */
        var Edge = (function () {
            function Edge(from, to, weight) {
                if (typeof weight === "undefined") { weight = -1; }
                this.from = from;
                this.to = to;
                this.weight = weight;
            }
            return Edge;
        })();
        graph.Edge = Edge;        
        /** The route has a path of vertices in a specific order.
        In the tsp the route needs to touch all vertices and go back to the start point at the lowest cost.
        */
        var Route = (function () {
            /** Create a route by the given path */
            function Route(graph, path) {
                this.graph = graph;
                this._path = path;
            }
            Route.prototype.getVertices = /** Get the vertices of the path */
            function () {
                return this._path;
            };
            Route.prototype.getEdges = /** Get the edges used in the path */
            function () {
                var edges = [];
                for(var i = 0; i < this._path.length; i++) {
                    var from = this._path[i == 0 ? this._path.length - 1 : i - 1];
                    var to = this._path[i];
                    edges.push(this.graph.getEdge(from, to));
                }
                return edges;
            };
            Route.prototype.getTotalWeight = /** Get the total weight of the route */
            function () {
                return _.reduce(this.getEdges(), function (memo, edge) {
                    return memo + edge.weight;
                }, 0);
            };
            return Route;
        })();
        graph.Route = Route;        
    })(tsp.graph || (tsp.graph = {}));
    var graph = tsp.graph;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.graph.js.map
