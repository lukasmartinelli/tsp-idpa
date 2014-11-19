///<reference path='../definitions/jquery.d.ts' />
/// <reference path="../definitions/knockout.d.ts" />
/// <reference path="../definitions/simrou.d.ts" />
/// <reference path="../definitions/lawnchair.d.ts" />
/// <reference path="../definitions/underscore.d.ts" />
/// <reference path="tsp.ui.start.ts" />
/// <reference path="tsp.ui.graph.ts" />
/// <reference path="tsp.ui.algorithm.ts" />
/// <reference path="tsp.ui.result.ts" />
/// <reference path="tsp.ui.wizard.ts" />
/// <reference path="tsp.ui.bindings.ts" />
/// <reference path="tsp.graph.ts" />
declare var router : Simrou;
module tsp {
    export class App {
        start() {
            tsp.ui.bindings.fadeVisibleBinding.apply();

            var step1 = new tsp.ui.start.StartStep();
            var step2 = new tsp.ui.graph.GraphStep();
            var step3 = new tsp.ui.algorithm.AlgorithmStep();
            var step4 = new tsp.ui.result.ResultStep();
            var wiz = new tsp.ui.wizard.Wizard([step1, step2, step3, step4]);

            router = new Simrou();
            var indexRoute = router.addRoute('/');
            indexRoute.get((event, params) => {
                router.navigate('/wizard/start');
            });

            var wizardRoute = router.addRoute('/wizard/:step');
            wizardRoute.get((event, params) => {
                if (params.step == 'start') {
                    wiz.currentStep('start');
                } else if (params.step == 'graph') {
                    var addresses = wiz['start'].addresses;
                    if (addresses) {
                        wiz['graph'].enter(addresses);
                        wiz.currentStep('graph');
                    } else {
                        router.navigate('/wizard/start');
                    }
                } else if (params.step == 'algorithm') {
                    var graph = wiz['graph'].graph;
                    if (graph) {
                        wiz['algorithm'].enter(graph);
                        wiz.currentStep('algorithm');
                    } else {
                        router.navigate('/wizard/start');
                    }
                } else if (params.step == 'result') {
                    var algorithmResult = wiz['algorithm'].algorithmResult;
                    if (algorithmResult) {
                        wiz['result'].enter(algorithmResult);
                        wiz.currentStep('result');
                    } else {
                        router.navigate('/wizard/start');
                    }
                }
            });

            router.start('#/');

            ko.applyBindings(wiz);
        }
    }
}
