/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.algorithm.ts" />
module tsp.aoc {
    export class PheromonEdge extends tsp.graph.Edge {
        private _pheromon = 0;
        private _pheromonUpdates = new Array<number>();

        pheronom(): number {
            return this._pheromon;
        }

        addPheromonUpdate(value: number) {
            this._pheromonUpdates.push(value);
        }

        applyDecay() {
            this._pheromon = (this._pheromon * (1.0 - AntColonyAlgorithm.DECAY_RATE));
        }

        applyPheromonUpdates() {
            for (var i = 0; i < this._pheromonUpdates.length; i++) {
                this._pheromon += this._pheromonUpdates[i];
            }
            this._pheromonUpdates = [];
        }
    }

    export interface AntColonyAlgorithmOptions {
        ants: number;
        waves: number;
    }

    export class AntColonyAlgorithm implements tsp.algorithm.Algorithm {
        static DECAY_RATE = 0.1;
        static TIME_FACTOR = 3.0;
        static PREVIOUS_DISTANCES = 0.1;
        static PHEROMON_FACTOR = 1.0;
        private _options: AntColonyAlgorithmOptions;
        private _graph: tsp.graph.UndirectedGraph;
        bestRoute: tsp.graph.Route;
        constructor(graph: tsp.graph.UndirectedGraph, options: AntColonyAlgorithmOptions) {
            this._graph = graph;
            this._options = options;
            this.initPheromones();
        }

        private initPheromones() {
            var edges = this._graph.getEdges();
            var totalWeight = _.reduce(edges, (memo: number, edge: tsp.graph.Edge) => memo + edge.weight, 0);
            var initVal = AntColonyAlgorithm.PHEROMON_FACTOR / (totalWeight / edges.length);
            _.forEach(this._graph.getEdges(), (edge: PheromonEdge) => {
                edge.addPheromonUpdate(initVal);
                edge.applyPheromonUpdates();
            });
        }

        run(resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
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
        }

        sendWave() {
            for (var i = 0; i < this._options.ants; i++) {
                var vertices = this._graph.getVertices();
                var startVertex = vertices[Math.floor(Math.random() * vertices.length)];
                var ant = new Ant(this._graph);
                var route = ant.findPath(startVertex);
                if (this.bestRoute == null || route.getTotalWeight() < this.bestRoute.getTotalWeight()) {
                    this.bestRoute = route;
                }
            }

            _.forEach(this._graph.getEdges(), (edge: PheromonEdge) => {
                edge.applyDecay();
                edge.applyPheromonUpdates();
            });
        }
    }

    class Ant {
        private _graph: tsp.graph.UndirectedGraph;

        constructor(graph: tsp.graph.UndirectedGraph) {
            this._graph = graph;
        }

        findPath(startVertex: tsp.graph.Vertex): tsp.graph.Route {
            var path: tsp.graph.Vertex[] = [];
            var vertices = this._graph.getVertices();
            var currentVertex = startVertex;

            while (path.length < vertices.length) {
            var probabilities = new Array<number>();
                for (var i = 0; i < vertices.length; i++) {
                    if (_.indexOf(path, vertices[i]) == -1) {
                        var vertex = vertices[i];
                        var edge = this._graph.getEdge(currentVertex, vertex);
                        var probability = this.calculateProbability(vertex, <PheromonEdge>edge);
                        probabilities[i] = probability;
                    }
                }
                currentVertex = this.chooseNextVertexWithProbability(probabilities);
                path.push(currentVertex);
            }

            var route = new tsp.graph.Route(this._graph, path);
            var totalWeight = route.getTotalWeight();

            var edges = route.getEdges();
            _.forEach(edges, (edge: PheromonEdge) => {
                var additionalPheromon = AntColonyAlgorithm.PHEROMON_FACTOR / totalWeight;
                edge.addPheromonUpdate(additionalPheromon);
            });

            return route;
        }

        private chooseNextVertexWithProbability(probabilities: number[]): tsp.graph.Vertex {
            var vertices = this._graph.getVertices();
            var probabilitySum = probabilities.reduce((a, b) => a + b);
            var nextTresh = Math.random() * probabilitySum;

            for (var i = 0; i < probabilities.length; i++) {
                if (probabilities[i] != undefined) {
                    nextTresh -= probabilities[i];
                    if (nextTresh <= 0) {
                        return vertices[i];
                    }
                }
            }
        }

        private calculateProbability(vertex: tsp.graph.Vertex, edge: PheromonEdge): number {
            if (edge == null) {
                return 0;
            }
            return Math.pow(edge.pheronom(), AntColonyAlgorithm.PREVIOUS_DISTANCES) * Math.pow(edge.weight, 0.0 - AntColonyAlgorithm.TIME_FACTOR);
        }
    }
}
