/// <reference path="../definitions/knockout.d.ts" />

module tsp.ui.wizard {
    export interface Step {
        enter(args: any);
        completed: KnockoutObservableBool;
        key: string;
    }

    /** The wizard is responsible for the whole flow of creating a graph, calculating the route and displaying it. */
    export class Wizard {
        /** The current step wrapped into an Observable*/
        private _steps: Step[];
        isActive(key: string) {
            if (key == 'start') {
                return true;
            } else if (key == 'graph') {
                return this['start'].completed();
            } else if (key == 'algorithm') {
                return this['graph'].completed();
            } else if (key == 'result') {
                return this['algorithm'].completed();
            }
        }
        isVisible(name: string) {
            return this.currentStep() == name;
        }
        currentStep = ko.observable();
        constructor(steps: Step[]) {
            this._steps = steps;
            _.forEach(this._steps, (step, i) => {
                this[step.key] = step; //Workaround because knockout cannot access indexer we use the name
            });
        }
    }
}