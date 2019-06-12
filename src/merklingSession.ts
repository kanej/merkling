import { IIpfsNode } from './merkling'
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
      (id: number): string => {
        const record = this._ipldNodeEntries.get(id)

        if (!record) {
          throw new Error('Ref to unknown IPLD node - ' + id)
        }

        const cid = record.cid

        if (!cid) {
          throw new Error('Attempted to serialize unsaved IPLD node')
        }

        return cid.toBaseEncodedString()
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

  async get(hash: string): Promise<{}> {
    const ipldNode = await this._ipfs.get(hash)

    const record: IMerklingInternalRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.CLEAN,
      cid: ipldNode.cid,
      state: ipldNode.value
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

    const serializedState = this._serialiser.serialise(record.state)
    const cid = await this._ipfs.put(serializedState)

    record.cid = cid
    record.lifecycleState = MerklingLifecycleState.CLEAN
  }
}
