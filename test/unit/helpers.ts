import CID from 'cids'
import { ICid } from '../../src/domain'

export const toCid = (text: string): ICid => {
  // eslint-disable-next-line
  return (new CID(text) as any) as ICid
}
