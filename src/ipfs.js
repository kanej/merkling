'use strict'

const IPFS = require('ipfs')
const Promise = require('bluebird')

const setupNode = () => {
  return new Promise((resolve, reject) => {
    const node = new IPFS({
      silent: true,
      config: {
        silent: true
      }
    })

    node.on('ready', () => {
      resolve(node)
    })
  })
}

const shutdownNode = (node) => {
  node.stop(() => {
    console.log('finished.')
    process.exit()
  })
}

module.exports = {
  setupNode: setupNode,
  shutdownNode: shutdownNode
}
