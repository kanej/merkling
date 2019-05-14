import IPFS from 'ipfs'
import { Merkling, ICid } from '../../src/merkling'

const setupIpfsNode = () => {
  return new Promise((resolve: Function, reject: Function) => {
    const node = new IPFS({
      repo: './.test-ipfs'
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

describe('Saving a simple object', () => {
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

  it('persists to IPFS', async () => {
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
})
