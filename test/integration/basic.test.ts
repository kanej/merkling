import IPFS from 'ipfs'
import { Merkling, ICid } from '../../src/merkling'

const setupIpfsNode = () => {
  return new Promise((resolve: Function, reject: Function) => {
    const node = new IPFS({
      repo: './.test-ipfs',
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    return node.on('ready', (err: Error) => {
      if (err) {
        return reject(err)
      }

      return resolve(node)
    })
  })
}

// eslint-disable-next-line
const shutdownIpfsNode = (node: any) => {
  return new Promise((resolve: Function, reject: Function) => {
    return node.stop((err: Error) => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}

describe('Persisting', () => {
  // eslint-disable-next-line
  let ipfs: any
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

  it('saves an object with a text property', async () => {
    expect(ipfs).toBeTruthy()
    const merkling = new Merkling({ ipfs })

    const session = merkling.createSession()

    const proxy = session.create({
      text: 'Another'
    })

    await session.save()
    const cid = Merkling.cid(proxy)

    expect(cid).toBeTruthy()
    expect((cid as ICid).toBaseEncodedString()).toBe(
      'zBwWX5L5CfQVRtenLYbHXYCTVPjzToZKqpRrXCjVVcfXHYs15HQCq46ZoWHyhDgtzbwkF3vhnsc7Ub9EhfX7S4qupAZMf'
    )
  })

  it('saves an object with a nested object', async () => {
    expect(ipfs).toBeTruthy()
    const merkling = new Merkling({ ipfs })

    const session = merkling.createSession()

    const proxy = session.create({
      next: { text: 'Another' }
    })

    await session.save()
    const cid = Merkling.cid(proxy)

    expect(cid).toBeTruthy()
    expect((cid as ICid).toBaseEncodedString()).toBe(
      'zBwWX6oEurdDbZCjpHoogfoYp4xtCiLruWncdNrhQFrYCMVzhTEHTiGNAoWugrWv4BS6eDGLqc35vyc8YPszU2CGnQwn3'
    )
  })
})
