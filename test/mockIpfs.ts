import { IIpfsNode } from '../src/merkling'

export default class MockIpfs implements IIpfsNode {
  saveCalls: number
  private _mappings: WeakMap<{}, string>

  constructor() {
    this.saveCalls = 0
    this._mappings = new WeakMap<{}, string>()
  }

  async put(state: {}): Promise<string> {
    this.saveCalls++
    return this._mappings.get(state) || 'QUNREGISTERED'
  }

  map(obj: {}, cid: string) {
    this._mappings.set(obj, cid)
  }
}
