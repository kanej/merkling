import IPFS from 'ipfs'

export const setupIpfsNode = () => {
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
export const shutdownIpfsNode = (node: any) => {
  return new Promise((resolve: Function, reject: Function) => {
    return node.stop((err: Error) => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}
