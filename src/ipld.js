'use strict'

const CID = require('cids')

const cidSymbol = Symbol.for('merkling#cid')
const statusSymbol = Symbol.for('merkling#status')

const IpldProxyExtension = {
  get (target, key) {
    if (key === cidSymbol) {
      const status = target[statusSymbol]
      if (status === 'UNLOADED' || status === 'SAVED') {
        return target[cidSymbol]
      }

      if (status === 'DIRTY') {
        throw Error('Can\'t read CID of unloaded ipld node')
      }
    }

    if (key === '_cid') {
      return target[cidSymbol]
    }

    if (typeof key !== 'string' || key === 'inspect') {
      return target[key]
    }

    return target[key]
  },

  set (target, key, value) {
    if (key === statusSymbol || key === cidSymbol) {
      Reflect.set(...arguments)
      return true
    }

    if (target[statusSymbol] === 'SAVED') {
      target[cidSymbol] = undefined
      target[statusSymbol] = 'DIRTY'
      Reflect.set(...arguments)
      return true
    }

    if (target[statusSymbol] === 'UNLOADED') {
      return false
    }

    Reflect.set(...arguments)
    return true
  }
}

class IpldProxy {
  constructor () {
    this.UNLOADED = 'UNLOADED'
    this.SAVED = 'SAVED'
    this.DIRTY = 'DIRTY'
    this.TEMP = 'TEMP'

    this.allowedStatuses = [this.UNLOADED, this.SAVED, this.DIRTY]
  }

  isIpld (obj) {
    return obj && this.allowedStatuses.includes(obj[statusSymbol])
  }

  isPersisted (obj) {
    return obj && (obj[statusSymbol] === this.UNLOADED || obj[statusSymbol] === this.SAVED)
  }

  isSaved (obj) {
    return obj && obj[statusSymbol] === this.SAVED
  }

  isDirty (obj) {
    return obj && obj[statusSymbol] === this.DIRTY
  }

  create (cid, status, obj) {
    if (!this.allowedStatuses.includes(status)) {
      throw Error('Unrecognized status ' + status)
    }

    obj[cidSymbol] = cid
    obj[statusSymbol] = status
    return new Proxy(obj, IpldProxyExtension)
  }

  createDirtyNode (obj) {
    return this.create(null, this.DIRTY, obj)
  }

  createSavedNode (cid, obj) {
    const id = CID.isCID(cid) ? cid : new CID(cid)
    return this.create(id, this.SAVED, obj)
  }

  createLinkNode (cid) {
    const id = CID.isCID(cid) ? cid : new CID(cid)

    const linkObj = {
      '/': id.toBaseEncodedString()
    }

    return this.create(id, this.UNLOADED, linkObj)
  }

  readCID (obj) {
    return obj[cidSymbol]
  }

  transition (node, options) {
    const { transition } = options
    switch (transition) {
      case 'load':
        if (node[statusSymbol] !== this.UNLOADED) {
          throw Error(`Transition not allowed ${transition} in state ${node[statusSymbol]}`)
        }

        this._loadLink(node, options)
        break
      case 'save':
        if (node[statusSymbol] !== this.DIRTY) {
          throw Error(`Transition not allowed ${transition} in state ${node[statusSymbol]}`)
        }

        this._saveDirty(node, options)
        break
      default:
        throw Error('Unknown transition ' + transition)
    }
  }

  extract (obj) {
    if (!this.isIpld(obj)) {
      return obj
    }

    const status = obj[statusSymbol]
    obj[statusSymbol] = this.TEMP
    const objCopy = Object.assign({}, obj)
    delete objCopy[statusSymbol]
    delete objCopy[cidSymbol]
    obj[statusSymbol] = status
    return objCopy
  }

  _loadLink (node, { object }) {
    node[statusSymbol] = null
    delete node['/']
    Object.assign(node, object)
    node[statusSymbol] = this.SAVED
  }

  _saveDirty (node, { cid }) {
    node[statusSymbol] = this.SAVED
    node[cidSymbol] = cid
  }
}

module.exports = {
  IpldProxy: IpldProxy
}
