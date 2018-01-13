'use strict'
const Promise = require('bluebird')
const CID = require('cids')

const Merkling = function (options) {
  if (!options.ipfs) {
    throw Error('IPFS must be passed as an option to Merkling')
  }

  this.ipfs = options.ipfs

  this.save = (elem) => {
    return new Promise((resolve, reject) => {
      this.ipfs.dag.put(elem, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
        if (err) {
          reject(err)
        }

        elem._cid = cid

        resolve(elem)
      })
    })
  }

  this.get = (cid) => {
    return new Promise((resolve, reject) => {
      this.ipfs.dag.get(cid, (err, block) => {
        if (err) {
          reject(err)
        }

        var elem = block.value
        console.log(block)

        if (CID.isCID(cid)) {
          elem._cid = cid
        } else {
          elem._cid = new CID(cid)
        }

        resolve(elem)
      })
    })
  }

  return this
}

module.exports = Merkling
