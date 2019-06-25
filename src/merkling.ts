import MerklingSession from './merklingSession'
import {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getCidSymbol,
  resolveSymbol,
  getStateSymbol
} from './symbols'
import { IIpfsNode, IMerklingOptions, ICid } from './domain'

// eslint-disable-next-line
type Proxy = any | string | number | undefined | null

/**
 * The core IPLD access client.
 */
export class Merkling {
  private _ipfs: IIpfsNode

  constructor(options: IMerklingOptions) {
    this._ipfs = options.ipfs
  }

  /**
   * Create a new merkling session to act as an
   * intermediary with the IPFS node.
   *
   * @returns {MerklingSession} a new merkling session
   */
  createSession(): MerklingSession {
    return new MerklingSession({ ipfs: this._ipfs })
  }

  /**
   * Run an action in the form of a callback over a new session
   * that is disposed of afterwards.
   *
   * @param sessionAction an action func that operates on the new session
   * @returns a promise that completes after the session action
   */
  async withSession(
    sessionAction: (session: MerklingSession) => void
  ): Promise<void> {
    const session = this.createSession()

    await sessionAction(session)
  }

  /**
   * Retrieve the CID for given proxy. Will returned
   * undefined if the passed object is not a Merkling proxy
   * and will return null if the proxy is dirty.
   *
   * @param proxy the object to get the CID for
   * @return the CID or undefined if the object will never
   * have a CID or null if it is currently dirty
   */
  static cid(proxy: Proxy): ICid | null | undefined {
    if (!Merkling.isProxy(proxy)) {
      return undefined
    }

    if (!Merkling.isIpldNode(proxy)) {
      return undefined
    }

    return proxy[getCidSymbol]
  }

  /**
   * Asynchronously force the retrieval of the state
   * stored in IPFS of the IPLD block the proxy represents.
   *
   * @param proxy An IPLD block proxy
   * @returns the given proxy now loaded and clean.
   */
  static async resolve(proxy: Proxy): Promise<Proxy> {
    if (!this.isProxy(proxy)) {
      return proxy
    }

    await proxy[resolveSymbol]

    return proxy
  }

  /**
   * Retreive the stored state that the Merkling proxy
   * is representing. This will include references
   * to other Merkling proxies.
   *
   * @param proxy the proxy to inspect
   * @return the internal state of the IPLD block being represented
   */
  static inspect(proxy: Proxy): {} {
    if (!this.isProxy(proxy)) {
      return proxy
    }

    return proxy[getStateSymbol]
  }

  /**
   * Determine whether a given object is a tracked Merkling
   * proxy.
   *
   * @param potentialProxy
   * @returns the answer
   */
  static isProxy(potentialProxy: Proxy): boolean {
    if (!potentialProxy) {
      return false
    }

    return !!potentialProxy[isProxySymbol]
  }

  /**
   * Determine whether a given object is a Merkling
   * proxy representing an IPLD block.
   *
   * @param potentialIpldNode
   * @returns the answer
   */
  static isIpldNode(potentialIpldNode: Proxy): boolean {
    if (!potentialIpldNode) {
      return false
    }

    return !!potentialIpldNode[isIpldNodeSymbol]
  }

  /**
   * Determine if a proxy has unsaved changes. Will
   * return true if the passed object is not a proxy.
   *
   * @param proxy the object to test
   * @returns the answer
   */
  static isDirty(proxy: Proxy): boolean {
    if (!Merkling.isProxy(proxy)) {
      return true
    }

    return !!proxy[isDirtySymbol]
  }
}
