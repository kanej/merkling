import ipfsClient from 'ipfs-http-client'

enum Modes {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

const mode = process.env.INTEGRATION_MODE || Modes.EXTERNAL

export const setupIpfsNode = () => {
  return new Promise((resolve: Function, reject: Function) => {
    if (mode === Modes.INTERNAL) {
      // const node = new IPFS({
      //   repo: './.test-ipfs',
      //   config: {
      //     Addresses: {
      //       Swarm: []
      //     }
      //   }
      // })

      // return node.on('ready', (err: Error) => {
      //   if (err) {
      //     return reject(err)
      //   }

      //   return resolve(node)
      // })
    } else {
      const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
      return resolve(ipfs)
    }
  })
}

// eslint-disable-next-line
export const shutdownIpfsNode = (node: any) => {
  return new Promise((resolve: Function, reject: Function) => {
    if (mode === Modes.INTERNAL) {
      // return node.stop((err: Error) => {
      //   if (err) {
      //     return reject(err)
      //   }

      //   return resolve()
      // })
    } else {
      resolve()
    }
  })
}
