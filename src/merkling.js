'use strict'

const Promise = require('bluebird')
const CID = require('cids')

const { IpldProxy } = require('./ipld')

const Merkling = function (options) {
  if (!options.ipfs) {
    throw Error('IPFS must be passed as an option to Merkling')
  }

  this.ipfs = options.ipfs
  this.ipldProxy = new IpldProxy()

  // save
  // if normal object - convert to dirty then *save* object
  // if saved or unloaded - do nothing
  // if dirty then recursively_save on properties then persist the object itself

  // recursively_save
  // if normal object - recursively save on properties
  // if saved or unloaded - do nothing
  // if dirty then recursively *save*

  this.save = (elem) => {
    if (!elem) {
      throw Error('Argument exception, trying to save null or undefined')
    }

    const objToPersist = this.ipldProxy.isIpld(elem)
      ? elem
      : this.ipldProxy.createDirtyNode(elem)

    return this._persist(objToPersist)
  }

  this._persist = (elem) => {
    return new Promise((resolve, reject) => {
      if (this.ipldProxy.isPersisted(elem)) {
        return resolve(elem)
      }

      const subpersists = Object.keys(elem).map(key => {
        return typeof elem[key] === 'object'
          ? this._persist(elem[key])
          : null
      }).filter(Boolean)

      return Promise.all(subpersists).then(() => {
        const dagNode = this._substituteMerkleLinks(elem)

        this.ipfs.dag.put(dagNode, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
          if (err) {
            return reject(err)
          }

          this.ipldProxy.transition(elem, { transition: 'save', cid: cid })

          return resolve(elem)
        })
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
        const merkleProxy = this.ipldProxy.createSavedNode(id, node)

        resolve(merkleProxy)
      })
    })
  }

  this.create = (obj) => {
    return this.ipldProxy.createDirtyNode(obj)
  }

  this._substituteMerkleLinks = (elem) => {
    const dagNode = this.ipldProxy.extract(elem)

    Object.keys(dagNode).forEach(key => {
      if ((typeof dagNode[key] !== 'object')) {
        return
      }

      if (this.ipldProxy.isIpld(dagNode[key])) {
        if (!this.ipldProxy.isPersisted(dagNode[key])) {
          throw Error('Attempting substitution on unpersisted ipld node')
        }

        dagNode[key] = this._convertToMerkleLinkObject(dagNode[key])
      } else {
        this._substituteMerkleLinks(dagNode[key])
      }
    })

    return dagNode
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

  this._convertToMerkleLinkObject = (obj) => {
    return {
      '/': obj._cid.toBaseEncodedString()
    }
  }

  this._convertFromMerkleLinkObject = (link) => {
    return this.ipldProxy.createLinkNode(new CID(link['/']))
  }

  this._isMerkleLinkObject = (obj) => {
    return (typeof obj === 'object') && obj.hasOwnProperty('/')
  }

  return this
}

module.exports = Merkling
