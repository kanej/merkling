import { Merkling, ICid } from '../../src/merkling'
import { setupIpfsNode, shutdownIpfsNode } from './helpers'

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
})
