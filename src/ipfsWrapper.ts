import { IIpfsNode, ICid, IIpldNode } from './domain'

export default class IpfsWrapper {
  _ipfs: IIpfsNode

  constructor(ipfs: IIpfsNode) {
    this._ipfs = ipfs
  }

  async put(obj: {}): Promise<ICid> {
    return this._ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })
  }

  async get(hash: string | ICid): Promise<IIpldNode> {
    return this._ipfs.dag.get(hash)
  }
}
