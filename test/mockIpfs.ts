import { IIpfsNode } from '../src/merkling'

export default class MockIpfs implements IIpfsNode {
  private _mappings: WeakMap<{}, string>

  constructor() {
    this._mappings = new WeakMap<{}, string>()
  }

  async put(state: {}): Promise<string> {
    return this._mappings.get(state) || 'QUNREGISTERED'
  }

  map(obj: {}, cid: string) {
    this._mappings.set(obj, cid)
  }
}
