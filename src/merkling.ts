import MerklingSession, {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getCidSymbol
} from './merklingSession'

export interface IIpfsNode {
  put(state: {}): Promise<string>
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

  static cid(proxy: Proxy): string | null {
    if (!Merkling.isProxy(proxy)) {
      return null
    }

    return proxy[getCidSymbol]
  }

  createSession(): MerklingSession {
    return new MerklingSession({ ipfs: this._ipfs })
  }
}
