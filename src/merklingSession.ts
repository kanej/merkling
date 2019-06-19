import CID from 'cids'
import { IIpfsNode, ICid } from './merkling'
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

export default class MerklingSession {
  _ipfs: IpfsWrapper
  _ipldIdCounter: number
  _ipldNodeEntries: Map<number, IMerklingInternalRecord>
  _proxies: Map<string, {}>
  _serialiser: Serialiser
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T>(objState: T): T {
    if (objState === null || typeof objState !== 'object') {
      return objState
    }

    const record: IMerklingInternalRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      state: objState
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

    // eslint-disable-next-line
    return (proxy as any) as T
  }

  async get(hash: string | ICid): Promise<{}> {
    const cid = this._toCid(hash)
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
