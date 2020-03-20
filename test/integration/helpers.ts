import Ipfs from 'ipfs'

export const setupIpfsNode = async () => {
  return Ipfs.create({
    repo: './.test-ipfs',
    silent: true,
    config: {
      Bootstrap: []
    }
  })
}

// eslint-disable-next-line
export const shutdownIpfsNode = (node: any) => {
  return node.stop()
}
