export const Mouse = {
    lock: () => {
        document.body.requestPointerLock();
    },

    unlock: () => {
        // Ask the browser to release the pointer
        document.exitPointerLock();
    },

    hide: () => {
        document.body.style['cursor'] = 'none'
    },

    show: () => {
        document.body.style['cursor'] = 'url(cursor.png), default'
    },
}