import { MerklingProxyRef } from './merklingProxyHandler'
import { ICid } from './merkling'

export default class Serialiser {
  private _internalIdToCidEncoder: (id: number) => ICid

  constructor(internalIdToCidEncoder: (id: number) => ICid) {
    this._internalIdToCidEncoder = internalIdToCidEncoder
  }

  // eslint-disable-next-line
  serialise(obj: any): any {
    return this._cloneAndSubstitute(obj, this._merkleRefToIpldRef.bind(this))
  }

  // deserialise(obj: any): any {
  //   return this._cloneAndSubstitute(obj)
  // }

  private _merkleRefToIpldRef(
    obj: any,
    key: string | number | symbol,
    v: any
  ): boolean {
    if ('isRef' in v && v.isRef) {
      const ref = v as MerklingProxyRef
      obj[key] = this._internalIdToCidEncoder(ref.internalId)
      return true
    } else {
      return false
    }
  }

  // private _IpldRefToMerkleRef(
  //   obj: any,
  //   key: string | number | symbol,
  //   v: any
  // ): boolean {
  //   if ('/' in v) {
  //     const hash: string = v['/']
  //     obj[key] = new MerklingProxyRef({
  //       internalId:
  //     })
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  private _cloneAndSubstitute(
    // eslint-disable-next-line
    obj: any,
    // eslint-disable-next-line
    substitution: (o: any, key: string | number | symbol, v: any) => boolean
    // eslint-disable-next-line
  ): any {
    // eslint-disable-next-line
    var clone: any = {}

    for (var i in obj) {
      if (obj[i] != null && typeof obj[i] === 'object') {
        if (!substitution(clone, i, obj[i])) {
          clone[i] = this._cloneAndSubstitute(obj[i], substitution)
        }
      } else {
        clone[i] = obj[i]
      }
    }

    return clone
  }
}
