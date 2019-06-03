import { IIpfsNode, Merkling } from './merkling'
import {
  IMerklingProxyRecord,
  MerklingProxyType,
  MerklingLifecycleState,
  merklingProxyHandler
} from './merklingProxyHandler'
import IpfsWrapper from './ipfsWrapper'
import { getRecordSymbol } from './symbols'

export default class MerklingSession {
  _ipfs: IpfsWrapper
  _stateObjToProxy: WeakMap<{}, {}>
  _stateObjToParentRecord: WeakMap<{}, IMerklingProxyRecord>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _roots: IMerklingProxyRecord[]
  _ipldIdCounter: number

  constructor({ ipfs }: { ipfs: IIpfsNode }) {
    this._ipfs = new IpfsWrapper(ipfs)
    this._stateObjToProxy = new WeakMap()
    this._stateObjToParentRecord = new WeakMap()
    this._roots = []
    this._ipldIdCounter = 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T>(objState: T): T {
    if (objState === null || typeof objState !== 'object') {
      return objState
    }

    const record: IMerklingProxyRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      session: this,
      state: objState
    }

    const proxy = new Proxy(record, merklingProxyHandler)

    this._roots.push(record)

    // eslint-disable-next-line
    return (proxy as any) as T
  }

  async get(hash: string): Promise<{}> {
    const ipldNode = await this._ipfs.get(hash)

    const record: IMerklingProxyRecord = {
      internalId: ++this._ipldIdCounter,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.CLEAN,
      cid: ipldNode.cid,
      session: this,
      state: ipldNode.value
    }

    const proxy = new Proxy(record, merklingProxyHandler)

    this._roots.push(record)

    return proxy
  }

  async save(): Promise<void> {
    for (const root of this._roots.reverse()) {
      await this._recursiveSaveIpldNode(root)
    }
  }

  // eslint-disable-next-line
  private async _recursiveSaveIpldNode(
    record: IMerklingProxyRecord
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

    const cid = await this._ipfs.put(record.state)

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
