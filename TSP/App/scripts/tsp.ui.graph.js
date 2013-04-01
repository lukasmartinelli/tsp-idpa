var tsp;
(function (tsp) {
    (function (ui) {
        (function (graph) {
            var GraphStep = (function () {
                function GraphStep() {
                    this.key = "graph";
                    this.addresses = ko.observableArray();
                    this.pending = ko.observable(false);
                    this.completed = ko.observable(false);
                    this._graphService = new tsp.visual.graph.GoogleGraphService();
                }
                GraphStep.prototype.enter = function (addresses) {
                    var _this = this;
                    if(addresses.length > 0) {
                        this.addresses.removeAll();
                        _.forEach(addresses, function (a) {
                            return _this.addresses.push(a);
                        });
                    }
                };
                GraphStep.prototype.addAddress = function () {
                    this.addresses.push(new tsp.visual.graph.GoogleAddress(''));
                };
                GraphStep.prototype.createGraph = function () {
                    var _this = this;
                    this.pending(true);
                    this._graphService.getGraph(this.addresses()).done(function (graph) {
                        _this.graph = graph;
                        _this.pending(false);
                        _this.completed(true);
                        router.navigate('/wizard/algorithm');
                    });
                };
                return GraphStep;
            })();
            graph.GraphStep = GraphStep;            
        })(ui.graph || (ui.graph = {}));
        var graph = ui.graph;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.graph.js.map
