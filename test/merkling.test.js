'use strict'

const { setupNode, shutdownNode } = require('./ipfsHelpers')
const Merkling = require('../src/merkling')

describe('merkling', () => {
  test('must be initialized with an ipfs node', () => {
    expect(() => new Merkling({})).toThrow('IPFS must be passed as an option to Merkling')
  })
})

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

  test('Create an IPLD node', () => {
    const simple = {name: 'Example'}
    const ipldNode = merkle.create(simple)
    expect(ipldNode).not.toBeNull()
    expect(ipldNode.name).toBe('Example')
    expect(ipldNode._cid).toBeFalsy()
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

  test('Save a complicated object', (done) => {
    const complicated = { name: 'Example', sub: { sub2: { text: 'boom' } } }
    merkle.save(complicated).then(returned => {
      expect(returned).not.toBeNull()
      expect(returned.name).toBe('Example')
      expect(returned._cid).not.toBeNull()
      expect(returned.sub.sub2.text).toBe('boom')
      expect(returned._cid.toBaseEncodedString()).toBe('zdpuArr3FwUkkzeBh6MCdS2pSxiLxVHYJ3fCkNLivGWVrRMBD')
      done()
    })
  })

  test('Save an unsaved IPLD node', (done) => {
    const simple = {name: 'Example'}
    const node = merkle.create(simple)
    merkle.save(node).then(returned => {
      expect(returned).not.toBeNull()
      expect(returned.name).toBe('Example')
      expect(returned._cid).not.toBeNull()
      expect(returned._cid.toBaseEncodedString()).toBe('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
      done()
    })
  })

  test('Save a saved IPLD node', async (done) => {
    const simple = { name: 'Example' }
    const node = merkle.create(simple)
    const savedNode = await merkle.save(node)
    const savedAgain = await merkle.save(savedNode)
    expect(savedAgain).not.toBeNull()
    expect(savedAgain.name).toBe('Example')
    expect(savedAgain._cid).not.toBeNull()
    expect(savedAgain._cid.toBaseEncodedString()).toBe('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
    done()
  })

  test('Save an object with a nested null', async (done) => {
    const simple = { name: 'Example', next: null }
    const node = merkle.create(simple)
    const savedNode = await merkle.save(node)
    expect(savedNode).not.toBeNull()
    expect(savedNode.name).toBe('Example')
    expect(savedNode._cid).not.toBeNull()
    expect(savedNode._cid.toBaseEncodedString()).toBe('zdpuAm1ZHnidGxaUbTExkEeEYZRG6jxNPsgeZNe53L6hB5Ny6')
    expect(savedNode.next).toBeNull()
    done()
  })

  test('Saving null throws', () => {
    expect(() => { merkle.save(null) }).toThrow('Argument exception, trying to save null or undefined')
  })

  test('Saving with an underlying ipfs error bubbles up', (done) => {
    merkle.ipfs = {
      dag: {
        put: (node, options, cb) => { cb(Error('IPFS Exploded!')) }
      }
    }

    merkle.save({ text: 'example' }).then(returned => {
      expect(returned).toBeNull()
    }).catch(err => {
      expect(err).not.toBeFalsy()
      expect(err.message).toBe('IPFS Exploded!')
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

  test('Retrieve an object with null properties', (done) => {
    merkle.get('zdpuAm1ZHnidGxaUbTExkEeEYZRG6jxNPsgeZNe53L6hB5Ny6').then(returned => {
      expect(returned).not.toBeNull()
      expect(returned.name).toBe('Example')
      expect(returned._cid).not.toBeNull()
      expect(returned._cid.toBaseEncodedString()).toBe('zdpuAm1ZHnidGxaUbTExkEeEYZRG6jxNPsgeZNe53L6hB5Ny6')
      expect(returned.next).toBeNull()
      done()
    })
  })

  test('retrieving with an ipfs error bubbles up', (done) => {
    merkle.ipfs = {
      dag: {
        get: (cid, cb) => { cb(Error('IPFS Exploded!')) }
      }
    }

    merkle.get('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF').then(returned => {
      expect(returned).toBeNull()
    }).catch(err => {
      expect(err).not.toBeFalsy()
      expect(err.message).toBe('IPFS Exploded!')
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
    const don = {name: 'don', business: {type: 'hotels'}}
    merkle.save(vlad).then(savedVlad => {
      don.knows = savedVlad
      merkle.save(don).then(savedDon => {
        merkle.get(savedDon._cid).then(ipfsDon => {
          expect(ipfsDon).not.toBeNull()
          expect(ipfsDon.name).toBe('don')
          expect(ipfsDon.business).toEqual({type: 'hotels'})
          expect(ipfsDon._cid).not.toBeNull()
          expect(ipfsDon._cid.toBaseEncodedString()).toBe('zdpuAn6nLxAHH3pfh9QyMwaqJwzAfDvPn6yi45SQn9MX4xPfA')
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

  test('Resolving an unloaded ipld node', async (done) => {
    const unloaded = await merkle.load('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
    await merkle.resolve(unloaded)

    expect(unloaded).not.toBeNull()
    expect(unloaded.name).toBe('Example')
    expect(unloaded._cid).not.toBeNull()
    expect(unloaded._cid.toBaseEncodedString()).toBe('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
    done()
  })

  test('Resolving a pojo returns the pojo', async (done) => {
    const pojo = { text: 'dull' }
    Object.freeze(pojo)
    const returnedPojo = await merkle.resolve(pojo)

    expect(returnedPojo).not.toBeNull()
    expect(returnedPojo).toBe(pojo)
    done()
  })

  test('Resolving a saved IPLD node returns the IPLD node immediately', async (done) => {
    const savedNode = await merkle.get('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
    Object.freeze(savedNode)
    const returnedNode = await merkle.resolve(savedNode)

    expect(returnedNode).not.toBeNull()
    expect(returnedNode).toBe(savedNode)
    done()
  })

  test('Resolving a dirty IPLD node throws', async (done) => {
    const dirtyNode = await merkle.create({ text: 'dull' })

    await expect(merkle.resolve(dirtyNode))
      .rejects
      .toThrow('Cannot resolve a dirty ipld node')

    done()
  })

  test('Resolving with an ipfs error bubbles up', (done) => {
    merkle.ipfs = {
      dag: {
        get: (cid, cb) => { cb(Error('IPFS Exploded!')) }
      }
    }

    const unloaded = merkle.load('zdpuAqrurk63wySXeaPtB2jPqFtfS3Zfdt7vAyeGCYwt7MPYF')
    merkle.resolve(unloaded).then(returned => {
      expect(returned).toBeNull()
    }).catch(err => {
      expect(err).not.toBeFalsy()
      expect(err.message).toBe('IPFS Exploded!')
      done()
    })
  })
})
