import { IIpfsNode, ICid } from '../../src/merkling'

interface ISharedState {
  saveCalls: number
  errorOnPut: boolean
  errorOnGet: boolean
  // eslint-disable-next-line
  objToCidMapper: (obj: any) => ICid
  cidToObjMapping: Map<string, {}>
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

  // eslint-disable-next-line
  setObjToCidMapper(mapper: (obj: any) => ICid) {
    this.shared.objToCidMapper = mapper
  }

  mapCidToObj(cid: ICid, obj: {}) {
    this.shared.cidToObjMapping.set(cid.toBaseEncodedString(), {
      cid: cid,
      value: obj,
      remainderPath: ''
    })
  }
}

export default function setupMockIpfs() {
  const shared: ISharedState = {
    saveCalls: 0,
    errorOnPut: false,
    errorOnGet: false,
    // eslint-disable-next-line
    objToCidMapper: (obj: any): ICid => {
      return {
        codec: 'example',
        version: 1,
        multihash: Buffer.from('UNKNOWN'),
        toBaseEncodedString: () => 'UNKNOWN'
      }
    },
    cidToObjMapping: new Map<string, {}>()
  }

  const dag = {
    put(state: {}, _options: {}, callback: Function): void {
      shared.saveCalls++

      if (shared.errorOnPut) {
        return callback(new Error('Boom!'))
      }

      const cid = shared.objToCidMapper(state)

      callback(null, cid)
    },
    get(cid: string, callback: Function): void {
      if (shared.errorOnGet) {
        return callback(new Error('Boom!'))
      }

      const ipldNode = shared.cidToObjMapping.get(cid)

      callback(null, ipldNode)
    }
  }

  return new MockIpfs(shared, dag)
}
