import { Merkling } from '../../src/merkling'
import { setupIpfsNode, shutdownIpfsNode } from './helpers'
import { ICid } from '../../src/domain'

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

  it('saves a nested merkling objects', async () => {
    const session = merkling.createSession()

    const feed: IFeed = session.create({
      title: 'Poetry',
      author: 'P. Kavanagh',
      posts: null
    })

    const thought1: IPost = session.create({
      text:
        'Beauty was that, Far vanished flame, Call it a star, wanting better name'
    })

    const thought2: IPost = session.create({
      text: 'And gaze vaguely until, Nothing is left, Save a grey ghost-hill'
    })

    const thought3: IPost = session.create({
      text: "Here wait I, On the world's rim, Stretching out hands, To Seraphim"
    })

    feed.posts = thought1
    thought1.next = thought2
    thought2.next = thought3

    await session.save()

    const feedCid = Merkling.cid(feed)
    expect(feedCid).toBeTruthy()

    expect(Merkling.isIpldNode(thought1)).toBe(true)
    const though1Cid = Merkling.cid(thought1)
    expect(though1Cid).toBeTruthy()

    expect(Merkling.isIpldNode(thought2)).toBe(true)
    const though2Cid = Merkling.cid(thought2)
    expect(though2Cid).toBeTruthy()

    expect(Merkling.isIpldNode(thought3)).toBe(true)
    const though3Cid = Merkling.cid(thought3)
    expect(though3Cid).toBeTruthy()

    const secondSession = merkling.createSession()

    // eslint-disable-next-line
    const savedProxy: any = await secondSession.get(
      (feedCid as ICid).toBaseEncodedString()
    )

    await Merkling.resolve(savedProxy.posts)
    await Merkling.resolve(savedProxy.posts.next)
    await Merkling.resolve(savedProxy.posts.next.next)

    expect(savedProxy).toStrictEqual({
      title: 'Poetry',
      author: 'P. Kavanagh',
      posts: {
        text:
          'Beauty was that, Far vanished flame, Call it a star, wanting better name',
        next: {
          text:
            'And gaze vaguely until, Nothing is left, Save a grey ghost-hill',
          next: {
            text:
              "Here wait I, On the world's rim, Stretching out hands, To Seraphim"
          }
        }
      }
    })

    expect(Merkling.isIpldNode(savedProxy)).toBe(true)
    expect(Merkling.isIpldNode(savedProxy.posts)).toBe(true)
    expect(Merkling.isIpldNode(savedProxy.posts.next)).toBe(true)
  })
})
