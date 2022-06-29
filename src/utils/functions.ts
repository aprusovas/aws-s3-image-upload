type CallbackToPromiseHandler<T> = (cb: (err?: any, res?: T) => void) => void

/**
 * Helper function allows to convert callback style to promise
 * @param {CallbackToPromiseHandler<Result>} handler Handler
 * @returns {Promise<Result | undefined>} Promise
 */
export function callbackToPromise<Result>(handler: CallbackToPromiseHandler<Result>): Promise<Result | undefined> {
    return new Promise<Result | undefined>((resolve, reject) => {
        handler((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

/**
 * Converts bytes to Human readable form
 * @param bytes {number} Bytes
 * @returns {string} Bytes in Human readable form
 */
export function bytesToSize(bytes: number): string {
    if (bytes === 0) {
        return '0 Bytes'
    }

    const base = 1000
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const exponent = Math.floor(Math.log(bytes) / Math.log(base))

    return `${parseFloat((bytes / Math.pow(base, exponent)).toFixed(2))} ${sizes[exponent]}`
 }