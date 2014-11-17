///<reference path='../definitions/google.maps.d.ts' />
///<reference path='../definitions/jquery.d.ts' />
///<reference path='../definitions/knockout.d.ts' />
///<reference path="tsp.aoc.ts" />
///<reference path="tsp.visual.graph.ts" />

module tsp.visual.maps {
    /** A google map component that can be shown or hidden */
    export interface GoogleMapsComponent {
        show();
        hide();
    }

    /** Pheronom trail displays all edges and their pheronom value visually. */
    export class PheronomTrail implements GoogleMapsComponent {
        private _polylines: google.maps.Polyline[];
        _map: google.maps.Map;

        /** Create a new pheronom trail. You have to call show() in order to render the edges.
            @constructor
            @param map - The google map used to draw the polylines for the edges.
            @param graph - The graph to get the edges from.
        */
        constructor(map: google.maps.Map, graph: tsp.graph.UndirectedGraph) {
            this._map = map;
            this._polylines = [];
            this.createPolylinesForEdge(graph, this.getPheronomAverage(graph));
        }

        /** Show the polylines on the map */
        show() {
            _.forEach(this._polylines, line => line.setMap(this._map));
        }

        /** Hide the polylines on the map */
        hide() {
            _.forEach(this._polylines, line => line.setMap(null));
        }

        /** Create polylines for all edges. The strokeWeight of the polyline is relative to its pheronom value.
            @constructor
            @param graph - The graph for travelling through the edges.
            @param pheromonAvg - The pheromon average of all edges. Used to define the relative value of the strokeWeight.
        */
        private createPolylinesForEdge(graph: tsp.graph.UndirectedGraph, pheromonAvg: number) {
            var edges = graph.getEdges();
            _.forEach(edges, (edge: tsp.aoc.PheromonEdge) => {
                var relativeWeight = (3 / pheromonAvg) * edge.pheronom();
                var polyline = new google.maps.Polyline({
                    path: [(<tsp.visual.graph.GoogleAddressVertex>edge.from).location, (<tsp.visual.graph.GoogleAddressVertex>edge.to).location],
                    strokeColor: '#0000FF',
                    strokeOpacity: 0.7,
                    strokeWeight: relativeWeight > 1 ? relativeWeight : 1,
                });
                this._polylines.push(polyline);
            });
        }

        /** Calculate the pheromon average of all edges of a graph
            @param graph The graph containing the pheromon edges.
        */
        private getPheronomAverage(graph: tsp.graph.UndirectedGraph) {
            var pheromonSum = 0;
            var edgeCount = 0;
            var edges = graph.getEdges();
            _.forEach(edges, (edge: tsp.aoc.PheromonEdge) => {
                pheromonSum += edge.pheronom();
                edgeCount++;
            });
            return pheromonSum / edgeCount;
        }
    }

    /** A visual representation of the edges on the graph */
    export class GoogleDistanceCobweb implements GoogleMapsComponent {
        private _lines: google.maps.Polyline[];
        private _map: google.maps.Map;

        /**
            Create polylines for all edges of the graph.
            @param graph The graph to get the edges from
            @map Google map to draw the polylines to
        */
        constructor(graph: tsp.graph.UndirectedGraph, map: google.maps.Map) {
            this._lines = [];
            this._map = map;
            var edges = graph.getEdges();

            _.forEach(edges, (edge: tsp.aoc.PheromonEdge) => {
                var from = <tsp.visual.graph.GoogleAddressVertex>edge.from;
                var to = <tsp.visual.graph.GoogleAddressVertex>edge.to;
                var line = new google.maps.Polyline({
                    path: [from.location, to.location],
                    strokeColor: '#000',
                    strokeOpacity: 0.7,
                    strokeWeight: 1,
                });
                this._lines.push(line);
            });
        }

        show() {
            _.forEach(this._lines, p => p.setMap(this._map));
        }

        hide() {
            _.forEach(this._lines, p => p.setMap(null));
        }
    }

    /** A visual representation of a graph on the google map */
    export class GoogleGraph implements GoogleMapsComponent {
        private _map: google.maps.Map;
        private _markers: google.maps.Marker[];

        /** Create a new graph representation
            @graph Graph to get verticese and edges from
            @map The google map to draw the markers to    
        */
        constructor(graph: tsp.graph.UndirectedGraph, map: google.maps.Map) {
            this._markers = [];
            this._map = map;
            _.forEach(graph.getVertices(), (vertex: tsp.visual.graph.GoogleAddressVertex) => {
                var marker = new google.maps.Marker({
                    position: vertex.location
                });
                this._markers.push(marker);
            });
        }

        /** Show the markers */
        show() {
            _.forEach(this._markers, marker => marker.setMap(this._map));
        }

        /** Hide the markers */
        hide() {
            _.forEach(this._markers, marker => marker.setMap(null));
        }
    }

