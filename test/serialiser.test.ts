import Serialiser from '../src/serialiser'
import {
  MerklingProxyRef,
  MerklingProxyType
} from '../src/merklingProxyHandler'

describe('serialiser', () => {
  let exampleMappings: { [key: number]: string } = {
    1: 'XXXYYY',
    2: 'YYYZZZ'
  }

  let serialiser = new Serialiser(
    (id: number): string => {
      return exampleMappings[id]
    }
  )

  describe('simple pojo', () => {
    // eslint-disable-next-line
    let simplePojo: any

    beforeEach(() => {
      simplePojo = { a: 1, b: 'text', c: null }
    })

    it('returns a clone', () => {
      expect(serialiser.serialise(simplePojo)).not.toBe(simplePojo)
    })

    it('returns a structurally identical object', () => {
      expect(serialiser.serialise(simplePojo)).toStrictEqual(simplePojo)
    })
  })

  describe('nested pojo', () => {
    // eslint-disable-next-line
    let nestedPojo: any

    beforeEach(() => {
      nestedPojo = {
        text: 'example',
        nested: {
          next: {
            b: 2
          }
        }
      }
    })

    it('returns a clone', () => {
      const out = serialiser.serialise(nestedPojo)
      expect(out).not.toBe(nestedPojo)
      expect(out.nested).not.toBe(nestedPojo.nested)
      expect(out.nested.next).not.toBe(nestedPojo.nested.next)
    })

    it('returns a structurally identical object', () => {
      expect(serialiser.serialise(nestedPojo)).toStrictEqual(nestedPojo)
    })
  })

  describe('simple obj with IPLD ref', () => {
    // eslint-disable-next-line
    let pojoWithRef: any

    beforeEach(() => {
      pojoWithRef = {
        a: 1,
        b: 'text',
        c: new MerklingProxyRef({
          internalId: 1,
          type: MerklingProxyType.IPLD,
          path: []
        })
      }
    })

    it('returns a clone', () => {
      expect(serialiser.serialise(pojoWithRef)).not.toBe(pojoWithRef)
    })

    it('returns a structurally identical object', () => {
      expect(serialiser.serialise(pojoWithRef)).toStrictEqual({
        a: 1,
        b: 'text',
        c: { '/': 'XXXYYY' }
      })
    })
  })

  describe('nested obj with IPLD ref', () => {
    // eslint-disable-next-line
    let pojoWithRef: any

    beforeEach(() => {
      pojoWithRef = {
        a: 1,
        text: 'example',
        nested: {
          left: {
            c: new MerklingProxyRef({
              internalId: 1,
              type: MerklingProxyType.IPLD,
              path: []
            })
          },
          right: {
            d: new MerklingProxyRef({
              internalId: 2,
              type: MerklingProxyType.IPLD,
              path: []
            })
          }
        }
      }
    })

    it('returns a clone', () => {
      expect(serialiser.serialise(pojoWithRef)).not.toBe(pojoWithRef)
    })

    it('returns a structurally identical object', () => {
      expect(serialiser.serialise(pojoWithRef)).toStrictEqual({
        a: 1,
        text: 'example',
        nested: {
          left: {
            c: { '/': 'XXXYYY' }
          },
          right: {
            d: { '/': 'YYYZZZ' }
          }
        }
      })
    })
  })
})
