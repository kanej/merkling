import { IIpfsNode, Merkling, ICid } from './merkling'
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
}

export default class MerklingSession {
  _ipfs: IpfsWrapper
  _stateObjToProxy: WeakMap<{}, {}>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _roots: any[]

  constructor({ ipfs }: { ipfs: IIpfsNode }) {
    this._ipfs = new IpfsWrapper(ipfs)
    this._stateObjToProxy = new WeakMap()
    this._roots = []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create(objState: any): IMerklingProxyRecord | {} {
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
