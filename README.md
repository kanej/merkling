# merkling

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A js object to IPFS merkle dag mapper

The IPFS project exposes an underlying graph data structure where each link is a hash, this supports the peer to peer file sharing and goes under the Interplanetary Linked Data project (IPLD) project. Merkling is a small library for interacting with the IPLD graph in js as if it was an in-memory data structure.

## Table of Contents

-   [Install](#install)
-   [Usage](#usage)
-   [API](#api)
-   [Maintainers](#maintainers)
-   [Contribute](#contribute)
-   [License](#license)

## Install

```bash
npm install --save merkling
```

## Usage

Merkling requires pulling an ipfs instance, either through `js-ipfs` or `ipfs-http-client`

```javascript
const Merkling = require('merkling').Merkling
// eslint-disable-next-line
var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

const main = async () => {
  const merkling = new Merkling({ ipfs })

  let feedCid
  await merkling.withSession(async session => {
    const feed = session.create({
      title: 'Thoughts',
      author: 'anon',
      posts: []
    })

    const post1 = session.create({
      text: 'A beginning'
    })

    const post2 = session.create({
      text: 'A middle'
    })

    const post3 = session.create({
      text: 'An end'
    })

    post1.next = post2
    post2.next = post3
    feed.posts[0] = post1
    feed.posts[1] = post2
    feed.posts[2] = post3

    await session.save()

    feedCid = Merkling.cid(feed)
    console.log(`Feed CID: ${feedCid.toBaseEncodedString()}`)
  })

  await merkling.withSession(async session => {
    const savedFeed = await session.get(feedCid)

    console.log('')
    console.log(`Title: ${savedFeed.title} by ${savedFeed.author}`)
    console.log('---------------------')

    for (const post of savedFeed.posts) {
      await Merkling.resolve(post)
      console.log(post.text)
    }

    console.log('')
  })
}

main()
```

## Maintainers

[@kanej](https://github.com/kanej)

## Contribute

See [the contribute file](contribute.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2019 John Kane
