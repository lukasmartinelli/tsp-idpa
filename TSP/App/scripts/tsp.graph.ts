/// <reference path="../definitions/underscore.d.ts" />
module tsp.graph {
    /** The graph object used to perform calculations. This graph implementations supports only undirected edges. */
    export class UndirectedGraph {
        private _vertices: Vertex[] = [];
        private _matrix: Edge[][];

        /** Create a new graph and initialize the matrix with for the given vertexCount
            @param vertexCount The amount of vertices used to initialize the internal matrix 
        */
        constructor(vertexCount) {
            this._matrix = new Array();
            for (var i = 0; i < vertexCount; i++) {
                this._matrix[i] = new Array();
            }
        }

        /** Add a vertex to the graph. Returns the internal index of the added vertex.
            @param vertex Vertex to add. 
        */
        addVertex(vertex: Vertex): number {
            this._vertices.push(vertex);
            return _.indexOf(this._vertices, vertex);
        }

        /** Add an edge to the graph. The edges are stored internally in a multidimensional array
            to decrease lookup time. 
            @param The edge to add. Must have its start and end vertex already defined. 
        */
        addEdge(edge: Edge) {
            var fromIndex =_.indexOf(this._vertices, edge.from);
            var toIndex =_.indexOf(this._vertices, edge.to);
            this._matrix[fromIndex][toIndex] = edge;
            this._matrix[toIndex][fromIndex] = edge;
        }

        /** Get an edge from the graph that is connected with the given vertices.
            It will lookup the indexes for the vertices and use them to access the edges in the multidimensional array.
            This should be pretty fast and is even faster if you use the index access method directly.
            @param from The start vertex the edge must be connected to
            @param to The end vertex the edge must be connected to 
        */
        getEdge(from: Vertex, to: Vertex) {
            return this.getEdgeByIndex(_.indexOf(this._vertices, from),_.indexOf(this._vertices, to));
        }

        /** Get an edge from the graph that is connected with the vertices at the given indexes.
            It will lookup the edges with the given indexes. This is the most performant access method
            @param fromIndex Index for the from vertex.
            @param toIndex Index for the to vertex.
        */
        getEdgeByIndex(fromIndex: number, toIndex: number): Edge {
            return this._matrix[fromIndex][toIndex];
        }

        /** Get all vertices in this grpah */
        getVertices(): Vertex[] {
            return this._vertices;
        }

        /** Get all edges from the internal matrix. */
        getEdges(): Edge[] {
            var edges: Edge[] = [];
            for (var i = 0; i < this._matrix.length; i++) {
                for (var j = this._matrix[i].length - 1; j > i; j--) {
                    edges.push(this._matrix[i][j]);
                }
            }
            return edges;
        }

        /** Calculate the count of the edges depending on the vertices with an algorithm 
            @param verticeCount Amount of vertices in the graph used for calculation.
        */
        static getEdgeCount(verticeCount: number): number {
            return (verticeCount) * (verticeCount - 1);
        }
    }

    /** A named vertex. You should extend the vertex in order to add custom properties. By default it does have a name. */
    export class Vertex {
        name: string;
        constructor(name: string) {
            this.name = name;
        }
    }

    /** A weighted edge. You can extend that to if you want to store additional information */
    export class Edge {
        /** Weight of the vertex */
        weight: number;
        /** The vertex the edge starts */
        from: Vertex;
        /** The vertex the edge leads to */
        to: Vertex;
        constructor(from: Vertex, to: Vertex, weight = -1) {
            this.from = from;
            this.to = to;
            this.weight = weight;
        }
    }

    /** The route has a path of vertices in a specific order. 
        In the tsp the route needs to touch all vertices and go back to the start point at the lowest cost.
    */
    export class Route {
        /** Internal graph used to calculate the weight */
        graph: UndirectedGraph;
        private _path: Vertex[];

        /** Create a route by the given path */
        constructor(graph: UndirectedGraph, path: Vertex[]) {
            this.graph = graph;
            this._path = path;
        }

        /** Get the vertices of the path */
        getVertices(): Vertex[] {
            return this._path;
        }

        /** Get the edges used in the path */
        getEdges(): Edge[] {
            var edges = [];
            for (var i = 0; i < this._path.length; i++) {
                var from = this._path[i == 0 ? this._path.length - 1 : i - 1];
                var to = this._path[i];
                edges.push(this.graph.getEdge(from, to));
            }
            return edges;
        }

        /** Get the total weight of the route */
        getTotalWeight(): number {
            return _.reduce(this.getEdges(), (memo, edge: Edge) => memo + edge.weight, 0);
        }

    }
}