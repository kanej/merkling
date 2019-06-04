import MerklingSession from './merklingSession'

import {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getStateSymbol,
  getCidSymbol,
  setCidSymbol,
  getRecordSymbol,
  getRefSymbol
} from './symbols'
import { ICid, Merkling } from './merkling'

type ProxyKey = string | symbol | number

export enum MerklingLifecycleState {
  DIRTY = 'DIRTY',
  CLEAN = 'CLEAN'
}

export enum MerklingProxyType {
  IPLD = 'IPLD',
  INTERNAL = 'INTERNAL'
}

export interface IMerklingProxyRef {
  internalId: number
  type: MerklingProxyType
  path: ProxyKey[]
}

export interface IMerklingProxyState {
  ref: MerklingProxyRef
  session: MerklingSession
}

export interface IMerklingInternalRecord {
  internalId: number
  type: MerklingProxyType
  lifecycleState: MerklingLifecycleState
  cid: ICid | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any
}

export class MerklingProxyRef implements IMerklingProxyRef {
  internalId: number
  type: MerklingProxyType
  path: (string | number | symbol)[]

  constructor(ref: IMerklingProxyRef) {
    this.internalId = ref.internalId
    this.type = ref.type
    this.path = ref.path
  }

  toString(): string {
    return `${this.internalId}/${this.path.join('/')}`
  }
}

interface IRecordAndState {
  record: IMerklingInternalRecord | undefined
  state: {} | undefined
}

const lookupRecordAndState = (target: IMerklingProxyState): IRecordAndState => {
  const ipldRecord = target.session._ipldNodeEntries.get(target.ref.internalId)

  if (!ipldRecord) {
    return {
      record: undefined,
      state: undefined
    }
  }

  let state = ipldRecord.state
  for (const key of target.ref.path) {
    state = state[key]
  }

  return {
    record: ipldRecord,
    state: state
  }
}

export const merklingProxyHandler: ProxyHandler<IMerklingProxyState> = {
  has: function(target: IMerklingProxyState, key: ProxyKey): boolean {
    const { state } = lookupRecordAndState(target)

    if (!state) {
      return false
    }

    return key in state
  },
  ownKeys(target: IMerklingProxyState): ProxyKey[] {
    const { state } = lookupRecordAndState(target)

    if (!state) {
      return []
    }

    return Reflect.ownKeys(state)
  },
  getOwnPropertyDescriptor(target: IMerklingProxyState, key: ProxyKey): {} {
    return {
      value: (this as { get: Function }).get(target, key),
      enumerable: true,
      configurable: true
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(target: IMerklingProxyState, key: ProxyKey): any {
    if (key === isProxySymbol) {
      return true
    }

    if (key === isIpldNodeSymbol) {
      return target.ref.type === MerklingProxyType.IPLD
    }

    if (key === getRefSymbol) {
      return target.ref
    }

    const { record, state } = lookupRecordAndState(target)

    if (!record) {
      return undefined
    }

    if (key === isDirtySymbol) {
      return record.lifecycleState === MerklingLifecycleState.DIRTY
    }

    if (key === getStateSymbol) {
      return record.state
    }

    if (key === getCidSymbol) {
      return record.cid
    }

    if (key === getRecordSymbol) {
      return target
    }

    // eslint-disable-next-line
    const value = (state as any)[key]

    if (!value || typeof value !== 'object') {
      return value
    }

    const proxyId: IMerklingProxyRef = new MerklingProxyRef({
      internalId: target.ref.internalId,
      type: MerklingProxyType.INTERNAL,
      path: [key]
    })

    if (target.session._proxies.has(proxyId.toString())) {
      return target.session._proxies.get(proxyId.toString())
    }

    const internalProxy = new Proxy<IMerklingProxyState>(
      {
        ref: proxyId,
        session: target.session
      },
      merklingProxyHandler
    )

    target.session._proxies.set(proxyId.toString(), internalProxy)

    return internalProxy
  },
  set(
    target: IMerklingProxyState,
    key: string | number | symbol,
    value: ICid
  ): boolean {
    const { record, state } = lookupRecordAndState(target)

    if (!record || !state) {
      return false
    }

    if (key === setCidSymbol) {
      if (record.type !== MerklingProxyType.IPLD) {
        throw new Error('Cannot set CID on internal proxy')
      }

      record.cid = value
      record.lifecycleState = MerklingLifecycleState.CLEAN
      return true
    } else {
      record.lifecycleState = MerklingLifecycleState.DIRTY
      record.cid = null

      if (Merkling.isProxy(value)) {
        if (!Merkling.isIpldNode(value)) {
          throw new Error('Setting sub-nodes not supported')
        }

        // eslint-disable-next-line
        const ref = (value as any)[getRefSymbol]
        return Reflect.set(state, key, ref)
      } else {
        return Reflect.set(state, key, value)
      }
    }
  }
}
