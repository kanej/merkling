# merkling

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

> A js library for persisting json objects to the IPFS merkle forest

The IPFS project exposes an underlying graph data structure where each link is a hash, this supports the peer to peer file sharing and goes under the Interplanetary Linked Data project (IPLD) project. Merkling is a small library for interacting with the IPLD graph.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

```bash
npm install --save merkling
```

## Usage

Merkling requires pulling in ipfs.

```javascript
'use strict'

const { withIpfs } = require('./src/ipfs')
const Merkling = require('./src/merkling')

withIpfs(async ipfs => {
  const merkle = new Merkling({ipfs: ipfs})

  const head = await merkle.create({
    title: 'Thoughts on Poetry',
    author: 'P. Kavanagh',
    feed: null
  })

  const post1 = await merkle.create({
    text: 'I love farms but I prefer guinness',
    next: null
  })

  const post2 = await merkle.create({
    text: 'Why wasn\'t I born French'
  })

  head.feed = post1
  post1.next = post2

  return merkle.save(head).then(ipldNode => {
    console.log(ipldNode)
    console.log(ipldNode._cid.toBaseEncodedString())
  })

}).done(() => {
  process.exit()
})
```

## API

## Maintainers

[@kanej](https://github.com/kanej)

## Contribute

See [the contribute file](contribute.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2018 John Kane
