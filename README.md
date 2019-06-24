<!-- <div align="center">
    <img src="./logo/merkling.svg" alt="IPFS in JavaScript logo" width="100" />
</div> -->

# merkling

[![CircleCI](https://img.shields.io/circleci/build/github/kanej/merkling/master.svg?label=circleci&style=flat-square)](https://circleci.com/gh/kanej/merkling)
[![npm](https://img.shields.io/npm/v/merkling.svg?style=flat-square)](https://www.npmjs.com/package/merkling "View on NPM")
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

> A js object to IPFS merkle dag mapper

Merkling is a small library for interacting with the [IPLD](https://ipld.io) directed acyclic graph (DAG) in js as if it were an in-memory data structure. The idea is to introduce an exciting new impedance mismatch to the world.

> This is alpha software

## Table of Contents

-   [Background](#background)
-   [Install](#install)
-   [Usage](#usage)
-   [Browser Support](#browser%20support)
-   [Maintainers](#maintainers)
-   [Contribute](#contribute)
-   [License](#license)

## Background

IPLD ([Interplanetary Linked Data](https://iplid.io)) is the graph data strucuture that underpins [IPFS](https://ipfs.io) and its file sharing capabilities. In IPFS it is used for modelling a filesystem, but it is capable of modelling more fine grained data structures.

Being able to store and syncronise a complex graph of data between many clients with the trust guarantees that content addressing provides makes IPLD an attractive option for building dapps. However the IPLD api is low level.

Merkling is an attempt at a different api borrowing from the world of ORMs (nothing could possibly go wrong). The idea is to use ES6 proxies to seamlessly confuse developers with the illusion that IPLD blocks are JS objects and that edges from IPLD block to IPLD block are JS object references.

See the [usage section](#usage) for an example.

## Install

```bash
npm install --save merkling
```

## Usage

Merkling requires pulling an ipfs instance, either through [js-ipfs](https://github.com/ipfs/js-ipfs) or [ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client)

```javascript
const Merkling = require('merkling')

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

## Browser Support

Merkling requires ES6 Proxies to do its black magic, hence requires a recent version of node or an ever green browser.

## Maintainers

[@kanej](https://github.com/kanej)

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2019 John Kane
