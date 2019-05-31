import { IIpfsNode, Merkling, ICid, IIpldNode } from './merkling'
import {
  IMerklingProxyRecord,
  MerklingProxyType,
  MerklingLifecycleState,
  merklingProxyHandler
} from './merklingProxyHandler'
import { getStateSymbol, setCidSymbol } from './symbols'

class IpfsWrapper {
  _ipfs: IIpfsNode

  constructor(ipfs: IIpfsNode) {
    this._ipfs = ipfs
  }

  async put(obj: {}): Promise<ICid> {
    return new Promise(
      // eslint-disable-next-line
      (resolve, reject): any => {
        return this._ipfs.dag.put(
          obj,
          { format: 'dag-cbor', hashAlg: 'sha3-512' },
          // eslint-disable-next-line
          (err: Error, cid: ICid): any => {
            if (err) {
              return reject(err)
            }

            return resolve(cid)
          }
        )
      }
    )
  }

  async get(hash: string): Promise<IIpldNode> {
    return new Promise(
      // eslint-disable-next-line
      (resolve, reject): any => {
        return this._ipfs.dag.get(
          hash,
          // eslint-disable-next-line
          (err: Error, ipldNode: IIpldNode): any => {
            if (err) {
              return reject(err)
            }

            return resolve(ipldNode)
          }
        )
      }
    )
  }
}

export default class MerklingSession {
  _ipfs: IpfsWrapper
  _stateObjToProxy: WeakMap<{}, {}>
  _stateObjToParentRecord: WeakMap<{}, IMerklingProxyRecord>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _roots: any[]

  constructor({ ipfs }: { ipfs: IIpfsNode }) {
    this._ipfs = new IpfsWrapper(ipfs)
    this._stateObjToProxy = new WeakMap()
    this._stateObjToParentRecord = new WeakMap()
    this._roots = []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T>(objState: T): T {
    if (objState === null || typeof objState !== 'object') {
      return objState
    }

    const record: IMerklingProxyRecord = {
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      session: this,
      state: objState
    }

    const proxy = new Proxy(record, merklingProxyHandler)

    this._roots.push(proxy)

    // eslint-disable-next-line
    return (proxy as any) as T
  }

  async get(hash: string): Promise<{}> {
    const ipldNode = await this._ipfs.get(hash)

    const record: IMerklingProxyRecord = {
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.CLEAN,
      cid: ipldNode.cid,
      session: this,
      state: ipldNode.value
    }

    const proxy = new Proxy(record, merklingProxyHandler)

    this._roots.push(proxy)

    return proxy
  }

  async save(): Promise<void> {
    for (const root of this._roots) {
      if (Merkling.isDirty(root)) {
        const state = root[getStateSymbol]

        const cid = await this._ipfs.put(state)

        root[setCidSymbol] = cid
      }
    }
  }
}
