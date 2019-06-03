import {
  IMerklingProxyRecord,
  merklingProxyHandler,
  MerklingProxyType,
  MerklingLifecycleState
} from '../src/merklingProxyHandler'

describe('Merkling Proxy Handler', () => {
  // eslint-disable-next-line
  let proxy: any
  // eslint-disable-next-line
  let originalState: any
  beforeEach(() => {
    // eslint-disable-next-line
    const mockSession: any = {
      _stateObjToParentRecord: {
        has: () => false
      }
    }

    originalState = {
      text: 'example',
      num: 5,
      bool: true,
      undefinedProp: undefined,
      nullProp: null
    }

    const record: IMerklingProxyRecord = {
      internalId: 1,
      type: MerklingProxyType.IPLD,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      session: mockSession,
      state: originalState
    }

    proxy = new Proxy(record, merklingProxyHandler)
  })

  it('should delegate has calls onto the given state', () => {
    expect('text' in proxy).toBe(true)
    expect('num' in proxy).toBe(true)
    expect('bool' in proxy).toBe(true)
    expect('undefinedProp' in proxy).toBe(true)
    expect('nullProp' in proxy).toBe(true)
  })

  it('should delegate enumeration of keys to the given state', () => {
    const keys = []
    for (const key in proxy) {
      keys.push(key)
    }

    expect(keys).toStrictEqual([
      'text',
      'num',
      'bool',
      'undefinedProp',
      'nullProp'
    ])
  })

  it('should delegate a set call to the given state', () => {
    proxy.num = 6
    expect(originalState.num).toBe(6)
  })
})
