'use strict'

const { setupNode, shutdownNode } = require('../src/ipfs')
const Merkling = require('../src/merkling')

describe('api tests', () => {
  var node = null

  beforeAll((done) => {
    setupNode().then((n) => {
      node = n
      done()
    })
  })

  afterAll((done) => {
    shutdownNode(node).then(() => {
      done()
    })
  })

  var merkle
  beforeEach(() => {
    merkle = new Merkling({ipfs: node})
  })

  test('Save a simple object', (done) => {
    const simple = {name: 'Example'}
    merkle.save(simple).then(returned => {
      expect(returned).not.toBeNull()
      expect(returned.name).toBe('Example')
      expect(returned._cid).not.toBeNull()
      expect(returned._cid.toBaseEncodedString()).toBe('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
      done()
    })
  })

  test('Retrieve a simple object', (done) => {
    merkle.get('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF').then(returned => {
      expect(returned).not.toBeNull()
      expect(returned.name).toBe('Example')
      expect(returned._cid).not.toBeNull()
      expect(returned._cid.toBaseEncodedString()).toBe('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
      done()
    })
  })

  test('Save a linked object', (done) => {
    const vlad = {name: 'vlad'}
    const don = {name: 'don'}
    merkle.save(vlad).then(savedVlad => {
      don.knows = savedVlad
      merkle.save(don).then(savedDon => {
        expect(savedDon).not.toBeNull()
        expect(savedDon.name).toBe('don')
        expect(savedDon._cid).not.toBeNull()
        expect(savedDon._cid.toBaseEncodedString()).toBe('zdpuAsJvqKFE2XfU63LTfhrhjEAGMCVjQsJKnXjqBoaGMmP29')
        expect(savedDon.knows).not.toBeNull()
        expect(savedDon.knows.name).toBe('vlad')
        done()
      })
    })
  })

  test('Read a linked object', (done) => {
    const vlad = {name: 'vlad'}
    const don = {name: 'don'}
    merkle.save(vlad).then(savedVlad => {
      don.knows = savedVlad
      merkle.save(don).then(savedDon => {
        merkle.get(savedDon._cid).then(ipfsDon => {
          expect(ipfsDon).not.toBeNull()
          expect(ipfsDon.name).toBe('don')
          expect(ipfsDon._cid).not.toBeNull()
          expect(ipfsDon._cid.toBaseEncodedString()).toBe('zdpuAsJvqKFE2XfU63LTfhrhjEAGMCVjQsJKnXjqBoaGMmP29')
          expect(ipfsDon.knows).not.toBeNull()
          expect(ipfsDon.knows._cid).not.toBeUndefined()
          expect(ipfsDon.knows._cid.toBaseEncodedString()).toBe('zdpuAze7Z1QRUeuXFFQ1gNjQ6UnyHfjoz5RHLtA4baJjBLAkq')
          done()
        }).catch(err => {
          expect(err).toBeNull()
          done()
        })
      }).catch(er1 => {
        expect(er1).toBeNull()
        done()
      })
    }).catch(error => {
      expect(error).toBeNull()
      done()
    })
  })
})
