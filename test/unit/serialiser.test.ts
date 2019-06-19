import Serialiser from '../../src/serialiser'
import {
  MerklingProxyRef,
  MerklingProxyType
} from '../../src/merklingProxyHandler'
import { ICid } from '../../src/merkling'
import { toCid } from './helpers'

const exampleHash1 =
  'zBwWX6kDxnbb7xaRuCVxS5qrQpHMrmY8JydAnwk5KYDG5mrkybgSDZaRDoSoqTZjP86NkqUKu1WvNd7RKvLXM5ocrpZkh'
const exampleHash2 =
  'zBwWX95ufqpkeKLN66Sz8sQcxsZQTXGgZVKBpgfg7UUUKRpZXNH7q7yZkjb7FDY8pSke1McW3HUXzpjjcZPwNKaoHKtcK'

describe('serialiser', () => {
  const cid1 = toCid(exampleHash1)
  const cid2 = toCid(exampleHash2)
  let exampleMappings: { [key: number]: ICid } = {
    1: cid1,
    2: cid2
  }

  let serialiser = new Serialiser(
    (id: number): ICid => {
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
        c: cid1
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
            c: cid1
          },
          right: {
            d: cid2
          }
        }
      })
    })
  })
})
