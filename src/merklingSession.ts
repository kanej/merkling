import { IIpfsNode, Merkling } from './merkling'
import {
  IMerklingInternalRecord,
  MerklingProxyType,
  MerklingLifecycleState,
  merklingProxyHandler,
  IMerklingProxyRef,
  IMerklingProxyState
} from './merklingProxyHandler'
import IpfsWrapper from './ipfsWrapper'
import { getRecordSymbol } from './symbols'
import Serialiser from './serialiser'

export default class MerklingSession {
  _ipfs: IpfsWrapper
  _ipldIdCounter: number
  _ipldNodeEntries: Map<number, IMerklingInternalRecord>
  _proxies: Map<string, {}>
  _serialiser: Serialiser

  constructor({ ipfs }: { ipfs: IIpfsNode }) {
    this._ipfs = new IpfsWrapper(ipfs)
    this._ipldIdCounter = 0
    this._ipldNodeEntries = new Map<number, IMerklingInternalRecord>()
    this._proxies = new Map<string, IMerklingProxyState>()

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

    const proxyId: IMerklingProxyRef = {
      internalId: record.internalId,
      type: record.type,
      path: []
    }

    const proxy = new Proxy(
      {
        ref: proxyId,
        session: this
      },
      merklingProxyHandler
    )

    this._ipldNodeEntries.set(record.internalId, record)

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

    const proxyId: IMerklingProxyRef = {
      internalId: record.internalId,
      type: record.type,
      path: []
    }

    const proxy = new Proxy(
      {
        ref: proxyId,
        session: this
      },
      merklingProxyHandler
    )

    this._ipldNodeEntries.set(record.internalId, record)

    return proxy
  }

  async save(): Promise<void> {
    for (const ipldNode of this._ipldNodeEntries.values()) {
      await this._recursiveSaveIpldNode(ipldNode)
    }
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

    // eslint-disable-next-line
    const childIpldNodes: any[] = this._traverseStateForIpldNodes(record.state)

    for (const childIpldNode of childIpldNodes || []) {
      const subrecord = childIpldNode[getRecordSymbol]
      await this._recursiveSaveIpldNode(subrecord)
    }

    const serializedState = this._serialiser.serialise(record.state)

    const cid = await this._ipfs.put(serializedState)

    record.cid = cid
    record.lifecycleState = MerklingLifecycleState.CLEAN
  }

  // eslint-disable-next-line
  private _traverseStateForIpldNodes(obj: any, acc: any[] = []): any[] {
    for (let v of Object.values(obj)) {
      if (!v || typeof v !== 'object') {
        continue
      }

      if (Merkling.isIpldNode(v)) {
        acc.push(v)
        continue
      }

      this._traverseStateForIpldNodes(v, acc)
    }

    return acc
  }
}
