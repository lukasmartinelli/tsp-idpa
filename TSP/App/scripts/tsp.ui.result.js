var tsp;
(function (tsp) {
    (function (ui) {
        (function (result) {
            var ResultStep = (function () {
                function ResultStep() {
                    var _this = this;
                    this.completed = ko.observable(false);
                    this.key = "result";
                    this.algorithmResult = ko.observable();
                    this.showDistances = ko.observable(true);
                    this.showVertices = ko.observable(true);
                    this.showDistances.subscribe(function (show) {
                        if(show) {
                            _this._googleDistances.show();
                        } else {
                            _this._googleDistances.hide();
                        }
                    });
                    this.showVertices.subscribe(function (show) {
                        if(show) {
                            _this._googleGraph.show();
                        } else {
                            _this._googleGraph.hide();
                        }
                    });
                }
                ResultStep.RESULT_COLORS = [
                    '#FF3366', 
                    '#33FF66', 
                    '#FFCC33', 
                    '#33FFCC', 
                    '#FF33CC'
                ];
                ResultStep.prototype.enter = function (args) {
                    var _this = this;
                    this._graph = args.graph;
                    setTimeout(function () {
                        if(!_this._maps) {
                            var mapCanvas = document.getElementById('tsp-map-canvas');
                            $(mapCanvas).css('height', '600px');
                            _this._maps = new tsp.visual.maps.GoogleMaps(mapCanvas);
                        }
                        if(!_this._googleGraph) {
                            _this._googleGraph = _this._maps.createGraph(_this._graph);
                            _this._googleGraph.show();
                        }
                        if(!_this._googleDistances) {
                            _this._googleDistances = _this._maps.createDistanceWeb(_this._graph);
                            _this._googleDistances.show();
                        }
                        var pheronomTrail = args.algorithmMethod == 'AntColonyAlgorithm' ? _this._maps.createTrail(args.graph) : null;
                        var googleRoute = _this._maps.createRoute(args.route, ResultStep.RESULT_COLORS[0]);
                        var result = new ResultViewModel(args.executionTime, args.route, googleRoute, pheronomTrail);
                        if(_this.algorithmResult() != undefined) {
                            _this.algorithmResult().dispose();
                        }
                        _this.algorithmResult(result);
                        _this.completed(true);
                    }, 1000);
                };
                ResultStep.prototype.recalculate = function () {
                    (this).dispose();
                    router.navigate('/wizard/algorithm');
                };
                return ResultStep;
            })();
            result.ResultStep = ResultStep;            
            var ResultViewModel = (function () {
                function ResultViewModel(executionTime, route, visualRoute, pheronomTrail) {
                    var _this = this;
                    this.pheromonTrailEnabled = ko.observable(false);
                    this.showRoute = ko.observable(true);
                    this.showDrivingRoute = ko.observable(false);
                    this.showPheronomTrail = ko.observable(false);
                    this.totalWeight = ko.observable(route.getTotalWeight() / 1000);
                    this.executionTime = ko.observable(executionTime);
                    this._route = route;
                    this._visualRoute = visualRoute;
                    this.graphColor = ko.observable(this._visualRoute.color);
                    this._pheronomTrail = pheronomTrail;
                    this.pheromonTrailEnabled = ko.observable(this._pheronomTrail != null);
                    this.showDrivingRoute.subscribe(function (show) {
                    });
                    this.showPheronomTrail.subscribe(function (show) {
                        if(_this._pheronomTrail != null) {
                            if(show) {
                                _this._pheronomTrail.show();
                            } else {
                                _this._pheronomTrail.hide();
                            }
                        }
                    });
                    this.showRoute.subscribe(function (show) {
                        if(show) {
                            _this._visualRoute.show();
                        } else {
                            _this._visualRoute.hide();
                        }
                    });
                }
                ResultViewModel.prototype.dispose = function () {
                    this.showRoute(false);
                    this.showDrivingRoute(false);
                    this.showPheronomTrail(false);
                };
                return ResultViewModel;
            })();
            result.ResultViewModel = ResultViewModel;            
        })(ui.result || (ui.result = {}));
        var result = ui.result;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.result.js.map
