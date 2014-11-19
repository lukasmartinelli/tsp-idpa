/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.ui.wizard.ts" />
module tsp.ui.start {
    export class StartStep implements tsp.ui.wizard.Step {
        static PREDEFINED_VERTICES = ['Zuerich', 'Genf', 'Basel', 'Luzern', 'St.Gallen', 'Lausanne', 'Bern', 'Winterthur', 'Lugano', 'Biel', 'Thun', 'Koeniz', 'La Chaux-de-Fonds', 'Schaffhausen', 'Freiburg', 'Chur', 'Neuenburg', 'Vernier', 'Uster', 'Sitten'];
        key = "start";
        completed = ko.observable(false);
        addresses: tsp.visual.graph.GoogleAddress[] = new Array();

        userdefinedData() {
            this.addresses = [new tsp.visual.graph.GoogleAddress('')];
            this.completed(true);
            return true;
        }

        predefinedDataFew() {
            this.addresses = _.map(StartStep.PREDEFINED_VERTICES.slice(0, 5),v => new tsp.visual.graph.GoogleAddress(v));
            this.completed(true);
            return true;
        }

        predefinedDataMany() {
            this.addresses = StartStep.PREDEFINED_VERTICES.map(v => new tsp.visual.graph.GoogleAddress(v));
            this.completed(true);
            return true;
        }

        enter() {

        }
    }
}