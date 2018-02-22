'use strict'

const { setupNode, shutdownNode } = require('./ipfsHelpers')
const Merkling = require('../src/merkling')

describe('Building up graph with saves', () => {
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

  test('Save a simple object', async () => {
    const post2 = await merkle.save({
      text: 'Why wasn\'t I born French'
    })

    const post1 = await merkle.save({
      text: 'I love farms but I prefer women',
      next: post2
    })

    const head = await merkle.save({
      title: 'Thoughts on Poetry',
      author: 'P. Kavanagh',
      feed: post1
    })

    const cid = head._cid.toBaseEncodedString()

    await new Promise((resolve, reject) => {
      node.dag.get(`${cid}/feed/next/text`, (err, text) => {
        if (err) {
          expect(err).toBeNull()
          return reject(err)
        }

        expect(text.value).toBe('Why wasn\'t I born French')
        resolve()
      })
    })
  })
})
