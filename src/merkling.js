'use strict'

const CID = require('cids')
const { IpldProxy } = require('./ipld')

/**
 * Merkling entrypoint
 * @constructor
 * @param {Object} options setup options for this merkling instance
 */
const Merkling = function (options) {
  if (!options || !options.ipfs) {
    throw Error('IPFS must be passed as an option to Merkling')
  }

  this.ipfs = options.ipfs
  this.ipldProxy = new IpldProxy()

  /**
   * Create an IPLD node from a js object.
   * The IPLD node must be saved before it is persisted.
   * @param {Object} obj a js object
   * @returns {Object} an unsaved IPLD node
   */
  this.create = (obj) => {
    return this.ipldProxy.createDirtyNode(obj)
  }

  /**
   * Persist a js object or IPLD node to the IPLD graph
   * @param {Object} obj a js object or IPLD node
   */
  this.save = (obj) => {
    if (!obj) {
      throw Error('Argument exception, trying to save null or undefined')
    }

    if (this.ipldProxy.isIpld(obj)) {
      if (this.ipldProxy.isPersisted(obj)) {
        return new Promise(resolve => resolve(obj))
      } else {
        return this._persist(obj)
      }
    } else {
      const dirtyNode = this.ipldProxy.createDirtyNode(obj)
      return this._persist(dirtyNode)
    }
  }

  /**
   * Given an IPLD id, retrieve the value from the IPLD graph
   * as a js object
   * @param {Object|String} cid
   * @returns {Object} an IPLD node
   */
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

  this._persist = (elem) => {
    return new Promise((resolve, reject) => {
      if (this.ipldProxy.isPersisted(elem)) {
        return resolve(elem)
      }

      const subpersists = Object.keys(elem)
        .filter(key => elem[key])
        .map(key => {
          return typeof elem[key] === 'object'
            ? this._persist(elem[key])
            : null
        }).filter(Boolean)

      return Promise.all(subpersists).then(() => {
        if (!this.ipldProxy.isIpld(elem)) {
          return resolve(elem)
        }

        const dagNode = this._substituteMerkleLinks(elem)

        this.ipfs.dag.put(dagNode, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
          if (err) {
            return reject(err)
          }

          this.ipldProxy.transition(elem, { transition: 'save', cid: cid })

          return resolve(elem)
        })
      }).catch(reject)
    })
  }

  this._substituteMerkleLinks = (elem) => {
    if (!elem) {
      return elem
    }

    const dagNode = this.ipldProxy.extract(elem)

    Object.keys(dagNode).forEach(key => {
      if ((typeof dagNode[key] !== 'object')) {
        return
      }

      if (this.ipldProxy.isIpld(dagNode[key])) {
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
