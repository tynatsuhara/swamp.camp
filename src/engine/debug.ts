export const debug = Object.assign({}, {
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

// wrap the DEBUG state so that property changes are observed and saved in local storage
function observe(obj) {
    const result = {}
    Object.entries(obj).forEach(([key, val]) => {
        Object.defineProperty(result, key, {
            get: function () {
                return val
            },
            set: function (value) {
                debug[key] = value
                localStorage.setItem("debug_state", JSON.stringify(debug))
            },
            enumerable: true,
            configurable: true
        })
    })
    return result
}

window['debug'] = observe(debug)