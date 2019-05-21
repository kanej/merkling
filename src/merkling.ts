import MerklingSession from './merklingSession'
import {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getCidSymbol
} from './symbols'

export interface IIpfsNode {
  dag: {
    put: Function
    get: Function
  }
}

export interface ICid {
  codec: string
  version: number
  multihash: ArrayBuffer
  toBaseEncodedString: () => string
}

export interface IIpldNode {
  value: {}
  remainderPath: string
  cid: ICid
}

export interface IMerklingOptions {
  ipfs: IIpfsNode
}

// eslint-disable-next-line
type Proxy = any | string | number | undefined | null

export class Merkling {
  private _ipfs: IIpfsNode

  constructor(options: IMerklingOptions) {
    this._ipfs = options.ipfs
  }

  static isProxy(potentialProxy: Proxy): boolean {
    if (!potentialProxy) {
      return false
    }

    return !!potentialProxy[isProxySymbol]
  }

  static isIpldNode(potentialIpldNode: Proxy): boolean {
    if (!potentialIpldNode) {
      return false
    }

    return !!potentialIpldNode[isIpldNodeSymbol]
  }

  static isDirty(proxy: Proxy): boolean {
    if (!Merkling.isProxy(proxy)) {
      return true
    }

    return !!proxy[isDirtySymbol]
  }

  static cid(proxy: Proxy): ICid | null | undefined {
    if (!Merkling.isProxy(proxy)) {
      return undefined
    }

    if (!Merkling.isIpldNode(proxy)) {
      return undefined
    }

    return proxy[getCidSymbol]
  }

  createSession(): MerklingSession {
    return new MerklingSession({ ipfs: this._ipfs })
  }
}
