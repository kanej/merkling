import { IIpfsNode, Merkling } from './merkling'
import {
  IMerklingProxyRecord,
  MerklingProxyType,
  MerklingLifecycleState,
  merklingProxyHandler
} from './merklingProxyHandler'
import { getStateSymbol, setCidSymbol } from './symbols'

export default class MerklingSession {
  _ipfs: IIpfsNode
  _stateObjToProxy: WeakMap<{}, {}>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _roots: any[]

  constructor(options: { ipfs: IIpfsNode }) {
    const { ipfs } = options
    this._ipfs = ipfs
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
