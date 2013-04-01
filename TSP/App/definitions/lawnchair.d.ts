class Lawnchair {
    constructor(callback: () => void );
    keys(callback: (keys:string[]) => void);
    /** save an object */
    save(obj, callback?: (obj) => void );

    /** batch save array of objs */
    batch(array, callback);

    /** retrieve obj (or array of objs) and apply callback to each */
    get (key : string, callback: (obj) => void);

    /** check if exists in the collection passing boolean to callback */
    exists(key: string, callback: (exists:bool) => void);

    /** iterate collection passing: obj, index to callback */
    each(callback: (record,index:number) => void);

    /** returns all the objs to the callback as an array */
    all(callback: (records : Array) => void);

    /** remove a doc or collection of em */
    remove(key: string, callback);

        /** destroy everything */
    nuke(callback?);
}
declare function Lawnchair(callback: (context : Lawnchair) => void) : Lawnchair;