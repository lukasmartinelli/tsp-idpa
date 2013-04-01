var tsp;
(function (tsp) {
    (function (ui) {
        ///<reference path='../definitions/knockout.d.ts' />
        ///<reference path='../definitions/jquery.d.ts' />
        (function (bindings) {
            var fadeVisibleBinding = (function () {
                function fadeVisibleBinding() { }
                fadeVisibleBinding.apply = function apply() {
                    ko.bindingHandlers['fadeVisible'] = {
                        init: function (element, valueAccessor) {
                            // Initially set the element to be instantly visible/hidden depending on the value
                            var value = valueAccessor();
                            $(element).toggle(ko.utils.unwrapObservable(value))// Use "unwrapObservable" so we can handle values that may or may not be observable
                            ;
                        },
                        update: function (element, valueAccessor) {
                            // Whenever the value subsequently changes, slowly fade the element in or out
                            var value = valueAccessor();
                            ko.utils.unwrapObservable(value) ? $(element).delay(400).fadeIn() : $(element).fadeOut();
                        }
                    };
                };
                return fadeVisibleBinding;
            })();
            bindings.fadeVisibleBinding = fadeVisibleBinding;            
        })(ui.bindings || (ui.bindings = {}));
        var bindings = ui.bindings;
    })(tsp.ui || (tsp.ui = {}));
    var ui = tsp.ui;
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.ui.bindings.js.map
