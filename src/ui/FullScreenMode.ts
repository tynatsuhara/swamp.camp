export const FullScreenMode = {
    isFullScreen: () => {
        return !!document.fullscreenElement
    },

    exit: () => {
        document.exitFullscreen().then(() => {
            console.log("fullscreen disabled")
        })
    },

    enter: () => {
        document
            .getElementById("column")
            .requestFullscreen({
                navigationUI: "hide",
            })
            .then(() => {
                console.log("fullscreen enabled")
            })
    },
}
