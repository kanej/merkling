export interface IIpfsNode {
  dag: {
    put: Function
    get: Function
  }
}

export interface ICid {
  codec: string
  version: number
  multihash: ArrayBuffer
  toBaseEncodedString: () => string
}

export interface IIpldNode {
  value: {}
  remainderPath: string
  cid: ICid
}

export interface IMerklingOptions {
  ipfs: IIpfsNode
}
