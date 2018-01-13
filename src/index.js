'use strict'

const { setupNode, shutdownNode } = require('./ipfs')
const Merkling = require('./merkling')

const saveBlocks = (node) => {
  const block = {
    name: 'examp;e',
    another: 'boom'
  }

  var merkle = new Merkling({ipfs: node})

  return merkle.save(block)

  // node.dag.put(block, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
  //   if (err) {
  //     throw err
  //   }
  //   console.log(cid.toBaseEncodedString())
  // })

  // return node
}

// const getBlock = (node) => {
//   return new Promise((resolve, reject) => {
//     node.dag.get('zdpuAr6Unjwv3khds7y75vhQTcdqwWjWUbLyf31vPQsHWGKnF', (err, block) => {
//       if (err) {
//         return reject(err)
//       }

//       console.log(block.value)
//       resolve(node)
//     })
//   })
// }

setupNode().then((node) => {
  saveBlocks(node)
    .then((block) => {
      const cid = block._cid.toBaseEncodedString()
      console.log(cid)
      return cid
    }).then(cid => {
      const merkle = new Merkling({ipfs: node})

      return merkle.get(cid).then(elem => console.log(elem))
    }).done(() => {
      shutdownNode(node)
    })
})
