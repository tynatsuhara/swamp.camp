const _debug = Object.assign({}, {
    showColliders: false,
    showProfiler: false
}, loadDebug())

function loadDebug(): any {
    const stored = localStorage.getItem("debug_state")
    if (stored) {
        console.log("loaded debug state from local storage")
        return JSON.parse(stored)
    }
    return {}
}

export const debug = new Proxy(_debug, {
    set(target, property, value, receiver) {
        let success = Reflect.set(target, property, value, receiver);
        if (success) {
            localStorage.setItem("debug_state", JSON.stringify(_debug))
        }
        return success;
    }
});

window['debug'] = debug