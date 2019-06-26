import MerklingSession from './merklingSession'

import {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getStateSymbol,
  getCidSymbol,
  setCidSymbol,
  getRecordSymbol,
  getRefSymbol,
  resolveSymbol
} from './symbols'
import { Merkling } from './merkling'
import { ICid } from './domain'

type ProxyKey = string | symbol | number

export enum MerklingLifecycleState {
  DIRTY = 'DIRTY',
  CLEAN = 'CLEAN',
  UNLOADED = 'UNLOADED'
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

  isRef(): boolean {
    return true
  }

  toString(): string {
    if (this.path.length > 0) {
      return `${this.internalId}/${this.path.join('/')}`
    } else {
      return this.internalId.toString()
    }
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
  getOwnPropertyDescriptor(
    target: IMerklingProxyState,
    key: ProxyKey
  ): PropertyDescriptor | undefined {
    const { state } = lookupRecordAndState(target)

    if (!state) {
      return undefined
    }

    return Object.getOwnPropertyDescriptor(state, key)
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

    if (key === resolveSymbol) {
      return target.session._resolveRef(target.ref)
    }

    const { record, state } = lookupRecordAndState(target)

    if (!record) {
      return undefined
    }

    if (key === isDirtySymbol) {
      return record.lifecycleState === MerklingLifecycleState.DIRTY
    }

    if (key === getStateSymbol) {
      return state
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

    let proxyId: MerklingProxyRef
    if ('isRef' in value && value.isRef()) {
      proxyId = value as MerklingProxyRef

      target.session._internalGraph.link(
        target.ref.internalId,
        proxyId.internalId
      )
    } else {
      proxyId = new MerklingProxyRef({
        internalId: target.ref.internalId,
        type: MerklingProxyType.INTERNAL,
        path: [key]
      })
    }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
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
      target.session._markRecordAndAncestorsAsDirty(record.internalId)

      if (Merkling.isProxy(value)) {
        if (!Merkling.isIpldNode(value)) {
          throw new Error('Setting sub-nodes not supported')
        }

        // eslint-disable-next-line
        const ref = (value as any)[getRefSymbol] as MerklingProxyRef
        target.session._internalGraph.link(
          target.ref.internalId,
          ref.internalId
        )
        return Reflect.set(state, key, ref)
      } else if (value != null && typeof value === 'object') {
        const internalisedValue = target.session._internaliseState(value)
        return Reflect.set(state, key, internalisedValue)
      } else {
        return Reflect.set(state, key, value)
      }
    }
  }
}
