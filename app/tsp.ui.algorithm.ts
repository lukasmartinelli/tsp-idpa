/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.aoc.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.algorithm.ts" />
/// <reference path="tsp.backtracking.ts" />
/// <reference path="tsp.twoapprox.ts" />
declare var router: Simrou;
module tsp.ui.algorithm {

    /** Step in the wizard where the algorithm is choosen and runned. */
    export class AlgorithmStep implements tsp.ui.wizard.Step {
        /** Name of the step */
        key = "algorithm";
        /** Wether the algorithm step has been completed at least once and a result is set */
        completed = ko.observable(false);
        /** Wether an algorithm is running and calculating. */
        calculating = ko.observable(false);
        /** Progress of runnin galgorithm in percent */
        progress = ko.observable(0);
        /** Result of the last executed algorithm */
        algorithmResult: tsp.algorithm.AlgorithmResult;
        
        /** Observable view model of the ant colony algorithm */
        antColonyAlgorithm = ko.observable();

        /** Observable view model of the backtracking algorithm */
        backtrackingAlgorithm = ko.observable();
        
        /** Observable vie model of the two approximation algorithm */
        twoApproxAlgorithm = ko.observable();

        backtrackingEnabled = ko.observable(true);

        /** Create the algorithm models from the graph and assign them.
            The result callback propages the result with the next observable and sets the step to completed.
            The progress callback changes the progress observable.
         */
        enter(graph: tsp.graph.UndirectedGraph) {
            if (graph.getVertices().length > 10) {
                this.backtrackingEnabled(false);
            }

            this.backtrackingAlgorithm(new BacktrackingAlgorithmViewModel(graph, result => this.onResult(result), progress => this.onProgress(progress)));
            this.antColonyAlgorithm(new AntColonyAlgorithmViewModel(graph, result => this.onResult(result), progress => this.onProgress(progress)));
            this.twoApproxAlgorithm(new TwoApproxAlgorithmViewModel(graph, result => this.onResult(result), progress => this.onProgress(progress)));
        }

        private onResult(result: tsp.algorithm.AlgorithmResult) {
            this.calculating(false);
            this.completed(true);
            if (result != null) {
                this.algorithmResult = result;
            }
            router.navigate('/wizard/result');
        }

        private onProgress(progress: number) {
            if (this.calculating() == false) {
                this.calculating(true);
            }

            this.progress(progress);
        }
    }

    /** Base view model for an algorithm */
    export class AlgorithmViewModel {
        /** Graph used to initialize the algorithm */
        graph: tsp.graph.UndirectedGraph;
        /** Related algorithm */
        algorithm: tsp.algorithm.Algorithm;

        constructor(graph: tsp.graph.UndirectedGraph) {
            this.graph = graph;
        }
    }

    /** View model for the two approximation algorithm */
    export class TwoApproxAlgorithmViewModel extends AlgorithmViewModel {
        private _resultCallback: (result: tsp.algorithm.AlgorithmResult) => void;
        private _progressCallback: (progress: number) => void;

        /** Create a view model and register callbacks for the run method of the algorithm */
        constructor(graph: tsp.graph.UndirectedGraph, resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
            super(graph);
            this._resultCallback = resultCallback;
            this._progressCallback = progressCallback;
        }

        /** Create the algorithm and run it with the callbacks of the constructor. */
        run() {
            this.algorithm = new tsp.twoapprox.TwoApproximationAlgorithm(this.graph);
            this.algorithm.run(this._resultCallback, this._progressCallback);
        }
    }
    

    /** View model for the backtracking algorithm */
    export class BacktrackingAlgorithmViewModel extends AlgorithmViewModel {
        private _resultCallback: (result: tsp.algorithm.AlgorithmResult) => void;
        private _progressCallback: (progress: number) => void;

        /** Create a view model and register callbacks for the run method of the algorithm */
        constructor(graph: tsp.graph.UndirectedGraph, resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
            super(graph);
            this._resultCallback = resultCallback;
            this._progressCallback = progressCallback;
        }

        /** Create the algorithm and run it with the callbacks of the constructor. */
        run() {
            this.algorithm = new tsp.backtracking.BacktrackingAlgorithm(this.graph);
            this.algorithm.run(this._resultCallback, this._progressCallback);
        }
    }

    /** The view model for the ant colony algorithm */
    export class AntColonyAlgorithmViewModel extends AlgorithmViewModel {
        antCount = ko.observable(200);
        waveCount = ko.observable(40);
        private _resultCallback: (result: tsp.algorithm.AlgorithmResult) => void;
        private _progressCallback: (progress: number) => void;

        /** Create a view model and register callbacks for the run method of the algorithm */
        constructor(graph: tsp.graph.UndirectedGraph, resultCallback: (result: tsp.algorithm.AlgorithmResult) => void , progressCallback: (progress: number) => void ) {
            super(graph);
            this._resultCallback = resultCallback;
            this._progressCallback = progressCallback;
        }

        /** Create the algoorithm and run it with the callbacks of the constructor. */
        run() {
            this.algorithm = new tsp.aoc.AntColonyAlgorithm(this.graph, {
                ants: this.antCount(),
                waves: this.waveCount()
            });
            this.algorithm.run(this._resultCallback, this._progressCallback);
        }
    }
}
