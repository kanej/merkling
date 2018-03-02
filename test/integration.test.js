'use strict'

const { setupNode, shutdownNode } = require('./ipfsHelpers')
const Merkling = require('../src/merkling')

describe('Scenarios', () => {
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

  test('Building up graph with saves', async () => {
    const post2 = await merkle.save({
      text: 'Why wasn\'t I born French'
    })

    const post1 = await merkle.save({
      text: 'I love farms but I prefer guinness',
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

  test('Building a graph with unsaved nodes and a final commit', async () => {
    const head = await merkle.create({
      title: 'Thoughts on Poetry',
      author: 'P. Kavanagh',
      feed: null
    })

    const post1 = await merkle.create({
      text: 'I love farms but I prefer guinness',
      next: null
    })

    const post2 = await merkle.create({
      text: 'Why wasn\'t I born French'
    })

    head.feed = post1
    post1.next = post2

    await merkle.save(head)

    const loadedHead = await merkle.get(head._cid)

    await merkle.resolve(loadedHead.feed)
    await merkle.resolve(loadedHead.feed.next)
    expect(loadedHead.feed.next.text).toBe('Why wasn\'t I born French')

    const loadedHeadCid = loadedHead._cid.toBaseEncodedString()
    await new Promise((resolve, reject) => {
      node.dag.get(`${loadedHeadCid}/feed/next/text`, (err, text) => {
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
