var tsp;
(function (tsp) {
    (function (ui) {
        /// <reference path="../definitions/knockout.d.ts" />
        (function (wizard) {
            /** The wizard is responsible for the whole flow of creating a graph, calculating the route and displaying it. */
            var Wizard = (function () {
                function Wizard(steps) {
                    var _this = this;
                    this.currentStep = ko.observable();
                    this._steps = steps;
                    _.forEach(this._steps, function (step, i) {
                        _this[step.key] = step//Workaround because knockout cannot access indexer we use the name
                        ;
                    });
                }
                Wizard.prototype.isActive = function (key) {
                    if(key == 'start') {
                        return true;
                    } else if(key == 'graph') {
                        return this['start'].completed();
                    } else if(key == 'algorithm') {
                        return this['graph'].completed();
                    } else if(key == 'result') {
                        return this['algorithm'].completed();
                    }
                };
                Wizard.prototype.isVisible = function (name) {
                    return this.currentStep() == name;
                };
                return Wizard;
            })();
            wizard.Wizard = Wizard;            
        })(ui.wizard || (ui.wizard = {}));
        var wizard = ui.wizard;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.wizard.js.map
