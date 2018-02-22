'use strict'

const CID = require('cids')
const { IpldProxy } = require('../src/ipld')

describe('IPLD Proxy', () => {
  const exampleIpfsHash = 'zdpuAxeu3zsBoX6bYvZwjhYsUmA5gThH1yPwjr4P6HK3Q1za2'

  let ipld

  beforeEach(() => {
    ipld = new IpldProxy()
  })

  describe('a link proxy', () => {
    let link

    beforeEach(() => {
      link = ipld.createLinkNode(exampleIpfsHash)
    })

    test('is a js object', () => {
      expect(link).not.toBeFalsy()
    })

    test('contains the ipfs hash as the / property', () => {
      expect(link['/']).toBe(exampleIpfsHash)
    })

    test('has a readable cid', () => {
      const cid = ipld.readCID(link)
      expect(CID.isCID(cid)).toBe(true)
      expect(cid.toBaseEncodedString()).toBe(exampleIpfsHash)
    })

    test('has a status of \'unloaded\'', () => {
      expect(link[Symbol.for('merkling#status')]).toBe(ipld.UNLOADED)
    })

    test('cannot have its properties set', () => {
      expect(() => { link.prop = 'example' }).toThrow(TypeError)
    })
  })

  describe('a dirty ipld node', () => {
    let node
    const exampleObj = { text: 'example' }

    beforeEach(() => {
      node = ipld.createDirtyNode(exampleObj)
    })

    test('is a js object', () => {
      expect(node).not.toBeFalsy()
    })

    test('is equivalent to the given object', () => {
      expect(Object.values(node)).toEqual(Object.values(exampleObj))
    })

    test('throws if you try to read its cid', () => {
      expect(() => { ipld.readCID(node) }).toThrow('Can\'t read CID of unloaded ipld node')
    })

    test('has a status of \'dirty\'', () => {
      expect(node[Symbol.for('merkling#status')]).toBe(ipld.DIRTY)
    })
  })

  describe('a saved ipld node', () => {
    let node
    const exampleObj = { text: 'saved example' }

    beforeEach(() => {
      node = ipld.createSavedNode(exampleIpfsHash, exampleObj)
    })

    test('is a js object', () => {
      expect(node).not.toBeFalsy()
    })

    test('is equivalent to the given object', () => {
      expect(Object.values(node)).toEqual(Object.values(exampleObj))
    })

    test('has a readable cid', () => {
      const cid = ipld.readCID(node)
      expect(CID.isCID(cid)).toBe(true)
      expect(cid.toBaseEncodedString()).toBe(exampleIpfsHash)
    })

    test('has a status of \'saved\'', () => {
      expect(node[Symbol.for('merkling#status')]).toBe(ipld.SAVED)
    })
  })

  describe('a poorly constructed ipld node', () => {
    test('due to an unknown status', () => {
      expect(() => ipld.create(exampleIpfsHash, 'WRONG', {})).toThrow('Unrecognized status WRONG')
    })
  })

  describe('state changes', () => {
    describe('proxy to saved', () => {
      let link
      const exampleObj = { text: 'example' }
      beforeEach(() => {
        link = ipld.createLinkNode(exampleIpfsHash)

        ipld.transition(link, { 'transition': 'load', 'object': exampleObj })
      })

      test('is equivalent to the given object', () => {
        expect(Object.values(link)).toEqual(Object.values(exampleObj))
      })

      test('has a readable cid', () => {
        const cid = ipld.readCID(link)
        expect(CID.isCID(cid)).toBe(true)
        expect(cid.toBaseEncodedString()).toBe(exampleIpfsHash)
      })

      test('has a status of \'saved\'', () => {
        expect(link[Symbol.for('merkling#status')]).toBe(ipld.SAVED)
      })
    })

    describe('dirty to saved', () => {
      let node
      const exampleObj = { text: 'example' }

      beforeEach(() => {
        node = ipld.createDirtyNode(exampleObj)
        ipld.transition(node, { transition: 'save', cid: new CID(exampleIpfsHash) })
      })

      test('is equivalent to the given object', () => {
        expect(Object.values(node)).toEqual(Object.values(exampleObj))
      })

      test('has a readable cid', () => {
        const cid = ipld.readCID(node)
        expect(CID.isCID(cid)).toBe(true)
        expect(cid.toBaseEncodedString()).toBe(exampleIpfsHash)
      })

      test('has a status of \'saved\'', () => {
        expect(node[Symbol.for('merkling#status')]).toBe(ipld.SAVED)
      })
    })

    describe('saved to dirty', () => {
      let node
      const exampleObj = { text: 'example' }

      beforeEach(() => {
        node = ipld.createSavedNode(exampleIpfsHash, exampleObj)
        node.text = 'changed'
      })

      test('is equivalent to the updated object', () => {
        expect(Object.values(node)).toEqual(Object.values({text: 'changed'}))
      })

      test('throws if you try to read its cid', () => {
        expect(() => { ipld.readCID(node) }).toThrow('Can\'t read CID of unloaded ipld node')
      })

      test('has a status of \'dirty\'', () => {
        expect(node[Symbol.for('merkling#status')]).toBe(ipld.DIRTY)
      })
    })

    describe('guards the state of the nodes', () => {
      const exampleObj = { text: 'example' }

      test('only unloaded can be loaded', () => {
        const savedNode = ipld.createSavedNode(exampleIpfsHash, exampleObj)

        expect(() => {
          ipld.transition(savedNode, { 'transition': 'load', 'object': exampleObj })
        }).toThrowError('Transition not allowed load in state SAVED')
      })

      test('only dirty can be saved', () => {
        const savedNode = ipld.createSavedNode(exampleIpfsHash, exampleObj)

        expect(() => {
          ipld.transition(savedNode, { transition: 'save', cid: new CID(exampleIpfsHash) })
        }).toThrowError('Transition not allowed save in state SAVED')
      })

      test('by limiting to only known transitions', () => {
        const savedNode = ipld.createSavedNode(exampleIpfsHash, exampleObj)

        expect(() => {
          ipld.transition(savedNode, { transition: 'UNKNOWN' })
        }).toThrowError('Unknown transition UNKNOWN')
      })
    })
  })
})
