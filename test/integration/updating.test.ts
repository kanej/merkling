import { Merkling } from '../../src/merkling'
import { setupIpfsNode, shutdownIpfsNode } from './helpers'
import { ICid } from '../../src/domain'

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

  it('persists changes to a tracked simple pojo', async () => {
    const session = merkling.createSession()
    const original = {
      text: 'example',
      num: 5,
      bool: true
    }

    const originalHash =
      'zBwWX5xGRGty16cZdniYygq3Ndco8txjYTrnCzBm28d2LCxxQDvKJGFER6jchQLPEPx1Lxi29oAK2mXCFhtaQfGkwKirL'

    const proxy = session.create(original)

    await session.save()
    const cid = Merkling.cid(proxy)

    expect(cid).toBeTruthy()
    expect((cid as ICid).toBaseEncodedString()).toBe(originalHash)

    proxy.text = 'updated'

    await session.save()

    const updatedHash =
      'zBwWX5i5TmCBRWhyVtLqPMMEJzPN1xD39S3aw1CJR9nZfak1A8T3Ujst1RcddHwH9pLX5TYub9DVqZ1GA5ZDwvmmZuooW'

    const updatedCid = Merkling.cid(proxy)

    expect(updatedCid).toBeTruthy()
    expect((updatedCid as ICid).toBaseEncodedString()).toBe(updatedHash)

    const secondSession = merkling.createSession()

    const saved = await secondSession.get(
      (updatedCid as ICid).toBaseEncodedString()
    )

    expect(saved).toStrictEqual({
      text: 'updated',
      num: 5,
      bool: true
    })
  })

  it('persists changes to a tracked nested pojo', async () => {
    const session = merkling.createSession()
    const nested = {
      text: 'example',
      next: {
        text: 'sub'
      }
    }

    const proxy = session.create(nested)

    await session.save()
    const cid = Merkling.cid(proxy)

    const nestedHash =
      'zBwWX8JMC4q3oynEBf6ExR9DtvTMShsfgYtrXofkpSaMUxmPnjhwKnMorTPnDM1qkLJTJn6tJThwpERsTigjwZH8N3t6z'

    expect(cid).toBeTruthy()
    expect((cid as ICid).toBaseEncodedString()).toBe(nestedHash)

    proxy.next.text = 'updated'

    await session.save()

    const updatedHash =
      'zBwWX6FLK46L6wwmckuXG16ynLvzFtHoaaauCGSAQxb9KZ8QJRYaHYxoQQc5HtsAMWAEKkxNjg3NuixZzdGM5c2gZabNK'

    const updatedCid = Merkling.cid(proxy)

    expect(updatedCid).toBeTruthy()
    expect((updatedCid as ICid).toBaseEncodedString()).toBe(updatedHash)

    const secondSession = merkling.createSession()

    const saved = await secondSession.get(
      (updatedCid as ICid).toBaseEncodedString()
    )

    expect(saved).toStrictEqual({
      text: 'example',
      next: {
        text: 'updated'
      }
    })
  })

  interface IPhilosopher {
    name: string
    taught?: IPhilosopher
  }

  it('persists the parents when a child is edited and session saved', async () => {
    let originCid: ICid | null | undefined
    let updatedCid: ICid | null | undefined

    await merkling.withSession(async session => {
      const socrates: IPhilosopher = session.create({ name: 'Socrates' })
      const plato: IPhilosopher = session.create({ name: 'Plato' })
      const aristotle = session.create({ name: 'Aristotle' })

      socrates.taught = plato
      plato.taught = aristotle

      await session.save()

      originCid = Merkling.cid(socrates)
    })

    expect(originCid).toBeTruthy()

    await merkling.withSession(async session => {
      const socrates = (await session.get(originCid as ICid)) as IPhilosopher

      const plato = socrates.taught as IPhilosopher
      await Merkling.resolve(plato)

      const aristotle = plato.taught as IPhilosopher
      await Merkling.resolve(aristotle)

      aristotle.taught = session.create({ name: 'Alex' })

      expect(Merkling.isDirty(aristotle)).toBe(true)
      expect(Merkling.isDirty(plato)).toBe(true)
      expect(Merkling.isDirty(socrates)).toBe(true)

      await session.save()

      updatedCid = Merkling.cid(socrates)
    })

    expect(updatedCid).toBeTruthy()

    expect((updatedCid as ICid).toBaseEncodedString()).not.toBe(
      (originCid as ICid).toBaseEncodedString()
    )

    await merkling.withSession(async session => {
      const socrates = (await session.get(updatedCid as ICid)) as IPhilosopher

      const plato = socrates.taught as IPhilosopher
      await Merkling.resolve(plato)

      const aristotle = plato.taught as IPhilosopher
      await Merkling.resolve(aristotle)

      const alex = aristotle.taught as IPhilosopher
      await Merkling.resolve(alex)

      expect(alex.name).toBe('Alex')
    })
  })
})
