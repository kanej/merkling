<!-- <div align="center">
    <img src="./logo/merkling.svg" alt="IPFS in JavaScript logo" width="100" />
</div> -->

# merkling

[![CircleCI](https://img.shields.io/circleci/build/github/kanej/merkling/master.svg?label=circleci&style=flat-square)](https://circleci.com/gh/kanej/merkling)
[![npm](https://img.shields.io/npm/v/merkling.svg?style=flat-square)](https://www.npmjs.com/package/merkling 'View on NPM')
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

> A js object to IPFS merkle dag mapper

Merkling is a small library for interacting with the [IPLD](https://ipld.io) directed acyclic graph (DAG) in js as if it were an in-memory data structure. The idea is to introduce an exciting new impedance mismatch to the world.

> This is alpha software

At this stage Merkling is only an exploration of different IPLD api.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Browser Support](#browser%20support)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Background

IPLD ([Interplanetary Linked Data](https://iplid.io)) is the graph data strucuture that underpins [IPFS](https://ipfs.io) and its file sharing capabilities. In IPFS it is used for modelling a filesystem, but it is capable of modelling more fine grained data structures.

Being able to store and syncronise a complex graph of data between many clients with the trust guarantees that content addressing provides makes IPLD an attractive option for building dapps. However the IPLD api is low level.

Merkling is an attempt at a different api borrowing from the world of ORMs (nothing could possibly go wrong). The idea is to use ES6 proxies to seamlessly confuse developers with the illusion that IPLD blocks are JS objects and that edges from IPLD block to IPLD block are JS object references.

See the [usage section](#usage) for an example.

## Install

```bash
npm install --save merkling@alpha
```

## Usage

Merkling requires pulling an ipfs instance, either through [js-ipfs](https://github.com/ipfs/js-ipfs) or [ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client)

```javascript
const Merkling = require('merkling')

var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

const main = async () => {
  const merkling = new Merkling({ ipfs })

  // Create an IPLD graph
  let feedCid
  await merkling.withSession(async session => {
    // Create an IPLD block in-memory
    // (so not persisted to IPFS)
    const feed = session.create({
      title: 'Thoughts',
      author: 'anon',
      posts: []
    })

    // ... and create a few more IPLD blocks
    const post1 = session.create({
      text: 'A beginning'
    })

    const post2 = session.create({
      text: 'A middle'
    })

    const post3 = session.create({
      text: 'An end'
    })

    // Manipulate and create relationships between
    // them as if they were JS objects
    post1.next = post2
    post2.next = post3

    feed.posts = [post1, post2, post3]

    // Persist all IPLD blocks in the session
    // in the right order and with their links
    // [feed] --> [post1]
    //   |          |
    //   |------> [post2]
    //   |          |
    //   |------> [post3]
    await session.save()

    // Print the CID of the root IPLD block
    // of the graph
    feedCid = Merkling.cid(feed)
    console.log(`Original Feed CID: ${feedCid.toBaseEncodedString()}`)
  })

  // Update the IPLD graph, we persisted in a
  // new session
  let updateFeedCid
  await merkling.withSession(async session => {
    // Read the root IPLD block from IPFS,
    // its linked IPLD nodes will be unloaded
    // proxies
    const savedFeed = await session.get(feedCid)

    // Force the loading from IPFS of the linked posts
    for (const post of savedFeed.posts) {
      await Merkling.resolve(post)
    }

    // Update a subnode of the root
    savedFeed.posts[1].text = 'A longer middle'

    // Persist the changes
    await session.save()

    // Print the updated CID of the Root IPLD block
    updateFeedCid = Merkling.cid(savedFeed)
    console.log(`Updated Feed CID: ${updateFeedCid.toBaseEncodedString()}`)
  })

  // Print the new updated graph
  await merkling.withSession(async session => {
    const savedFeed = await session.get(updateFeedCid)

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

Which will produce the output:

```bash
Feed CID: zBwWX9pGzXr5vkRELYnJGvcmtK2JcH2Cw43JJB8XZywzq2eRKiP6W31yuSjb43K7TvY9bBm2WHqLCQNbscxPmkUsJWtqV
Updated Feed CID: zBwWX54YgyC83zywoo9E63i7k3DAx72KMCEK6ZXrweEg6BECnjg7eszhH6gfzuGrkRKA7YHBmLnNMRdHhpPiL5Trc87UC

Title: Thoughts by anon
---------------------
A beginning
A longer middle
An end
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [Merkling](#merkling)
  - [Parameters](#parameters)
  - [createSession](#createsession)
  - [withSession](#withsession)
    - [Parameters](#parameters-1)
  - [cid](#cid)
    - [Parameters](#parameters-2)
  - [resolve](#resolve)
    - [Parameters](#parameters-3)
  - [inspect](#inspect)
    - [Parameters](#parameters-4)
  - [isProxy](#isproxy)
    - [Parameters](#parameters-5)
  - [isIpldNode](#isipldnode)
    - [Parameters](#parameters-6)
  - [isDirty](#isdirty)
    - [Parameters](#parameters-7)
- [MerklingSession](#merklingsession)
  - [Parameters](#parameters-8)
  - [create](#create)
    - [Parameters](#parameters-9)
  - [get](#get)
    - [Parameters](#parameters-10)
  - [load](#load)
    - [Parameters](#parameters-11)
  - [save](#save)

### Merkling

The core IPLD access client.

#### Parameters

- `options` **IMerklingOptions**

#### createSession

Create a new merkling session to act as an
intermediary with the IPFS node.

Returns **[MerklingSession](#merklingsession)** a new merkling session

#### withSession

Run an action in the form of a callback over a new session
that is disposed of afterwards.

##### Parameters

- `sessionAction` **function (session: [MerklingSession](#merklingsession)): void** an action func that operates on the new session

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** a promise that completes after the session action

#### cid

Retrieve the CID for given proxy. Will returned
undefined if the passed object is not a Merkling proxy
and will return null if the proxy is dirty.

##### Parameters

- `proxy` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)** the object to get the CID for

Returns **(ICid | null | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** the CID or undefined if the object will never
have a CID or null if it is currently dirty

#### resolve

Asynchronously force the retrieval of the state
stored in IPFS of the IPLD block the proxy represents.

##### Parameters

- `proxy` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)** An IPLD block proxy

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)>** the given proxy now loaded and clean.

#### inspect

Retreive the stored state that the Merkling proxy
is representing. This will include references
to other Merkling proxies.

##### Parameters

- `proxy` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)** the proxy to inspect

Returns **{}** the internal state of the IPLD block being represented

#### isProxy

Determine whether a given object is a tracked Merkling
proxy.

##### Parameters

- `potentialProxy` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)**

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** the answer

#### isIpldNode

Determine whether a given object is a Merkling
proxy representing an IPLD block.

##### Parameters

- `potentialIpldNode` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)**

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** the answer

#### isDirty

Determine if a proxy has unsaved changes. Will
return true if the passed object is not a proxy.

##### Parameters

- `proxy` **[Proxy](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy)** the object to test

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** the answer

### MerklingSession

#### Parameters

- `$0` **{ipfs: IIpfsNode}**
  - `$0.ipfs`

#### create

Create a new dirty Merkling proxy that can be manipulated
before later being persisted.

##### Parameters

- `objState` **T** a js object of the state for the IPLD block

Returns **T** a proxy representing the given state as an IPLD block

#### get

Get an IPLD block from IPFS and return
it as a tracked Merkling proxy.

##### Parameters

- `hashOrCid` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | ICid)** a CID or base encoded version

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;any>** a clean proxy with the state loaded and accessible

#### load

##### Parameters

- `hash` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | ICid)**

Returns **IMerklingProxyState**

#### save

Save all proxies that are currently marked as dirty,
and any proxies that depend on them.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>**

## Browser Support

Merkling requires ES6 Proxies to do its black magic, hence requires a recent version of node or an ever green browser.

## Maintainers

[@kanej](https://github.com/kanej)

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2019 John Kane
