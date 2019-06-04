import {
  merklingProxyHandler,
  MerklingProxyType,
  MerklingLifecycleState,
  IMerklingProxyState,
  MerklingProxyRef,
  IMerklingInternalRecord
} from '../src/merklingProxyHandler'
import { Merkling } from '../src/merkling'

describe('Merkling Proxy Handler', () => {
  describe('IPLD Node', () => {
    // eslint-disable-next-line
    let proxy: any
    // eslint-disable-next-line
    let originalState: any
    beforeEach(() => {
      // eslint-disable-next-line
      const mockSession: any = {
        _ipldNodeEntries: new Map<number, IMerklingInternalRecord>(),
        _proxies: new Map<string, IMerklingProxyState>(),
        _stateObjToParentRecord: {
          has: () => false
        }
      }

      originalState = {
        text: 'example',
        num: 5,
        bool: true,
        undefinedProp: undefined,
        nullProp: null,
        nested: { text: 'sub' }
      }

      const record: IMerklingInternalRecord = {
        internalId: 1,
        type: MerklingProxyType.IPLD,
        lifecycleState: MerklingLifecycleState.DIRTY,
        cid: null,
        state: originalState
      }

      mockSession._ipldNodeEntries.set(record.internalId, record)

      proxy = new Proxy<IMerklingProxyState>(
        {
          ref: new MerklingProxyRef({
            internalId: 1,
            type: MerklingProxyType.IPLD,
            path: []
          }),
          session: mockSession
        },
        merklingProxyHandler
      )
    })

    it('should delegate has calls onto the given state', () => {
      expect('text' in proxy).toBe(true)
      expect('num' in proxy).toBe(true)
      expect('bool' in proxy).toBe(true)
      expect('undefinedProp' in proxy).toBe(true)
      expect('nullProp' in proxy).toBe(true)
      expect('nested' in proxy).toBe(true)
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
        'nullProp',
        'nested'
      ])
    })

    it('should delegate a set call to the given state', () => {
      proxy.num = 6
      expect(originalState.num).toBe(6)
    })

    it('should return a proxy for a sub object', () => {
      expect(Merkling.isProxy(proxy.nested))
    })

    it('should return the same proxy each time the sub object is accessed', () => {
      const first: {} = proxy.nested
      const second: {} = proxy.nested

      expect(first).toBe(second)
    })
  })

  describe('Internal Node', () => {
    // eslint-disable-next-line
    let proxy: any
    // eslint-disable-next-line
    let originalState: any
    beforeEach(() => {
      // eslint-disable-next-line
      const mockSession: any = {
        _ipldNodeEntries: new Map<number, IMerklingInternalRecord>(),
        _stateObjToParentRecord: {
          has: () => false
        }
      }

      originalState = {
        nested: {
          nestedAgain: {
            text: 'example',
            num: 5,
            bool: true,
            undefinedProp: undefined,
            nullProp: null
          }
        }
      }

      const record: IMerklingInternalRecord = {
        internalId: 1,
        type: MerklingProxyType.IPLD,
        lifecycleState: MerklingLifecycleState.DIRTY,
        cid: null,
        state: originalState
      }

      mockSession._ipldNodeEntries.set(record.internalId, record)

      proxy = new Proxy<IMerklingProxyState>(
        {
          ref: new MerklingProxyRef({
            internalId: 1,
            type: MerklingProxyType.IPLD,
            path: ['nested', 'nestedAgain']
          }),
          session: mockSession
        },
        merklingProxyHandler
      )
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
      expect(originalState.nested.nestedAgain.num).toBe(6)
    })
  })
})