    export class GoogleDirections implements GoogleMapsComponent {
        private _map: google.maps.Map;
        private _directionsService: google.maps.DirectionsService;
        private _directionsRenderer: google.maps.DirectionsRenderer;

        /**
            Create a new directions visualization of the route. 
            @param map The google map used for the renderer.
            @param route The route to draw. If the route is longer than 8 vertices
            the route cannot be displayed and will throw an error.
        */
        constructor(map: google.maps.Map, route: tsp.graph.Route) {
            if (route.getVertices().length > 8) {
                throw 'Route cannot be longer than 8 vertices. This is a restriction by google.';
            }

            this._map = map;
            this._directionsService = new google.maps.DirectionsService();
            this._directionsRenderer = new google.maps.DirectionsRenderer({ map: this._map });
            this.getDirections(route).done(result => {
                this._directionsRenderer.setDirections(result);
                this.show();
            });
        }

        /** Set map on directions renderer to display the directions */
        show() {
            this._directionsRenderer.setMap(this._map);
        }

        /** Set map to null on directions renderer to hide all the directions */
        hide() {
            this._directionsRenderer.setMap(null);
        }

        /** Access the google direction service using the waypoints of the route and return the result as promise 
            @param route The route to get directions for.
        */
        private getDirections(route: tsp.graph.Route) {
        var deferred = $.Deferred<google.maps.DirectionsResult>();
            var vertices = route.getVertices();

            var start = <tsp.visual.graph.GoogleAddressVertex>vertices[0];
            var end = <tsp.visual.graph.GoogleAddressVertex>vertices[vertices.length - 1];

            var waypoints = <google.maps.DirectionsWaypoint[]>vertices.slice(1, vertices.length - 1)
                .map((v: tsp.visual.graph.GoogleAddressVertex) => <google.maps.DirectionsWaypoint>{ location: v.location, stopover: true });

            this._directionsService.route({
                origin: start.location,
                destination: end.location,
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false
            }, (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
                if (status == google.maps.DirectionsStatus.OK) {
                    deferred.resolve(result);
                } else {
                    deferred.reject('Could not draw route: ' + status);
                }
            });

            return deferred;
        }
    }

    /** A google map where various elements can be created on. */
    export class GoogleMaps {
        private _map: google.maps.Map;

        /** Create the google map on the given map placeholder. The map will center to switzerland. 
            @param mapDiv The html element of the placeholder.
        */
        constructor(mapDiv: Element) {
            this._map = new google.maps.Map(mapDiv, {
                zoom: 8,
                center: new google.maps.LatLng(46.961511, 8.129425), //Center of switzerland
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        }

        /** Create  a directions object
            @param route The route to draw. If the route is longer than 8 vertices
            the route cannot be displayed and will throw an error. 
        */
        createDirections(route: tsp.graph.Route) {

            return new GoogleDirections(this._map, route);
        }

        /** Create a pheronom trail representation of the route.
            @param graph - The graph to get the edges from.
        */
        createTrail(graph: tsp.graph.UndirectedGraph) {
            return new PheronomTrail(this._map, graph);
        }

        /** Create a visual representation of a route.
            @param route The route to show.
        */
        createRoute(route: tsp.graph.Route, color: string) {
            return new GoogleRoute(this._map, route, color);
        }

        /** Create a trail object
        
        */
        createGraph(graph: tsp.graph.UndirectedGraph) {
            return new GoogleGraph(graph, this._map);
        }

        /** Create a trail object
        
        */
        createDistanceWeb(graph: tsp.graph.UndirectedGraph) {
            return new GoogleDistanceCobweb(graph, this._map);
        }
    }

    /** A visual representation of a route */
    export class GoogleRoute implements GoogleMapsComponent {
        private _lines: google.maps.Polyline[];
        private _map: google.maps.Map;
        private _route: tsp.graph.Route;

        color: string;

        /**
            Creates polylines foreach route part.
            @param map The google map to render the polylines to.
            @param route The route to show.
        */
        constructor(map: google.maps.Map, route: tsp.graph.Route, color: string) {
            this.color = color;
            this._route = route;
            this._lines = [];
            this._map = map;
            var edges = route.getEdges();

            _.forEach(edges, (edge: tsp.graph.Edge) => {
                var from = <tsp.visual.graph.GoogleAddressVertex>edge.from;
                var to = <tsp.visual.graph.GoogleAddressVertex>edge.to;
                var line = new google.maps.Polyline({
                    path: [from.location, to.location],
                    strokeColor: color,
                    strokeOpacity: 1,
                    strokeWeight: 7,
                });
                line.setMap(this._map);
                this._lines.push(line);
            });
        }

        /** Show all polylines */
        show() {
            _.forEach(this._lines, p => p.setMap(this._map));
        }

        /** Hide all polylines */
        hide() {
            _.forEach(this._lines, p => p.setMap(null));
        }
    }
}
