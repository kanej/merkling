import { Merkling } from '../../src/merkling'
import MerklingSession from '../../src/merklingSession'
import setupMockIpfs from './mockIpfs'

describe('Merkling', () => {
  let merkling: Merkling

  beforeEach(() => {
    merkling = new Merkling({ ipfs: setupMockIpfs() })
  })

  describe('Creating a session', () => {
    let session: MerklingSession

    beforeEach(() => {
      session = merkling.createSession()
    })

    it('is a merkling session', () => {
      expect(session.constructor.name).toBe('MerklingSession')
    })
  })

  describe('Testing Proxies', () => {
    // eslint-disable-next-line
    let proxy: any

    beforeEach(() => {
      const session = merkling.createSession()
      proxy = session.create({ text: 'example', nested: { text: 'sub' } })
    })

    describe('to determine whether a Merkle Proxy', () => {
      it('should show true for an actual proxy', () => {
        expect(Merkling.isProxy(proxy)).toBe(true)
      })

      it('should allow the identification of a non-proxy', () => {
        expect(Merkling.isProxy(5)).toBe(false)
      })

      it('should treat null and undefined as not being proxies', () => {
        expect(Merkling.isProxy(null)).toBe(false)
        expect(Merkling.isProxy(undefined)).toBe(false)
      })
    })

    describe('to determine whether there are unsaved changes', () => {
      it('should show true for newly created proxies', () => {
        expect(Merkling.isDirty(proxy)).toBe(true)
      })

      it('should conside non-proxy object as always having unsaved changes', () => {
        expect(Merkling.isDirty(5)).toBe(true)
      })
    })

    describe('on whether they are IPLD nodes', () => {
      it('should show true for IPLD nodes', () => {
        expect(Merkling.isIpldNode(proxy)).toBe(true)
      })

      it('should indicate that nested pojo objects are not IPLD nodes', () => {
        expect(Merkling.isIpldNode(proxy.nested)).toBe(false)
      })

      it('should consider null and undefined as not IPLD nodes', () => {
        expect(Merkling.isIpldNode(null)).toBe(false)
        expect(Merkling.isIpldNode(undefined)).toBe(false)
      })
    })

    describe('to get their CID', () => {
      test.todo('should return a CID hash for a clean IPLD node')

      it('should return null for a dirty IPLD node', () => {
        expect(Merkling.cid(proxy)).toBe(null)
      })

      it('should return undefined for a non-ipld proxy', () => {
        expect(Merkling.cid(proxy.nested)).toBe(undefined)
      })

      it('should return undefined for non-proxy', () => {
        expect(Merkling.cid(5)).toBe(undefined)
        expect(Merkling.cid(null)).toBe(undefined)
        expect(Merkling.cid(undefined)).toBe(undefined)
      })
    })
  })
})
