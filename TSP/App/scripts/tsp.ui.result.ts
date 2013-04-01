/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/simrou.d.ts" />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.visual.maps.ts" />
/// <reference path="tsp.ui.wizard.ts" />

declare var router: Simrou;
module tsp.ui.result {
    export class ResultStep implements tsp.ui.wizard.Step {
        static RESULT_COLORS = ['#FF3366', '#33FF66', '#FFCC33', '#33FFCC', '#FF33CC'];

        private _maps: tsp.visual.maps.GoogleMaps;
        private _googleGraph: tsp.visual.maps.GoogleGraph;
        private _googleDistances: tsp.visual.maps.GoogleDistanceCobweb;
        private _graph: tsp.graph.UndirectedGraph;

        completed = ko.observable(false);
        key = "result";
        algorithmResult = ko.observable();
        showDistances = ko.observable(true);
        showVertices = ko.observable(true);

        constructor() {
            this.showDistances.subscribe(show => {
                if (show) {
                    this._googleDistances.show();
                } else {
                    this._googleDistances.hide();
                }
            });

            this.showVertices.subscribe(show => {
                if (show) {
                    this._googleGraph.show();
                } else {
                    this._googleGraph.hide();
                }
            });
        }

        enter(args: tsp.algorithm.AlgorithmResult) {
            this._graph = args.graph;

            setTimeout(() => {
                if (!this._maps) {
                    var mapCanvas = document.getElementById('tsp-map-canvas');
                    $(mapCanvas).css('height', '600px');
                    this._maps = new tsp.visual.maps.GoogleMaps(mapCanvas);
                }
                if (!this._googleGraph) {
                    this._googleGraph = this._maps.createGraph(this._graph);
                    this._googleGraph.show();
                }

                if (!this._googleDistances) {
                    this._googleDistances = this._maps.createDistanceWeb(this._graph);
                    this._googleDistances.show();
                }

                var pheronomTrail = args.algorithmMethod == 'AntColonyAlgorithm' ? this._maps.createTrail(args.graph) : null;
                var googleRoute = this._maps.createRoute(args.route, ResultStep.RESULT_COLORS[0]);
                var result = new ResultViewModel(args.executionTime, args.route, googleRoute, pheronomTrail);
                if (this.algorithmResult() != undefined) {
                    this.algorithmResult().dispose();
                }
                this.algorithmResult(result);
                this.completed(true);
            }, 1000);
        }

        recalculate() {
            (<any>this).dispose();
            router.navigate('/wizard/algorithm');
        }
    }

    export class ResultViewModel {
        executionTime: KnockoutObservableNumber;
        totalWeight: KnockoutObservableNumber;
        graphColor: KnockoutObservableString;

        _route: tsp.graph.Route;
        _visualRoute: tsp.visual.maps.GoogleRoute;
        _pheronomTrail: tsp.visual.maps.PheronomTrail;

        pheromonTrailEnabled = ko.observable(false);
        showRoute = ko.observable(true);
        showDrivingRoute = ko.observable(false);
        showPheronomTrail = ko.observable(false);

        dispose() {
            this.showRoute(false);
            this.showDrivingRoute(false);
            this.showPheronomTrail(false);
        }

        constructor(executionTime: number, route: tsp.graph.Route, visualRoute: tsp.visual.maps.GoogleRoute, pheronomTrail: tsp.visual.maps.PheronomTrail) {
            this.totalWeight = ko.observable(route.getTotalWeight()/1000);
            this.executionTime = ko.observable(executionTime);
            this._route = route;
            this._visualRoute = visualRoute;
            this.graphColor = ko.observable(this._visualRoute.color);
            this._pheronomTrail = pheronomTrail;
            this.pheromonTrailEnabled = ko.observable(this._pheronomTrail != null);

            this.showDrivingRoute.subscribe(show => {

            });
            

            this.showPheronomTrail.subscribe(show => {
                if (this._pheronomTrail != null) {
                    if (show) {
                        this._pheronomTrail.show();
                    } else {
                        this._pheronomTrail.hide();
                    }
                }
            });

            this.showRoute.subscribe(show => {
                if (show) {
                    this._visualRoute.show();
                } else {
                    this._visualRoute.hide();
                }
            });
        }
    }
}