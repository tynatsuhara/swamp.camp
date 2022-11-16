const IGNORED_ERRORS = ["Trystero: received message with unregistered type"]

export const initializeLogging = () => {
    const errorLog = console.error
    // wrap console.error for more nuanced control
    console.error = (message?: any, ...optionalParams: any[]) => {
        if (IGNORED_ERRORS.some((pattern) => `${message}`.includes(pattern))) {
            return
        }

        errorLog(message, ...optionalParams)
    }
}
