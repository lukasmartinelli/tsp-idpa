declare class Simrou {
    constructor(initialRoutes?: Route[]);
    eventSupported: boolean;
    addRoute(pattern: string, caseSensitive?: boolean);
    addRoutes(routes: Route[], caseSensitive?: boolean);
    removeRoute(route: Route);
    navigate(hash: string);
    resolve(hash: string, method: string);
    getHash(url?: string);
    resolveHash(event);
    handleFormSubmit(event);
    listen();
    start(initialHash?: string, observeHash?: boolean, observeForms?: boolean);
    stop();
    }

declare class Route {
    constructor(pattern: string, caseSensitive?: boolean);
    match(hash: string);
    assembly(values: any[]);
    toString(): string;
    attachAction(action, method?: string);
    attachActions(actions, method?: string);
    detachAction(action, method?: string);
    shortcut(method: string);
    get ();
    post();
    put();
    delete ();
    any();
}
