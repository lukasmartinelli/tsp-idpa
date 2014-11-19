///<reference path='../definitions/google.maps.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
///<reference path='../definitions/knockout.d.ts' />
///<reference path='../definitions/underscore.d.ts' />
/// <reference path="tsp.graph.ts" />
/// <reference path="tsp.visual.maps.ts" />

module tsp.visual.graph {
    export class GoogleGraphService {
        private _geocoder = new google.maps.Geocoder();
        private _distanceService = new google.maps.DistanceMatrixService();
        private _vertices: tsp.graph.Vertex[] = [];
        private _distances: Distance[] = [];

        getGraph(addresses: tsp.visual.graph.GoogleAddress[]) {
            var deferred = $.Deferred();

            this.findAddresses(addresses).done(() => {
                this.getDistances(this._vertices).done(() => {
                    var graph = new tsp.graph.UndirectedGraph(addresses.length);
                    _.forEach(this._vertices, vertex => graph.addVertex(vertex));
                    _.forEach(this._distances, distance => graph.addEdge(distance.edge));
                    deferred.resolve(graph);
                });
            });

            return deferred;
        }

        private getDistanceMatrix(origin: GoogleAddressVertex, destinations: GoogleAddressVertex[], timeout: number): JQueryPromise<google.maps.DistanceMatrixResponse> {
            var deferred = $.Deferred();
            window.setTimeout(() => {
                this._distanceService.getDistanceMatrix({
                    origins: [origin.name],
                    destinations: _.map(destinations,d => d.name),
                    travelMode: google.maps.TravelMode.DRIVING,
                    avoidHighways: false,
                    avoidTolls: false
                    }, (response: google.maps.DistanceMatrixResponse,
                        status: google.maps.DistanceMatrixStatus) => {
                    if (status == google.maps.DistanceMatrixStatus.OK) {
                        deferred.resolve(response);
                    } else {
                        deferred.reject(status);
                    }
                });
            }, timeout);

            return deferred;
        }

        private getDistances(vertices: tsp.graph.Vertex[]): JQueryPromise<google.maps.DistanceMatrixResponse[]> {
            var throttling = tsp.graph.UndirectedGraph.getEdgeCount(vertices.length) * 3;
            var calls = [];

            _.forEach(vertices, (vertex: GoogleAddressVertex, i) => {
                var origin = <GoogleAddressVertex>vertex;
                var destinations: GoogleAddressVertex[] = new Array();

                for (var j = vertices.length - 1; j > i; j--) {
                    destinations.push(<GoogleAddressVertex>vertices[j]);
                }
                if (destinations.length > 0) {
                    var call = this.getDistanceMatrix(origin, destinations, throttling * i).then(
                        (response: google.maps.DistanceMatrixResponse) => {
                            _.forEach(response.rows[0].elements, (element, k) => {
                                var from = vertex;
                                var to = _.filter(this._vertices,(v: tsp.visual.graph.GoogleAddressVertex) => v.name == response.destinationAddresses[k])[0];
                                var edge = new aoc.PheromonEdge(from, to, element.distance.value);
                                this._distances.push({
                                    from: from,
                                    to: to,
                                    edge: edge
                                });
                            });
                        },
                        (failureStatus: google.maps.DistanceMatrixStatus) => {
                            alert(failureStatus + '\nDistanzen konnten nicht berechnet werden.');
                        });
                    calls.push(call);
                }
            });

            return $.when.apply($, calls);
        }

        private findAddress(name: string, timeout: number): JQueryPromise< GoogleAddressVertex> {
            var deferred = $.Deferred();
            window.setTimeout(() => {
                this._geocoder.geocode({ address: name }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var address = new GoogleAddressVertex(results[0].formatted_address, results[0].geometry.location);
                        deferred.resolve(address);
                    } else {
                        deferred.reject(status);
                    }
                })
            }, timeout);
            return deferred;
        }

        private findAddresses(addresses: GoogleAddress[]): JQueryPromise<GoogleAddressVertex[]> {
            var throttling = addresses.length * 25;
            var calls = [];

            _.forEach(addresses, (address: GoogleAddress, index) => {
                var call = this.findAddress(address.name(), index * throttling).then(
                    (foundAddress: GoogleAddressVertex) => {
                        address.found(true);
                        address.name(foundAddress.name);
                        this._vertices.push(foundAddress);
                    },
                    (failureStatus: google.maps.GeocoderStatus) => {
                        address.found(false);
                        alert(failureStatus + '\nCould not find address ' + address.name);
                    });
                calls.push(call);
            });

            return $.when.apply($, calls);
        }
    }

    interface Distance {
        edge: aoc.PheromonEdge;
    }

    export class GoogleAddress {
        name: KnockoutObservable<string>;
        found: KnockoutObservable<boolean>;

        constructor(name: string) {
            this.name = ko.observable(name);
            this.found = ko.observable(false);
        }
    }

    export class GoogleAddressVertex extends tsp.graph.Vertex {
        location: google.maps.LatLng;
        constructor(name: string, location: google.maps.LatLng) {
            super(name);
            this.location = location;
        }
    }
}
