var tsp;
(function (tsp) {
    (function (ui) {
        /// <reference path="../definitions/knockout.d.ts" />
        /// <reference path="tsp.visual.graph.ts" />
        /// <reference path="tsp.ui.wizard.ts" />
        (function (start) {
            var StartStep = (function () {
                function StartStep() {
                    this.key = "start";
                    this.completed = ko.observable(false);
                    this.addresses = new Array();
                }
                StartStep.PREDEFINED_VERTICES = [
                    'Zuerich', 
                    'Genf', 
                    'Basel', 
                    'Luzern', 
                    'St.Gallen', 
                    'Lausanne', 
                    'Bern', 
                    'Winterthur', 
                    'Lugano', 
                    'Biel', 
                    'Thun', 
                    'Koeniz', 
                    'La Chaux-de-Fonds', 
                    'Schaffhausen', 
                    'Freiburg', 
                    'Chur', 
                    'Neuenburg', 
                    'Vernier', 
                    'Uster', 
                    'Sitten'
                ];
                StartStep.prototype.userdefinedData = function () {
                    this.addresses = [
                        new tsp.visual.graph.GoogleAddress('')
                    ];
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.predefinedDataFew = function () {
                    this.addresses = _.map(StartStep.PREDEFINED_VERTICES.slice(0, 5), function (v) {
                        return new tsp.visual.graph.GoogleAddress(v);
                    });
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.predefinedDataMany = function () {
                    this.addresses = StartStep.PREDEFINED_VERTICES.map(function (v) {
                        return new tsp.visual.graph.GoogleAddress(v);
                    });
                    this.completed(true);
                    return true;
                };
                StartStep.prototype.enter = function () {
                };
                return StartStep;
            })();
            start.StartStep = StartStep;            
        })(ui.start || (ui.start = {}));
        var start = ui.start;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.start.js.map
