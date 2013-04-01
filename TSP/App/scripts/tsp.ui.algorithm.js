var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsp;
(function (tsp) {
    (function (ui) {
        (function (algorithm) {
            /** Step in the wizard where the algorithm is choosen and runned. */
            var AlgorithmStep = (function () {
                function AlgorithmStep() {
                    /** Name of the step */
                    this.key = "algorithm";
                    /** Wether the algorithm step has been completed at least once and a result is set */
                    this.completed = ko.observable(false);
                    /** Wether an algorithm is running and calculating. */
                    this.calculating = ko.observable(false);
                    /** Progress of runnin galgorithm in percent */
                    this.progress = ko.observable(0);
                    /** Observable view model of the ant colony algorithm */
                    this.antColonyAlgorithm = ko.observable();
                    /** Observable view model of the backtracking algorithm */
                    this.backtrackingAlgorithm = ko.observable();
                    /** Observable vie model of the two approximation algorithm */
                    this.twoApproxAlgorithm = ko.observable();
                    this.backtrackingEnabled = ko.observable(true);
                }
                AlgorithmStep.prototype.enter = /** Create the algorithm models from the graph and assign them.
                The result callback propages the result with the next observable and sets the step to completed.
                The progress callback changes the progress observable.
                */
                function (graph) {
                    var _this = this;
                    if(graph.getVertices().length > 10) {
                        this.backtrackingEnabled(false);
                    }
                    this.backtrackingAlgorithm(new BacktrackingAlgorithmViewModel(graph, function (result) {
                        return _this.onResult(result);
                    }, function (progress) {
                        return _this.onProgress(progress);
                    }));
                    this.antColonyAlgorithm(new AntColonyAlgorithmViewModel(graph, function (result) {
                        return _this.onResult(result);
                    }, function (progress) {
                        return _this.onProgress(progress);
                    }));
                    this.twoApproxAlgorithm(new TwoApproxAlgorithmViewModel(graph, function (result) {
                        return _this.onResult(result);
                    }, function (progress) {
                        return _this.onProgress(progress);
                    }));
                };
                AlgorithmStep.prototype.onResult = function (result) {
                    this.calculating(false);
                    this.completed(true);
                    if(result != null) {
                        this.algorithmResult = result;
                    }
                    router.navigate('/wizard/result');
                };
                AlgorithmStep.prototype.onProgress = function (progress) {
                    if(this.calculating() == false) {
                        this.calculating(true);
                    }
                    this.progress(progress);
                };
                return AlgorithmStep;
            })();
            algorithm.AlgorithmStep = AlgorithmStep;            
            /** Base view model for an algorithm */
            var AlgorithmViewModel = (function () {
                function AlgorithmViewModel(graph) {
                    this.graph = graph;
                }
                return AlgorithmViewModel;
            })();
            algorithm.AlgorithmViewModel = AlgorithmViewModel;            
            /** View model for the two approximation algorithm */
            var TwoApproxAlgorithmViewModel = (function (_super) {
                __extends(TwoApproxAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function TwoApproxAlgorithmViewModel(graph, resultCallback, progressCallback) {
                                _super.call(this, graph);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                TwoApproxAlgorithmViewModel.prototype.run = /** Create the algorithm and run it with the callbacks of the constructor. */
                function () {
                    this.algorithm = new tsp.twoapprox.TwoApproximationAlgorithm(this.graph);
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return TwoApproxAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.TwoApproxAlgorithmViewModel = TwoApproxAlgorithmViewModel;            
            /** View model for the backtracking algorithm */
            var BacktrackingAlgorithmViewModel = (function (_super) {
                __extends(BacktrackingAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function BacktrackingAlgorithmViewModel(graph, resultCallback, progressCallback) {
                                _super.call(this, graph);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                BacktrackingAlgorithmViewModel.prototype.run = /** Create the algorithm and run it with the callbacks of the constructor. */
                function () {
                    this.algorithm = new tsp.backtracking.BacktrackingAlgorithm(this.graph);
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return BacktrackingAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.BacktrackingAlgorithmViewModel = BacktrackingAlgorithmViewModel;            
            /** The view model for the ant colony algorithm */
            var AntColonyAlgorithmViewModel = (function (_super) {
                __extends(AntColonyAlgorithmViewModel, _super);
                /** Create a view model and register callbacks for the run method of the algorithm */
                function AntColonyAlgorithmViewModel(graph, resultCallback, progressCallback) {
                                _super.call(this, graph);
                    this.antCount = ko.observable(200);
                    this.waveCount = ko.observable(40);
                    this._resultCallback = resultCallback;
                    this._progressCallback = progressCallback;
                }
                AntColonyAlgorithmViewModel.prototype.run = /** Create the algoorithm and run it with the callbacks of the constructor. */
                function () {
                    this.algorithm = new tsp.aoc.AntColonyAlgorithm(this.graph, {
                        ants: this.antCount(),
                        waves: this.waveCount()
                    });
                    this.algorithm.run(this._resultCallback, this._progressCallback);
                };
                return AntColonyAlgorithmViewModel;
            })(AlgorithmViewModel);
            algorithm.AntColonyAlgorithmViewModel = AntColonyAlgorithmViewModel;            
        })(ui.algorithm || (ui.algorithm = {}));
        var algorithm = ui.algorithm;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.algorithm.js.map
