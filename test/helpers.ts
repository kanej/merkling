import { ICid } from '../src/merkling'

export const toCid = (text: string) => {
  const cid: ICid = {
    codec: 'example',
    version: 1,
    multihash: Buffer.from(text),
    toBaseEncodedString: () => text
  }

  return cid
}
