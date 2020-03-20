import { IIpfsNode, ICid, IIpldNode } from '../../src/domain'

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async put(state: {}, _options: {}): Promise<ICid> {
      shared.saveCalls++

      if (shared.errorOnPut) {
        throw new Error('Boom!')
      }

      const cid = shared.objToCidMapper(state)

      return cid
    },
    async get(cid: string): Promise<IIpldNode> {
      if (shared.errorOnGet) {
        throw new Error('Boom!')
      }

      const ipldNode = shared.cidToObjMapping.get(cid)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ipldNode as any
    }
  }

  return new MockIpfs(shared, dag)
}
