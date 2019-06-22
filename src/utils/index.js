'use strict'

/**
 * Converts bytes to GB
 * @param {Number} bytes
 * @returns {String}
 */
exports.bytesToGB = function bytesToSize(bytes) {
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)

  return `${(bytes / (1024 ** i)).toFixed(1)}GB`
}
