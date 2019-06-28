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
        'bafyriqansvyxo7slc4rulstsuyficjoe237yb75ohd7zagerchgp6fnfas6hxa22j5s5qcutgr6g6nex3bgny5obk4ah3czq25jkt66olotym',
      data: {
        text: 'Another'
      }
    })
  })

  it('saves an object with a nested object', async () => {
    await checkPersistAndReload(merkling, {
      hash:
        'bafyriqcxa5tlhjim3fx2z2llzme735swifh7c765healo3epx3nskppadwl3sl345uhx7xgavjqyikui343lycxzopq6xyzketplgaqq4xk5i',
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

  it('saves proxies created nested within each other', async () => {
    let savedCid: ICid
    await merkling.withSession(async session => {
      const socrates = session.create({
        name: 'socrates',
        taught: session.create({
          name: 'plato',
          taught: session.create({
            name: 'aristotle'
          })
        })
      })

      expect(Merkling.isIpldNode(socrates)).toBe(true)
      expect(Merkling.isIpldNode(socrates.taught)).toBe(true)
      expect(Merkling.isIpldNode(socrates.taught.taught)).toBe(true)

      await session.save()

      savedCid = Merkling.cid(socrates) as ICid
    })

    await merkling.withSession(async session => {
      const socrates = await session.get(savedCid)

      const plato = socrates.taught
      await Merkling.resolve(plato)

      const aristotle = plato.taught
      await Merkling.resolve(aristotle)

      expect(aristotle.name).toBe('aristotle')
    })
  })

  it('saves proxies created setting with nested proxies', async () => {
    let savedCid: ICid
    await merkling.withSession(async session => {
      // eslint-disable-next-line
      const socrates: any = session.create({
        name: 'socrates'
      })

      socrates.taught = [
        session.create({
          name: 'plato'
        }),
        session.create({
          name: 'xenophon'
        })
      ]

      expect(Merkling.isIpldNode(socrates)).toBe(true)
      expect(Merkling.isIpldNode(socrates.taught[0])).toBe(true)
      expect(Merkling.isIpldNode(socrates.taught[1])).toBe(true)

      await session.save()

      savedCid = Merkling.cid(socrates) as ICid
    })

    await merkling.withSession(async session => {
      const socrates = await session.get(savedCid)

      const plato = socrates.taught[0]
      await Merkling.resolve(plato)

      const xenophon = socrates.taught[1]
      await Merkling.resolve(xenophon)

      expect(plato.name).toBe('plato')
      expect(xenophon.name).toBe('xenophon')
    })
  })
})
