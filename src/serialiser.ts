/* eslint-disable @typescript-eslint/no-explicit-any */
import CID from 'cids'
import { MerklingProxyRef, IMerklingProxyRef } from './merklingProxyHandler'
import { ICid } from './domain'
import { isProxySymbol, getRefSymbol } from './symbols'

export default class Serialiser {
  private _internalIdToCidEncoder: (id: number) => ICid

  constructor(internalIdToCidEncoder: (id: number) => ICid) {
    this._internalIdToCidEncoder = internalIdToCidEncoder
  }

  serialise(obj: any): any {
    return this._cloneAndSubstitute(obj, this._merkleRefToIpldRef.bind(this))
  }

  deserialise(
    obj: any,
    internalIpldNodeMinter: (cid: ICid) => MerklingProxyRef
  ): any {
    return this._cloneAndSubstitute(
      obj,
      this._merkleRefToIpldRefBuilder(internalIpldNodeMinter)
    )
  }

  internalise(obj: any, internalLinker: (internalId: number) => void): any {
    return this._cloneAndSubstitute(
      obj,
      this._merkleProxyToMerkleRefBuilder(internalLinker)
    )
  }

  private _merkleRefToIpldRefBuilder(
    internalIpldNodeMinter: (cid: ICid) => MerklingProxyRef
  ): (obj: any, key: string | number | symbol, v: any) => boolean {
    return (obj: any, key: string | number | symbol, v: any): boolean => {
      if (CID.isCID(v)) {
        obj[key] = internalIpldNodeMinter(v)
        return true
      } else {
        return false
      }
    }
  }

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

  private _merkleProxyToMerkleRefBuilder(
    internalLinker: (internalId: number) => void
  ): (obj: any, key: string | number | symbol, v: any) => boolean {
    return (obj: any, key: string | number | symbol, v: any): boolean => {
      if (v[isProxySymbol]) {
        const ref = v[getRefSymbol] as IMerklingProxyRef
        obj[key] = ref
        internalLinker(ref.internalId)
        return true
      } else {
        return false
      }
    }
  }

  private _cloneAndSubstitute(
    obj: any,
    substitution: (o: any, key: string | number | symbol, v: any) => boolean
  ): any {
    const clone: any = Array.isArray(obj) ? [] : {}

    for (const i in obj) {
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
