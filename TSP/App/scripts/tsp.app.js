var tsp;
(function (tsp) {
    var Store = (function () {
        function Store() { }
        Store.prototype.saveStep = function (step) {
            Lawnchair(function (context) {
                context.save(ko.toJS(step));
            });
        };
        Store.prototype.loadStartStep = function (step) {
            Lawnchair(function (context) {
                try  {
                    context.get('start', function (obj) {
                        if(obj) {
                            step.completed(obj.completed);
                            step.addresses = [];
                            _.each(obj.addresses, function (value) {
                                step.addresses.push(new tsp.visual.graph.GoogleAddress(value.name));
                            });
                        }
                    });
                } catch (error) {
                    //If an error happens during loading remove it wipe db
                    console.log('Error happened during loading, nuked db');
                    context.nuke();
                }
            });
        };
        Store.prototype.loadGraphStep = function (step) {
            var _this = this;
            Lawnchair(function (context) {
                try  {
                    context.get('graph', function (obj) {
                        if(obj) {
                            step.completed(obj.completed);
                            step.addresses.destroyAll();
                            _.map(obj.addresses, function (value) {
                                step.addresses.push(new tsp.visual.graph.GoogleAddress(value.name));
                            });
                            step.graph = _this.graphFromJson(obj);
                        }
                    });
                } catch (error) {
                    //If an error happens during loading remove it wipe db
                    console.log('Error happened during loading, nuked db');
                    context.nuke();
                }
            });
        };
        Store.prototype.loadAlgorithmStep = function (step) {
            Lawnchair(function (context) {
                try  {
                    context.get('algorithm', function (obj) {
                        if(obj) {
                        }
                    });
                } catch (error) {
                    //If an error happens during loading remove it wipe db
                    console.log('Error happened during loading, nuked db');
                    context.nuke();
                }
            });
        };
        Store.prototype.graphFromJson = function (obj) {
            var graph = new tsp.graph.UndirectedGraph(obj.graph.vertices.length);
            var vertices = graph.getVertices();
            _.each(obj.graph.vertices, function (vertex) {
                var vertex = new tsp.visual.graph.GoogleAddressVertex(vertex.name, new google.maps.LatLng(vertex.location.hb, vertex.location.ib));
                graph.addVertex(vertex);
            });
            for(var i = 0; i < vertices.length; i++) {
                for(var j = 0; j < vertices.length; j++) {
                    if(i != j) {
                        var from = vertices[i];
                        var to = vertices[j];
                        var edgeObj = obj.graph.edges[i][j];
                        var edge = new tsp.aoc.PheromonEdge(from, to, edgeObj.weight);
                        graph.addEdge(edge);
                    }
                }
            }
            return graph;
        };
        return Store;
    })();    
    var App = (function () {
        function App() {
            this._store = new Store();
        }
        App.prototype.start = function () {
            tsp.ui.bindings.fadeVisibleBinding.apply();
            var step1 = new tsp.ui.start.StartStep();
            //this._store.loadStartStep(step1);
            var step2 = new tsp.ui.graph.GraphStep();
            //this._store.loadGraphStep(step2);
            var step3 = new tsp.ui.algorithm.AlgorithmStep();
            //this._store.loadAlgorithmStep(step3);
            var step4 = new tsp.ui.result.ResultStep();
            var wiz = new tsp.ui.wizard.Wizard([
                step1, 
                step2, 
                step3, 
                step4
            ]);
            router = new Simrou();
            var indexRoute = router.addRoute('/');
            indexRoute.get(function (event, params) {
                router.navigate('/wizard/start');
            });
            var wizardRoute = router.addRoute('/wizard/:step');
            wizardRoute.get(function (event, params) {
                if(params.step == 'start') {
                    wiz.currentStep('start');
                } else if(params.step == 'graph') {
                    //this._store.saveStep(wiz['start']);
                    var addresses = wiz['start'].addresses;
                    if(addresses) {
                        wiz['graph'].enter(addresses);
                        wiz.currentStep('graph');
                    } else {
                        router.navigate('/wizard/start');
                    }
                } else if(params.step == 'algorithm') {
                    //this._store.saveStep(wiz['graph']);
                    var graph = wiz['graph'].graph;
                    if(graph) {
                        wiz['algorithm'].enter(graph);
                        wiz.currentStep('algorithm');
                    } else {
                        router.navigate('/wizard/start');
                    }
                } else if(params.step == 'result') {
                    //this._store.saveStep(wiz['start']);
                    var algorithmResult = wiz['algorithm'].algorithmResult;
                    if(algorithmResult) {
                        wiz['result'].enter(algorithmResult);
                        wiz.currentStep('result');
                    } else {
                        router.navigate('/wizard/start');
                    }
                }
            });
            router.start('#/');
            ko.applyBindings(wiz);
        };
        return App;
    })();
    tsp.App = App;    
})(tsp || (tsp = {}));
//@ sourceMappingURL=tsp.app.js.map
