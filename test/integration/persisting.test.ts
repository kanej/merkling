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
})
