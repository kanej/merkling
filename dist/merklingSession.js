"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProxySymbol = Symbol('merkling/isProxy');
exports.isIpldNodeSymbol = Symbol('merkling/isIpldNodeSymbol');
const merklingProxyHandler = {
    has: function (target, key) {
        return key in target.state;
    },
    enumerate(target) {
        return Array.from(Object.keys(target.state)[Symbol.iterator]());
    },
    ownKeys(target) {
        return Reflect.ownKeys(target.state);
    },
    getOwnPropertyDescriptor(target, key) {
        //return Object.getOwnPropertyDescriptor(target.state, key)
        return { value: this.get(target, key), enumerable: true, configurable: true };
    },
    get(target, key) {
        if (key === exports.isProxySymbol) {
            return true;
        }
        if (key === exports.isIpldNodeSymbol) {
            return target.type === MerklingProxyType.IPLD;
        }
        const value = target.state[key];
        if (!value || typeof value !== 'object') {
            return value;
        }
        if (target.session._stateObjToProxy.has(value)) {
            return target.session._stateObjToProxy.get(value);
        }
        const record = {
            type: MerklingProxyType.INTERNAL,
            session: target.session,
            state: value
        };
        const newProxy = new Proxy(record, merklingProxyHandler);
        target.session._stateObjToProxy.set(value, newProxy);
        return newProxy;
    }
};
var MerklingProxyType;
(function (MerklingProxyType) {
    MerklingProxyType["IPLD"] = "IPLD";
    MerklingProxyType["INTERNAL"] = "INTERNAL";
})(MerklingProxyType || (MerklingProxyType = {}));
class MerklingSession {
    constructor() {
        this._stateObjToProxy = new WeakMap();
    }
    create(objState) {
        if (objState === null || typeof objState !== 'object') {
            return objState;
        }
        const record = {
            type: MerklingProxyType.IPLD,
            session: this,
            state: objState,
        };
        return new Proxy(record, merklingProxyHandler);
    }
}
exports.default = MerklingSession;
//# sourceMappingURL=merklingSession.js.map