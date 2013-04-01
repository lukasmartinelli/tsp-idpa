///<reference path='../definitions/knockout.d.ts' />
/// <reference path="tsp.graph.ts" />
module tsp.algorithm {
    export interface Algorithm {
        run(resultCallback: (result: AlgorithmResult) => void , progressCallback: (progress: number) => void );
    }

    /** Result of an algorithm */
    export interface AlgorithmResult {
        algorithmMethod: string;
        executionTime: number;
        route: tsp.graph.Route;
        graph: tsp.graph.UndirectedGraph;
    }
}