import MerklingSession from '../../src/merklingSession'
import { Merkling, ICid } from '../../src/merkling'
import setupMockIpfs, { MockIpfs } from './mockIpfs'
import { toCid } from './helpers'

const exampleHash1 =
  'zBwWX6kDxnbb7xaRuCVxS5qrQpHMrmY8JydAnwk5KYDG5mrkybgSDZaRDoSoqTZjP86NkqUKu1WvNd7RKvLXM5ocrpZkh'
const exampleHash2 =
  'zBwWX95ufqpkeKLN66Sz8sQcxsZQTXGgZVKBpgfg7UUUKRpZXNH7q7yZkjb7FDY8pSke1McW3HUXzpjjcZPwNKaoHKtcK'

describe('Session', () => {
  let session: MerklingSession

  beforeEach(() => {
    session = new MerklingSession({ ipfs: setupMockIpfs() })
  })

  describe('creating', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let proxy: any

    describe('from a value', () => {
      it('returns undefined for undefined', () => {
        expect(session.create(undefined)).toBe(undefined)
      })

      it('returns null for null', () => {
        expect(session.create(null)).toBe(null)
      })

      it('returns the identical number for a number', () => {
        expect(session.create(5)).toBe(5)
      })

      it('returns the identical string for a string', () => {
        expect(session.create('example')).toBe('example')
      })

      it('returns the identical boolean for a boolean', () => {
        expect(session.create(true)).toBe(true)
      })
    })

    describe('from simple pojo', () => {
      const simplePojo = Object.freeze({
        text: 'example',
        num: 5,
        bool: true,
        undefinedProp: undefined,
        nullProp: null
      })

      beforeEach(() => {
        proxy = session.create(simplePojo)
      })

      it('returns a Merkling proxy', () => {
        expect(Merkling.isProxy(proxy)).toBe(true)
      })

      it('returns a proxy that is an IPLD node', () => {
        expect(Merkling.isIpldNode(proxy)).toBe(true)
      })

      it('returns a proxy that is dirty', () => {
        expect(Merkling.isDirty(proxy)).toBe(true)
      })

      it('returns a proxy that can have its properties accessed', () => {
        expect(proxy.text).toBe('example')
        expect(proxy.num).toBe(5)
        expect(proxy.bool).toBe(true)
        expect(proxy.undefinedProp).toBe(undefined)
        expect(proxy.nullProp).toBe(null)
      })

      it('returns a proxy that can responds to unknown property lookups', () => {
        expect(proxy.unknown).toBe(undefined)
      })
    })

    describe('from a single nested pojo', () => {
      const singlyNestedPojo = {
        text: 'single-nesting',
        nested: {
          text: 'example',
          num: 5,
          bool: true,
          undefinedProp: undefined,
          nullProp: null
        }
      }

      beforeEach(() => {
        proxy = session.create(singlyNestedPojo)
      })

      it('returns a Merkling proxy', () => {
        expect(Merkling.isProxy(proxy)).toBe(true)
      })

      it('returns a proxy that is an IPLD node', () => {
        expect(Merkling.isIpldNode(proxy)).toBe(true)
      })

      it('returns a proxy that is structurally equal to the original', () => {
        expect(proxy).toStrictEqual(singlyNestedPojo)
      })

      describe('accessing its nested object', () => {
        // eslint-disable-next-line
        let nested: any

        beforeEach(() => {
          nested = proxy.nested
        })

        it('returns a Merkling proxy', () => {
          expect(Merkling.isProxy(nested)).toBe(true)
        })

        it('returns a proxy that is not an IPLD node', () => {
          expect(Merkling.isIpldNode(nested)).toBe(false)
        })

        it('returns a proxy that can have its properties accessed', () => {
          expect(nested.text).toBe('example')
          expect(nested.num).toBe(5)
          expect(nested.bool).toBe(true)
          expect(nested.undefinedProp).toBe(undefined)
          expect(nested.nullProp).toBe(null)
        })
      })
    })
  })

  describe('saving', () => {
    // eslint-disable-next-line
    let proxy: any
    let mockIpfs: MockIpfs

    beforeEach(() => {
      mockIpfs = setupMockIpfs()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockIpfs.setObjToCidMapper(_obj => toCid(exampleHash1))
      session = new MerklingSession({ ipfs: mockIpfs })
    })

    describe('dirty', () => {
      describe('simple pojo', () => {
        let simplePojo = Object.freeze({
          text: 'example',
          num: 5,
          bool: true,
          undefinedProp: undefined,
          nullProp: null
        })

        beforeEach(async () => {
          proxy = session.create(simplePojo)
          await session.save()
        })

        it('should mark the proxy as clean', () => {
          expect(Merkling.isDirty(proxy)).toBe(false)
        })

        it('should set the cid against the proxy', () => {
          const cid = Merkling.cid(proxy)
          expect(cid).toBeTruthy()
          expect((cid as ICid).toBaseEncodedString()).toBe(exampleHash1)
        })

        it('should save the object to IPFS', () => {
          expect(mockIpfs.shared.saveCalls).toBe(1)
        })
      })

      describe('clean', () => {
        describe('simple pojo', () => {
          let simplePojo = Object.freeze({
            text: 'example',
            num: 5,
            bool: true,
            undefinedProp: undefined,
            nullProp: null
          })

          beforeEach(async () => {
            proxy = session.create(simplePojo)
            await session.save()
          })

          it('should not save to IPFS', async () => {
            await session.save()

            expect(mockIpfs.shared.saveCalls).toBe(1)
          })
        })
      })

      describe('error', () => {
        describe('on save', () => {
          it('should throw', async () => {
            mockIpfs.shared.errorOnPut = true
            proxy = session.create({ text: 'boom' })
            const savePromise = session.save()
            await expect(savePromise).rejects.toThrow()
          })
        })
      })
    })
  })

  describe('updating', () => {
    // eslint-disable-next-line
    let proxy: {
      text: string
      num: number
      bool: boolean
      undefinedProp: undefined
      nullProp: null
    }
    let mockIpfs: MockIpfs

    beforeEach(() => {
      mockIpfs = setupMockIpfs()
      session = new MerklingSession({ ipfs: mockIpfs })
    })

    describe('simple pojo', () => {
      let simplePojo = {
        text: 'example',
        num: 5,
        bool: true,
        undefinedProp: undefined,
        nullProp: null
      }

      beforeEach(async () => {
        proxy = session.create(simplePojo)

        await session.save()
        proxy.text = 'updated'
      })

      it('marks the IPLD node as dirty', () => {
        expect(Merkling.isIpldNode(proxy)).toBe(true)
        expect(Merkling.isDirty(proxy)).toBe(true)
      })

      it('removes the cid against the IPLD node', () => {
        expect(Merkling.cid(proxy)).toBe(null)
      })

      it('persists to IPFS on save', async () => {
        expect(mockIpfs.shared.saveCalls).toBe(1)
        await session.save()
        expect(mockIpfs.shared.saveCalls).toBe(2)
      })
    })

    describe('nested pojo', () => {
      let nested = {
        text: 'root',
        next: {
          text: 'sub'
        }
      }

      // eslint-disable-next-line
      let nestedProxy: any

      beforeEach(async () => {
        nestedProxy = session.create(nested)

        await session.save()
        nestedProxy.next.text = 'updated'
      })

      it('marks the IPLD node as dirty', () => {
        expect(Merkling.isIpldNode(nestedProxy)).toBe(true)
        expect(Merkling.isDirty(nestedProxy)).toBe(true)
      })

      it('removes the cid against the IPLD node', () => {
        expect(Merkling.cid(nestedProxy)).toBe(null)
      })

      it('persists to IPFS on save', async () => {
        expect(mockIpfs.shared.saveCalls).toBe(1)
        await session.save()
        expect(mockIpfs.shared.saveCalls).toBe(2)
      })
    })

    describe('nested merkling nodes', () => {
      it('allows retrieval of the subnode produced at creation', () => {
        const nested = session.create({
          text: 'example',
          sub: session.create({
            text: 'sub'
          })
        })

        expect(Merkling.isIpldNode(nested.sub))
        expect(Merkling.isDirty(nested.sub))
      })

      it('allows retrieval of the subnode produced through setting', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nested: any = session.create({
          text: 'example',
          sub: undefined
        })

        const sub = session.create({
          text: 'sub'
        })

        nested.sub = sub

        expect(Merkling.isIpldNode(nested.sub))
        expect(Merkling.isDirty(nested.sub))
      })

      it('persists both parent and child to ipfs', async () => {
        // eslint-disable-next-line
        const nested: any = session.create({
          text: 'example',
          sub: undefined
        })

        const sub = session.create({
          text: 'sub'
        })

        nested.sub = sub

        await session.save()

        expect(Merkling.isDirty(nested)).toBe(false)
        expect(Merkling.isDirty(nested.sub)).toBe(false)

        expect(mockIpfs.shared.saveCalls).toBe(2)
      })
    })
  })

  describe('getting', () => {
    // eslint-disable-next-line
    let proxy: any
    let mockIpfs: MockIpfs

    beforeEach(async () => {
      mockIpfs = setupMockIpfs()
      const cid = toCid(exampleHash2)
      mockIpfs.mapCidToObj(cid, { text: 'example' })
      session = new MerklingSession({ ipfs: mockIpfs })
      proxy = await session.get(cid)
    })

    it('returns a Merkling proxy', () => {
      expect(Merkling.isProxy(proxy)).toBe(true)
    })

    it('returns a proxy that is an IPLD node', () => {
      expect(Merkling.isIpldNode(proxy)).toBe(true)
    })

    it('returns a proxy that can have its properties accessed', () => {
      expect(proxy.text).toBe('example')
    })

    describe('error', () => {
      it('should throw', async () => {
        mockIpfs.shared.errorOnGet = true
        const getPromise = session.get(exampleHash2)
        await expect(getPromise).rejects.toThrow()
      })
    })
  })
})
