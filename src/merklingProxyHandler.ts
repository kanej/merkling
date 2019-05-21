import MerklingSession from './merklingSession'

import {
  isProxySymbol,
  isIpldNodeSymbol,
  isDirtySymbol,
  getStateSymbol,
  getCidSymbol,
  setCidSymbol
} from './symbols'
import { ICid } from './merkling'

export enum MerklingLifecycleState {
  DIRTY = 'DIRTY',
  CLEAN = 'CLEAN'
}

export enum MerklingProxyType {
  IPLD = 'IPLD',
  INTERNAL = 'INTERNAL'
}

export interface IMerklingProxyRecord {
  type: MerklingProxyType
  lifecycleState: MerklingLifecycleState
  cid: ICid | null
  session: MerklingSession
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any
}

type ProxyKey = string | symbol | number

export const merklingProxyHandler: ProxyHandler<IMerklingProxyRecord> = {
  has: function(target: IMerklingProxyRecord, key: ProxyKey): boolean {
    return key in target.state
  },
  ownKeys(target: IMerklingProxyRecord): ProxyKey[] {
    return Reflect.ownKeys(target.state)
  },
  getOwnPropertyDescriptor(target: IMerklingProxyRecord, key: ProxyKey): {} {
    return {
      value: (this as { get: Function }).get(target, key),
      enumerable: true,
      configurable: true
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(target: IMerklingProxyRecord, key: ProxyKey): any {
    if (key === isProxySymbol) {
      return true
    }

    if (key === isIpldNodeSymbol) {
      return target.type === MerklingProxyType.IPLD
    }

    if (key === isDirtySymbol) {
      return target.lifecycleState === MerklingLifecycleState.DIRTY
    }

    if (key === getStateSymbol) {
      return target.state
    }

    if (key === getCidSymbol) {
      return target.cid
    }

    const value = target.state[key]

    if (!value || typeof value !== 'object') {
      return value
    }

    if (target.session._stateObjToProxy.has(value)) {
      return target.session._stateObjToProxy.get(value)
    }

    const record: IMerklingProxyRecord = {
      type: MerklingProxyType.INTERNAL,
      lifecycleState: MerklingLifecycleState.DIRTY,
      cid: null,
      session: target.session,
      state: value
    }

    const newProxy: IMerklingProxyRecord = new Proxy<IMerklingProxyRecord>(
      record,
      merklingProxyHandler
    )

    target.session._stateObjToProxy.set(value, newProxy)

    return newProxy
  },
  set(
    target: IMerklingProxyRecord,
    key: string | number | symbol,
    value: ICid
  ): boolean {
    if (key === setCidSymbol) {
      target.cid = value
      target.lifecycleState = MerklingLifecycleState.CLEAN
      return true
    } else {
      return Reflect.set(target.state, key, value)
    }
  }
}
