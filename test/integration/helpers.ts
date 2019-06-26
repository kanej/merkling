import ipfsClient from 'ipfs-http-client'

export const setupIpfsNode = () => {
  return new Promise((resolve: Function) => {
    const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
    return resolve(ipfs)
  })
}

// eslint-disable-next-line
export const shutdownIpfsNode = (node: any) => {
  return new Promise((resolve: Function) => {
    resolve()
  })
}
