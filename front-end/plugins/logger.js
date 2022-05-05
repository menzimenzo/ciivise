const logger = function(name) {
    const debug = require('debug')('aaq-frontend:debug:' + name)
    const info = require('debug')('aaq-frontend:info:' + name)
    const warn = require('debug')('aaq-frontend:warn:' + name)
    return {
        d: function(message, ...args) {
            if (debug.enabled) {
                debug('[DEBUG]', message, ...args)
            }
        },
        i: function(message, ...args) {
            if (debug.enabled) {
                debug('[INFO]', message, ...args)
            } else if (info.enabled) {
                info('[INFO]', message)
            }
        },
        w: function(...args) {
            if (debug.enabled) {
                debug('[WARN]', ...args)
            } else if (info.enabled) {
                info('[WARN]', ...args)
            } else if (warn.enabled) {
                warn('[WARN]', ...args)
            }
        }
    }
}

export default logger
