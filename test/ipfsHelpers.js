'use strict'

const IPFS = require('ipfs')

const setupNode = () => {
  return new Promise((resolve, reject) => {
    const node = new IPFS({
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.on('ready', () => {
      resolve(node)
    })
  })
}

const shutdownNode = (node) => {
  return new Promise((resolve, reject) => {
    node.stop((err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

const withIpfs = (callback) => {
  var withIpfsNode
  return setupNode().then(node => {
    withIpfsNode = node
    return callback(node)
  }).then(() => {
    return shutdownNode(withIpfsNode)
  })
}

module.exports = {
  setupNode: setupNode,
  shutdownNode: shutdownNode,
  withIpfs: withIpfs
}
