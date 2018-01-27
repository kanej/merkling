'use strict'

const Promise = require('bluebird')
const CID = require('cids')

const Merkling = function (options) {
  if (!options.ipfs) {
    throw Error('IPFS must be passed as an option to Merkling')
  }

  this.ipfs = options.ipfs

  this._substituteMerkleLinks = (elem) => {
    const dagNode = Object.assign({}, elem)

    Object.keys(dagNode).forEach(key => {
      if (!(typeof dagNode[key] === 'object')) {
        return
      }

      if (this._isMerkleLink(dagNode[key])) {
        dagNode[key] = this._convertToMerkleLinkObject(dagNode[key])
      } else {
        this._substituteMerkleLinks(dagNode[key])
      }
    })

    return dagNode
  }

  this._convertToMerkleLinkObject = (obj) => {
    return {
      '/': obj._cid.toBaseEncodedString()
    }
  }

  this._convertFromMerkleLinkObject = (link) => {
    const cid = new CID(link['/'])
    const MerkleLinkProxy = {
      get (target, key) {
        if (key === '_cid') {
          return cid
        }

        if (typeof key !== 'string' || key === 'inspect') {
          return target[key]
        }

        throw Error(`Merkle link <${cid.toBaseEncodedString}> not loaded so access '${key.toString()}' failed`)
      }
    }

    return new Proxy({}, MerkleLinkProxy)
  }

  this._isMerkleLink = (obj) => {
    return obj && obj._cid && CID.isCID(obj._cid)
  }

  this.save = (elem) => {
    return new Promise((resolve, reject) => {
      const dagNode = this._substituteMerkleLinks(elem)
      this.ipfs.dag.put(dagNode, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
        if (err) {
          return reject(err)
        }

        var merkleProxy = this._createMerkleProxy(cid, elem)

        return resolve(merkleProxy)
      })
    })
  }

  this.get = (cid) => {
    return new Promise((resolve, reject) => {
      this.ipfs.dag.get(cid, (err, block) => {
        if (err) {
          reject(err)
        }

        const id = CID.isCID(cid) ? cid : new CID(cid)
        const node = this._substituteMerkleLinkProxies(block.value)
        const merkleProxy = this._createMerkleProxy(id, node)

        resolve(merkleProxy)
      })
    })
  }

  this._substituteMerkleLinkProxies = (obj) => {
    const merkleNode = Object.assign({}, obj)

    Object.keys(merkleNode).forEach(key => {
      if (typeof merkleNode[key] === 'object') {
        if (this._isMerkleLinkObject(merkleNode[key])) {
          merkleNode[key] = this._convertFromMerkleLinkObject(merkleNode[key])
        } else {
          this._substituteMerkleLinkProxies(merkleNode[key])
        }
      }
    })

    return merkleNode
  }

  this._createMerkleProxy = (cid, obj, loaded = true) => {
    return new Proxy(obj, {
      loaded: loaded,
      get (target, key) {
        if (key === '_cid') {
          return cid
        }

        if (!this.loaded) {
          throw Error(`Merkle node <${cid.toBaseEncodedString()}> not loaded`)
        }

        return target[key]
      }
    })
  }

  this._isMerkleLinkObject = (obj) => {
    return (typeof obj === 'object') && obj.hasOwnProperty('/')
  }

  return this
}

module.exports = Merkling
