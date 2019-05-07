import MerklingSession, { isProxySymbol, isIpldNodeSymbol, isDirtySymbol, getCidSymbol } from "./merklingSession";

export interface IIpfsNode {
  put(state: {}): Promise<string>;
}

export interface IMerklingOptions {
  ipfs?: IIpfsNode
}

export class Merkling {
  private _ipfs: IIpfsNode

  constructor(options: IMerklingOptions) {
    this._ipfs = options.ipfs || (window as any).ipfs
  }

  static isProxy(potentialProxy: any) {
    if(!potentialProxy) {
      return false
    }

    return !!potentialProxy[isProxySymbol]
  }

  static isIpldNode(potentialIpldNode: any) {
    if(!potentialIpldNode) {
      return false
    }

    return !!potentialIpldNode[isIpldNodeSymbol]
  }

  static isDirty(proxy: any) {
    if(!Merkling.isProxy(proxy)) {
      return true
    }

    return !!proxy[isDirtySymbol]
  }

  static cid(proxy: any) {
    if(!Merkling.isProxy(proxy)) {
      return null
    }

    return proxy[getCidSymbol]
  }

  createSession() {
    return new MerklingSession({ ipfs: this._ipfs })
  }
}
