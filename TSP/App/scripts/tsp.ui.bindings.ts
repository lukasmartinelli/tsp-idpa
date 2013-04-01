///<reference path='../definitions/knockout.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
module tsp.ui.bindings {
    export class fadeVisibleBinding {
        static apply() {
            ko.bindingHandlers['fadeVisible'] = {
                init: function (element, valueAccessor) {
                    // Initially set the element to be instantly visible/hidden depending on the value
                    var value = valueAccessor();
                    $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
                },
                update: function (element, valueAccessor) {
                    // Whenever the value subsequently changes, slowly fade the element in or out
                    var value = valueAccessor();
                    ko.utils.unwrapObservable(value) ? $(element).delay(400).fadeIn() : $(element).fadeOut();
                }
            };
        }
    }
}