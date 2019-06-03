import { Merkling, ICid } from '../../src/merkling'
import { setupIpfsNode, shutdownIpfsNode } from './helpers'

const checkPersistAndReload = async (
  merkling: Merkling,
  {
    hash,
    data
  }: {
    hash: string
    data: {}
  }
) => {
  const session = merkling.createSession()

  const original = data

  const proxy = session.create(original)

  await session.save()
  const cid = Merkling.cid(proxy)

  expect(cid).toBeTruthy()
  expect((cid as ICid).toBaseEncodedString()).toBe(hash)

  const secondSession = merkling.createSession()

  const saved = await secondSession.get(hash)

  expect(saved).toStrictEqual(original)
}

describe('Persisting', () => {
  // eslint-disable-next-line
  let ipfs: any
  let merkling: Merkling
  beforeAll(async () => {
    try {
      ipfs = await setupIpfsNode()
    } catch (err) {
      throw err
    }
  })

  afterAll(async () => {
    await shutdownIpfsNode(ipfs)
  })

  beforeEach(() => {
    merkling = new Merkling({ ipfs })
  })

  it('saves an object with a text property', async () => {
    await checkPersistAndReload(merkling, {
      hash:
        'zBwWX5L5CfQVRtenLYbHXYCTVPjzToZKqpRrXCjVVcfXHYs15HQCq46ZoWHyhDgtzbwkF3vhnsc7Ub9EhfX7S4qupAZMf',
      data: {
        text: 'Another'
      }
    })
  })

  it('saves an object with a nested object', async () => {
    await checkPersistAndReload(merkling, {
      hash:
        'zBwWX6oEurdDbZCjpHoogfoYp4xtCiLruWncdNrhQFrYCMVzhTEHTiGNAoWugrWv4BS6eDGLqc35vyc8YPszU2CGnQwn3',
      data: {
        next: { text: 'Another' }
      }
    })
  })

  interface IFeed {
    title: string
    // eslint-disable-next-line
    posts?: any
  }

  interface IPost {
    text: string
    // eslint-disable-next-line
    next?: any
  }

  it('saves an nested merkling objects', async () => {
    const session = merkling.createSession()

    const feed: IFeed = session.create({
      title: 'Thoughts'
    })

    const thought1: IPost = session.create({
      text: 'More poetry please'
    })

    const thought2: IPost = session.create({
      text: 'That is enough'
    })

    feed.posts = thought1
    thought1.next = thought2

    await session.save()

    const feedCid = Merkling.cid(feed)
    expect(feedCid).toBeTruthy()
    // expect((feedCid as ICid).toBaseEncodedString()).toBe('zzzz')

    expect(Merkling.isIpldNode(thought1)).toBe(true)
    const though1Cid = Merkling.cid(thought1)
    expect(though1Cid).toBeTruthy()

    expect(Merkling.isIpldNode(thought2)).toBe(true)
    const though2Cid = Merkling.cid(thought2)
    expect(though2Cid).toBeTruthy()

    const secondSession = merkling.createSession()

    // eslint-disable-next-line
    const savedProxy: any = await secondSession.get(
      (feedCid as ICid).toBaseEncodedString()
    )

    expect(savedProxy).toStrictEqual({
      title: 'Thoughts',
      posts: {
        text: 'More poetry please',
        next: {
          text: 'That is enough'
        }
      }
    })

    expect(Merkling.isIpldNode(savedProxy)).toBe(true)
    expect(Merkling.isIpldNode(savedProxy.posts)).toBe(true)
    expect(Merkling.isIpldNode(savedProxy.posts.next)).toBe(true)
  })
})
