export const DEBUG = loadDebug() || {
    showColliders: false
}

function loadDebug(): any {
    const stored = localStorage.state
    if (stored) {
        console.log("loaded debug state from local storage")
        return JSON.parse(stored)
    }
}

// wrap the DEBUG state so that property changes are observed and saved in local storage
function observe(obj) {
    const result = {}
    Object.entries(obj).forEach(([key, val]) => {
        Object.defineProperty(result, key, {
            get: function () {
                return val;
            },
            set: function (value) {
                DEBUG[key] = value
                localStorage.state = JSON.stringify(DEBUG)
            },
            enumerable: true,
            configurable: true
        });
    })
    return result
}

window['debug'] = observe(DEBUG)