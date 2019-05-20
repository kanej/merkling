import { IIpfsNode, ICid } from '../src/merkling'

interface ISharedState {
  saveCalls: number
  errorOnPut: boolean
  mappings: WeakMap<{}, ICid>
}

export class MockIpfs implements IIpfsNode {
  // eslint-disable-next-line
  dag: any
  shared: ISharedState

  constructor(
    shared: ISharedState,
    // eslint-disable-next-line
    dag: any
  ) {
    this.shared = shared
    this.dag = dag
  }

  map(obj: {}, cid: ICid) {
    this.shared.mappings.set(obj, cid)
  }
}

export default function setupMockIpfs() {
  const shared = {
    saveCalls: 0,
    errorOnPut: false,
    mappings: new WeakMap<{}, ICid>()
  }

  const dag = {
    put(state: {}, _options: {}, callback: Function): void {
      shared.saveCalls++

      if (shared.errorOnPut) {
        return callback(new Error('Boom!'))
      }

      const cid = shared.mappings.get(state) || {
        codec: 'unknown',
        version: 1,
        multihash: Buffer.from('QUNREGISTERED')
      }

      callback(null, cid)
    }
  }

  return new MockIpfs(shared, dag)
}
