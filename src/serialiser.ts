import { MerklingProxyRef } from './merklingProxyHandler'

export default class Serialiser {
  private _internalIdToCidHashEncoder: (id: number) => string

  constructor(internalIdToCidHashEncoder: (id: number) => string) {
    this._internalIdToCidHashEncoder = internalIdToCidHashEncoder
  }

  // eslint-disable-next-line
  serialise(obj: any): any {
    return this._cloneAndSubstitute(obj)
  }

  // eslint-disable-next-line
  private _cloneAndSubstitute(obj: any): any {
    // eslint-disable-next-line
    var clone: any = {}

    for (var i in obj) {
      if (obj[i] != null && typeof obj[i] === 'object') {
        if (obj[i].constructor.name === MerklingProxyRef.name) {
          const ref = obj[i] as MerklingProxyRef
          clone[i] = { '/': this._internalIdToCidHashEncoder(ref.internalId) }
        } else {
          clone[i] = this._cloneAndSubstitute(obj[i])
        }
      } else {
        clone[i] = obj[i]
      }
    }

    return clone
  }
}
