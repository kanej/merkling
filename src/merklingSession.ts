import CID from 'cids'
import {
  IMerklingInternalRecord,
  MerklingProxyType,
  MerklingLifecycleState,
  merklingProxyHandler,
  IMerklingProxyState,
  MerklingProxyRef
} from './merklingProxyHandler'
import IpfsWrapper from './ipfsWrapper'
import Serialiser from './serialiser'
import InternalGraph from './internalGraph'
import { IIpfsNode, ICid } from './domain'

interface IInternalisedStateResult {
  // eslint-disable-next-line
  state: any
  childInternalIds: number[]
}

export default class MerklingSession {
  /** @private the IPFS node */
  _ipfs: IpfsWrapper
  /** @private the internal counter of IPLD blocks loaded into the session */
  _ipldIdCounter: number
  /** @private the identity map and internal record keeping of the loaded IPLD blocks */
  _ipldNodeEntries: Map<number, IMerklingInternalRecord>
  /** @private a mapping proxies that exist in the session */
  _proxies: Map<string, {}>
  /** @private the serialiser and deserialization layer on going to and from IPFS */
  _serialiser: Serialiser
  /** @private the internal graph of IPLD block to IPLD block relationships */
  _internalGraph: InternalGraph

  constructor({ ipfs }: { ipfs: IIpfsNode }) {
    this._ipfs = new IpfsWrapper(ipfs)
    this._ipldIdCounter = 0
    this._ipldNodeEntries = new Map<number, IMerklingInternalRecord>()
    this._proxies = new Map<string, IMerklingProxyState>()

    this._internalGraph = new InternalGraph()
    this._serialiser = new Serialiser(
      (id: number): ICid => {
        const record = this._ipldNodeEntries.get(id)

        if (!record) {
          throw new Error('Ref to unknown IPLD node - ' + id)
        }

        const cid = record.cid

        if (!cid) {
          throw new Error('Attempted to serialize unsaved IPLD node')
        }

        return cid
      }
    )
  }

  /**
   * Create a new dirty Merkling proxy that can be manipulated
   * before later being persisted.
   *
   * @param objState a js object of the state for the IPLD block
   * @returns a proxy representing the given state as an IPLD block
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T>(objState: T): T {
    if (objState === null || typeof objState !== 'object') {
      return objState
    }

    const { state, childInternalIds } = this._internaliseState(objState)
    const record: IMerklingInternalRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      state: state
    }

    const proxyId: MerklingProxyRef = new MerklingProxyRef({
      internalId: record.internalId,
      type: record.type,
      path: []
    })

    const proxy = new Proxy(
      {
        ref: proxyId,
        session: this
      },
      merklingProxyHandler
    )

    this._addIpldNodeEntry(record)

    for (const childInternalId of childInternalIds) {
      this._internalGraph.link(record.internalId, childInternalId)
    }

    // eslint-disable-next-line
    return (proxy as any) as T
  }

  /**
   * Get an IPLD block from IPFS and return
   * it as a tracked Merkling proxy.
   * @param hashOrCid a CID or base encoded version
   * @returns a clean proxy with the state loaded and accessible
   */
  // eslint-disable-next-line
  async get(hashOrCid: string | ICid): Promise<any> {
    const cid = this._toCid(hashOrCid)
    const state = await this._readStateFromIpfs(cid)

    const record: IMerklingInternalRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.CLEAN,
      cid: cid,
      state: state
    }

    const proxyId: MerklingProxyRef = new MerklingProxyRef({
      internalId: record.internalId,
      type: record.type,
      path: []
    })

    this._addIpldNodeEntry(record)

    const proxy = new Proxy(
      {
        ref: proxyId,
        session: this
      },
      merklingProxyHandler
    )

