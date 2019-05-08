import MockIpfs from './mockIpfs'
import { Merkling } from '../src/merkling'
import MerklingSession from '../src/merklingSession'

describe('Creating a session', () => {
  let session: MerklingSession

  beforeEach(() => {
    const merkling = new Merkling({ ipfs: new MockIpfs() })

    session = merkling.createSession()
  })

  it('is a merkling session', () => {
    expect(session.constructor.name).toBe('MerklingSession')
  })
})
