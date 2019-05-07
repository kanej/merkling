"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const merklingSession_1 = __importStar(require("./merklingSession"));
class Merkling {
    constructor(options) {
        this._ipfs = options.ipfs;
    }
    static isProxy(potentialProxy) {
        if (!potentialProxy) {
            return false;
        }
        return !!potentialProxy[merklingSession_1.isProxySymbol];
    }
    static isIpldNode(potentialIpldNode) {
        if (!potentialIpldNode) {
            return false;
        }
        return !!potentialIpldNode[merklingSession_1.isIpldNodeSymbol];
    }
    createSession() {
        return new merklingSession_1.default();
    }
}
exports.Merkling = Merkling;
//# sourceMappingURL=merkling.js.map