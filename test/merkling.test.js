'use strict'

const { setupNode, shutdownNode } = require('../src/ipfs')
const Merkling = require('../src/merkling')

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
