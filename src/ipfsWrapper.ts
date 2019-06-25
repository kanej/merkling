import { IIpfsNode, ICid, IIpldNode } from './domain'

export default class IpfsWrapper {
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

  async get(hash: string | ICid): Promise<IIpldNode> {
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