    return proxy
  }

  load(hash: string | ICid): IMerklingProxyState {
    const proxyId = this._loadCidIntoSession(hash)

    const proxy = new Proxy(
      {
        ref: proxyId,
        session: this
      },
      merklingProxyHandler
    )

    return proxy
  }

  /**
   * Save all proxies that are currently marked as dirty,
   * and any proxies that depend on them.
   */
  async save(): Promise<void> {
    for (const ipldNodeId of this._internalGraph.topologicalSort()) {
      const entry = this._ipldNodeEntries.get(ipldNodeId)

      if (!entry) {
        throw new Error(
          `Failure of topological sort - no node with id ${ipldNodeId}`
        )
      }

      await this._recursiveSaveIpldNode(entry)
    }
  }

  /**
   * @private Given a merkling ref, retreive its state
   * from IPFS and update the internal record.
   *
   * @param ref a proxy ref to resolve
   * @returns a promise complete with the retrieval
   */
  async _resolveRef(ref: MerklingProxyRef): Promise<void> {
    const record = this._ipldNodeEntries.get(ref.internalId)

    if (!record) {
      return
    }

    if (!record.cid) {
      throw new Error('Attempt to resolve ref without CID')
    }

    const state = await this._readStateFromIpfs(record.cid)

    record.state = state
    record.lifecycleState = MerklingLifecycleState.CLEAN
  }

  /**
   * @private Given an internal record mark it as dirty and
   * all loaded ancestors in the graph.
   *
   * @param internalId
   */
  _markRecordAndAncestorsAsDirty(internalId: number): void {
    const recordAndAncestorsIds = this._internalGraph.ancestorsOf(internalId)

    let currentId = recordAndAncestorsIds.pop()

    if (!currentId) {
      throw Error('Internal graph returned no nodes in the ancestor lookup')
    }

    while (currentId !== undefined) {
      let currentRecord = this._ipldNodeEntries.get(currentId)

      if (!currentRecord) {
        throw new Error(
          'Internal graph returned an internal id of a non-existant IPLD block'
        )
      }

      currentRecord.lifecycleState = MerklingLifecycleState.DIRTY
      currentRecord.cid = null

      currentId = recordAndAncestorsIds.pop()
    }
  }

  // eslint-disable-next-line
  _internaliseState(obj: any): IInternalisedStateResult {
    const childIds = new Set<number>()
    const internalLinker = (internalId: number): void => {
      childIds.add(internalId)
    }

    const internalisedState = this._serialiser.internalise(obj, internalLinker)

    return {
      state: internalisedState,
      childInternalIds: Array.from(childIds)
    }
  }

  private _loadCidIntoSession(hash: string | ICid): MerklingProxyRef {
    const record: IMerklingInternalRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.UNLOADED,
      cid: this._toCid(hash),
      state: undefined
    }

    const proxyId: MerklingProxyRef = new MerklingProxyRef({
      internalId: record.internalId,
      type: record.type,
      path: []
    })

    this._addIpldNodeEntry(record)

    return proxyId
  }

  private _addIpldNodeEntry(record: IMerklingInternalRecord): void {
    this._ipldNodeEntries.set(record.internalId, record)
    this._internalGraph.add(record.internalId)
  }

  // eslint-disable-next-line
  private async _recursiveSaveIpldNode(
    record: IMerklingInternalRecord
  ): Promise<void> {
    if (!record || record.type !== MerklingProxyType.IPLD) {
      throw new Error('Cannot recursively save a non-ipld node')
    }

    if (record.lifecycleState !== MerklingLifecycleState.DIRTY) {
      return
    }

    const cid = await this._saveRecordToIpfs(record)

    record.cid = cid
    record.lifecycleState = MerklingLifecycleState.CLEAN
  }

  private async _saveRecordToIpfs(
    record: IMerklingInternalRecord
  ): Promise<ICid> {
    const serializedState = this._serialiser.serialise(record.state)
    return this._ipfs.put(serializedState)
  }

  // eslint-disable-next-line
  private async _readStateFromIpfs(cid: ICid): Promise<any> {
    const ipldNode = await this._ipfs.get(cid.toBaseEncodedString())

    const substitutedState = this._serialiser.deserialise(
      ipldNode.value,
      (cid: ICid | string): MerklingProxyRef => this._loadCidIntoSession(cid)
    )

    return substitutedState
  }

  private _toCid(hash: string | ICid): ICid {
    if (typeof hash === 'string') {
      return new CID(hash)
    } else {
      return hash as ICid
    }
  }
}
