class Simrou {
    constructor(initialRoutes?: Route[]);
    eventSupported: bool;
    addRoute(pattern: string, caseSensitive?: bool);
    addRoutes(routes: Route[], caseSensitive?: bool);
    removeRoute(route: Route);
    navigate(hash: string);
    resolve(hash: string, method: string);
    getHash(url?: string);
    resolveHash(event);
    handleFormSubmit(event);
    listen();
    start(initialHash?: string, observeHash?: bool, observeForms?: bool);
    stop();
}

class Route {
    constructor(pattern: string, caseSensitive?: bool);
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