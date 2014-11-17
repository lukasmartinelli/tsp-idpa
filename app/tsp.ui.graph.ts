/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/simrou.d.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.visual.graph.ts" />
/// <reference path="tsp.graph.ts" />

declare var router: Simrou;
module tsp.ui.graph {
    export class GraphStep implements tsp.ui.wizard.Step {
        key = "graph";
        addresses = ko.observableArray();
        pending = ko.observable(false);
        graph: tsp.graph.UndirectedGraph;
        completed = ko.observable(false);
        private _graphService = new tsp.visual.graph.GoogleGraphService();

        enter(addresses: tsp.visual.graph.GoogleAddress[]) {
            if (addresses.length > 0) {
                this.addresses.removeAll();
                _.forEach(addresses, a => this.addresses.push(a));
            }
        }

        addAddress() {
            this.addresses.push(new tsp.visual.graph.GoogleAddress(''));
        }

        createGraph() {
            this.pending(true);
            this._graphService.getGraph(this.addresses()).done((graph: tsp.graph.UndirectedGraph) => {
                this.graph = graph;
                this.pending(false);
                this.completed(true);
                router.navigate('/wizard/algorithm');
            });
        }
    }
}