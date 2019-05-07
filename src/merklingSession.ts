import { IIpfsNode, Merkling } from "./merkling";

export const isProxySymbol = Symbol('merkling/isProxy')
export const isIpldNodeSymbol = Symbol('merkling/isIpldNode')
export const isDirtySymbol = Symbol('merkling/isDirty')
export const getStateSymbol = Symbol('merkling/getState')
export const setCidSymbol = Symbol('merkling/setCid')
export const getCidSymbol = Symbol('merkling/getCid')


const merklingProxyHandler: ProxyHandler<IMerklingProxyRecord> = {
    has: function (target: IMerklingProxyRecord, key: any) {
        return key in target.state
    },
    enumerate (target: IMerklingProxyRecord) {
        return Array.from(Object.keys(target.state)[Symbol.iterator]())
    },
    ownKeys (target: IMerklingProxyRecord) {
        return Reflect.ownKeys(target.state)
    },
    getOwnPropertyDescriptor (target: IMerklingProxyRecord, key:any) {
        return { value: (this as any).get(target, key), enumerable: true, configurable: true };
    },
    get(target: IMerklingProxyRecord, key: any) {
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

        if(!value || typeof value !== 'object') {
            return value
        }

        if(target.session._stateObjToProxy.has(value)) {
            return target.session._stateObjToProxy.get(value)
        }

        const record: IMerklingProxyRecord = {
            type: MerklingProxyType.INTERNAL,
            lifecycleState: MerklingLifecycleState.DIRTY,
            cid: null,
            session: target.session,
            state: value
        }

        const newProxy: any = new Proxy<IMerklingProxyRecord>(record, merklingProxyHandler)
        target.session._stateObjToProxy.set(value, newProxy)

        return newProxy
    },
    set (target: IMerklingProxyRecord, key: string | number | symbol, value: any): boolean {
        if (key === setCidSymbol) {
            target.cid = value
            target.lifecycleState = MerklingLifecycleState.CLEAN
            return true
        } else {
            return Reflect.set(target, key, value)
        }
    }
}

enum MerklingProxyType {
    IPLD = 'IPLD',
    INTERNAL = 'INTERNAL'
}

enum MerklingLifecycleState {
    DIRTY = 'DIRTY',
    CLEAN = 'CLEAN'
}

export interface IMerklingProxyRecord {
    type: MerklingProxyType
    lifecycleState: MerklingLifecycleState
    cid: string | null
    session: MerklingSession
    state: any,
}

export default class MerklingSession {
    _ipfs: IIpfsNode
    _stateObjToProxy: WeakMap<any, any>
    _roots: any[]

    constructor(options: { ipfs: IIpfsNode }) {
        const { ipfs } = options
        this._ipfs = ipfs
        this._stateObjToProxy = new WeakMap()
        this._roots = []
    }

    create(objState: {}) {
        if(objState === null || typeof objState !== 'object') {
            return objState
        }

        const record: IMerklingProxyRecord = {
            type: MerklingProxyType.IPLD,
            lifecycleState: MerklingLifecycleState.DIRTY,
            cid: null,
            session: this,
            state: objState,
        }

        const proxy = new Proxy(record, merklingProxyHandler)

        this._roots.push(proxy)

        return proxy
    }

    async save(): Promise<void> {
        for (const root of this._roots) {
            if (Merkling.isDirty(root)) {
                const state = root[getStateSymbol]

                const cid = await this._ipfs.put(state)

                root[setCidSymbol] = cid
            }
        }        
    }
}
