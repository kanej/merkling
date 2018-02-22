(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["merkling"] = factory();
	else
		root["Merkling"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(10)
var ieee754 = __webpack_require__(11)
var isArray = __webpack_require__(12)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
    encode: __webpack_require__(17)
  , decode: __webpack_require__(18)
  , encodingLength: __webpack_require__(19)
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

// spec and table at: https://github.com/multiformats/multicodec

exports = module.exports

// Miscellaneous
exports['raw'] = Buffer.from('55', 'hex')

// bases encodings
exports['base1'] = Buffer.from('01', 'hex')
exports['base8'] = Buffer.from('07', 'hex')
exports['base10'] = Buffer.from('09', 'hex')

// Serialization formats
exports['protobuf'] = Buffer.from('50', 'hex')
exports['cbor'] = Buffer.from('51', 'hex')
exports['rlp'] = Buffer.from('60', 'hex')
exports['bencode'] = Buffer.from('63', 'hex')

// Multiformats
exports['multicodec'] = Buffer.from('30', 'hex')
exports['multihash'] = Buffer.from('31', 'hex')
exports['multiaddr'] = Buffer.from('32', 'hex')
exports['multibase'] = Buffer.from('33', 'hex')

// multihashes
exports['sha1'] = Buffer.from('11', 'hex')
exports['sha2-256'] = Buffer.from('12', 'hex')
exports['sha2-512'] = Buffer.from('13', 'hex')
exports['sha3-224'] = Buffer.from('17', 'hex')
exports['sha3-256'] = Buffer.from('16', 'hex')
exports['sha3-384'] = Buffer.from('15', 'hex')
exports['sha3-512'] = Buffer.from('14', 'hex')
exports['shake-128'] = Buffer.from('18', 'hex')
exports['shake-256'] = Buffer.from('19', 'hex')
exports['keccak-224'] = Buffer.from('1a', 'hex')
exports['keccak-256'] = Buffer.from('1b', 'hex')
exports['keccak-384'] = Buffer.from('1c', 'hex')
exports['keccak-512'] = Buffer.from('1d', 'hex')
exports['blake2b'] = Buffer.from('40', 'hex')
exports['blake2s'] = Buffer.from('41', 'hex')

// multiaddrs
exports['ip4'] = Buffer.from('04', 'hex')
exports['ip6'] = Buffer.from('29', 'hex')
exports['tcp'] = Buffer.from('06', 'hex')
exports['udp'] = Buffer.from('0111', 'hex')
exports['dccp'] = Buffer.from('21', 'hex')
exports['sctp'] = Buffer.from('84', 'hex')
exports['udt'] = Buffer.from('012d', 'hex')
exports['utp'] = Buffer.from('012e', 'hex')
exports['ipfs'] = Buffer.from('2a', 'hex')
exports['http'] = Buffer.from('01e0', 'hex')
exports['https'] = Buffer.from('01bb', 'hex')
exports['ws'] = Buffer.from('01dd', 'hex')
exports['onion'] = Buffer.from('01bc', 'hex')

// archiving formats

// image formats

// video formats

// VCS formats
exports['git-raw'] = Buffer.from('78', 'hex')

// IPLD formats
exports['dag-pb'] = Buffer.from('70', 'hex')
exports['dag-cbor'] = Buffer.from('71', 'hex')

exports['eth-block'] = Buffer.from('90', 'hex')
exports['eth-block-list'] = Buffer.from('91', 'hex')
exports['eth-tx-trie'] = Buffer.from('92', 'hex')
exports['eth-tx'] = Buffer.from('93', 'hex')
exports['eth-tx-receipt-trie'] = Buffer.from('94', 'hex')
exports['eth-tx-receipt'] = Buffer.from('95', 'hex')
exports['eth-state-trie'] = Buffer.from('96', 'hex')
exports['eth-account-snapshot'] = Buffer.from('97', 'hex')
exports['eth-storage-trie'] = Buffer.from('98', 'hex')

exports['bitcoin-block'] = Buffer.from('b0', 'hex')
exports['bitcoin-tx'] = Buffer.from('b1', 'hex')

exports['stellar-block'] = Buffer.from('d0', 'hex')
exports['stellar-tx'] = Buffer.from('d1', 'hex')

exports['torrent-info'] = Buffer.from('7b', 'hex')
exports['torrent-file'] = Buffer.from('7c', 'hex')

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

const mh = __webpack_require__(4)
const multibase = __webpack_require__(20)
const multicodec = __webpack_require__(25)
const codecs = __webpack_require__(2)
const codecVarints = __webpack_require__(5)
const multihash = __webpack_require__(4)

/**
 * @typedef {Object} SerializedCID
 * @param {string} codec
 * @param {number} version
 * @param {Buffer} multihash
 *
 */

/**
 * Class representing a CID `<mbase><version><mcodec><mhash>`
 * , as defined in [ipld/cid](https://github.com/ipld/cid).
 * @class CID
 */
class CID {
  /**
   * Create a new CID.
   *
   * The algorithm for argument input is roughly:
   * ```
   * if (str)
   *   if (1st char is on multibase table) -> CID String
   *   else -> bs58 encoded multihash
   * else if (Buffer)
   *   if (0 or 1) -> CID
   *   else -> multihash
   * else if (Number)
   *   -> construct CID by parts
   *
   * ..if only JS had traits..
   * ```
   *
   * @param {string|Buffer} version
   * @param {string} [codec]
   * @param {Buffer} [multihash]
   *
   * @example
   *
   * new CID(<version>, <codec>, <multihash>)
   * new CID(<cidStr>)
   * new CID(<cid.buffer>)
   * new CID(<multihash>)
   * new CID(<bs58 encoded multihash>)
   * new CID(<cid>)
   *
   */
  constructor (version, codec, multihash) {
    if (CID.isCID(version)) {
      let cid = version
      this.version = cid.version
      this.codec = cid.codec
      this.multihash = Buffer.from(cid.multihash)
      return
    }
    if (typeof version === 'string') {
      if (multibase.isEncoded(version)) { // CID String (encoded with multibase)
        const cid = multibase.decode(version)
        version = parseInt(cid.slice(0, 1).toString('hex'), 16)
        codec = multicodec.getCodec(cid.slice(1))
        multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // bs58 string encoded multihash
        codec = 'dag-pb'
        multihash = mh.fromB58String(version)
        version = 0
      }
    } else if (Buffer.isBuffer(version)) {
      const firstByte = version.slice(0, 1)
      const v = parseInt(firstByte.toString('hex'), 16)
      if (v === 0 || v === 1) { // CID
        const cid = version
        version = v
        codec = multicodec.getCodec(cid.slice(1))
        multihash = multicodec.rmPrefix(cid.slice(1))
      } else { // multihash
        codec = 'dag-pb'
        multihash = version
        version = 0
      }
    }

    /**
     * @type {string}
     */
    this.codec = codec

    /**
     * @type {number}
     */
    this.version = version

    /**
     * @type {Buffer}
     */
    this.multihash = multihash

    CID.validateCID(this)
  }

  /**
   * The CID as a `Buffer`
   *
   * @return {Buffer}
   * @readonly
   *
   * @memberOf CID
   */
  get buffer () {
    switch (this.version) {
      case 0:
        return this.multihash
      case 1:
        return Buffer.concat([
          Buffer.from('01', 'hex'),
          Buffer.from(codecVarints[this.codec]),
          this.multihash
        ])
      default:
        throw new Error('unsupported version')
    }
  }

  /**
   * Get the prefix of the CID.
   *
   * @returns {Buffer}
   * @readonly
   */
  get prefix () {
    return Buffer.concat([
      Buffer.from(`0${this.version}`, 'hex'),
      codecVarints[this.codec],
      multihash.prefix(this.multihash)
    ])
  }

  /**
   * Convert to a CID of version `0`.
   *
   * @returns {CID}
   */
  toV0 () {
    if (this.codec !== 'dag-pb') {
      throw new Error('Cannot convert a non dag-pb CID to CIDv0')
    }

    return new CID(0, this.codec, this.multihash)
  }

  /**
   * Convert to a CID of version `1`.
   *
   * @returns {CID}
   */
  toV1 () {
    return new CID(1, this.codec, this.multihash)
  }

  /**
   * Encode the CID into a string.
   *
   * @param {string} [base='base58btc'] - Base encoding to use.
   * @returns {string}
   */
  toBaseEncodedString (base) {
    base = base || 'base58btc'

    switch (this.version) {
      case 0: {
        if (base !== 'base58btc') {
          throw new Error('not supported with CIDv0, to support different bases, please migrate the instance do CIDv1, you can do that through cid.toV1()')
        }
        return mh.toB58String(this.multihash)
      }
      case 1:
        return multibase.encode(base, this.buffer).toString()
      default:
        throw new Error('Unsupported version')
    }
  }

  /**
   * Serialize to a plain object.
   *
   * @returns {SerializedCID}
   */
  toJSON () {
    return {
      codec: this.codec,
      version: this.version,
      hash: this.multihash
    }
  }

  /**
   * Compare equality with another CID.
   *
   * @param {CID} other
   * @returns {bool}
   */
  equals (other) {
    return this.codec === other.codec &&
      this.version === other.version &&
      this.multihash.equals(other.multihash)
  }

  /**
   * Test if the given input is a CID.
   *
   * @param {any} other
   * @returns {bool}
   */
  static isCID (other) {
    try {
      CID.validateCID(other)
    } catch (err) {
      return false
    }

    return true
  }

  /**
   * Test if the given input is a valid CID object.
   * Throws if it is not.
   *
   * @param {any} other
   * @returns {void}
   */
  static validateCID (other) {
    if (other == null) {
      throw new Error('null values are not valid CIDs')
    }

    if (!(other.version === 0 || other.version === 1)) {
      throw new Error('Invalid version, must be a number equal to 1 or 0')
    }

    if (typeof other.codec !== 'string') {
      throw new Error('codec must be string')
    }

    if (!Buffer.isBuffer(other.multihash)) {
      throw new Error('multihash must be a Buffer')
    }

    mh.validate(other.multihash)
  }
}

CID.codecs = codecs

module.exports = CID

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * Multihash implementation in JavaScript.
 *
 * @module multihash
 */


const bs58 = __webpack_require__(13)

const cs = __webpack_require__(16)

exports.names = cs.names
exports.codes = cs.codes
exports.defaultLengths = cs.defaultLengths

const varint = __webpack_require__(1)

/**
 * Convert the given multihash to a hex encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toHexString = function toHexString (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return hash.toString('hex')
}

/**
 * Convert the given hex encoded string to a multihash.
 *
 * @param {string} hash
 * @returns {Buffer}
 */
exports.fromHexString = function fromHexString (hash) {
  return Buffer.from(hash, 'hex')
}

/**
 * Convert the given multihash to a base58 encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toB58String = function toB58String (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return bs58.encode(hash)
}

/**
 * Convert the given base58 encoded string to a multihash.
 *
 * @param {string|Buffer} hash
 * @returns {Buffer}
 */
exports.fromB58String = function fromB58String (hash) {
  let encoded = hash
  if (Buffer.isBuffer(hash)) {
    encoded = hash.toString()
  }

  return Buffer.from(bs58.decode(encoded))
}

/**
 * Decode a hash from the given multihash.
 *
 * @param {Buffer} buf
 * @returns {{code: number, name: string, length: number, digest: Buffer}} result
 */
exports.decode = function decode (buf) {
  if (!(Buffer.isBuffer(buf))) {
    throw new Error('multihash must be a Buffer')
  }

  if (buf.length < 3) {
    throw new Error('multihash too short. must be > 3 bytes.')
  }

  let code = varint.decode(buf)
  if (!exports.isValidCode(code)) {
    throw new Error(`multihash unknown function code: 0x${code.toString(16)}`)
  }
  buf = buf.slice(varint.decode.bytes)

  let len = varint.decode(buf)
  if (len < 1) {
    throw new Error(`multihash invalid length: 0x${len.toString(16)}`)
  }
  buf = buf.slice(varint.decode.bytes)

  if (buf.length !== len) {
    throw new Error(`multihash length inconsistent: 0x${buf.toString('hex')}`)
  }

  return {
    code: code,
    name: cs.codes[code],
    length: len,
    digest: buf
  }
}

/**
 *  Encode a hash digest along with the specified function code.
 *
 * > **Note:** the length is derived from the length of the digest itself.
 *
 * @param {Buffer} digest
 * @param {string|number} code
 * @param {number} [length]
 * @returns {Buffer}
 */
exports.encode = function encode (digest, code, length) {
  if (!digest || !code) {
    throw new Error('multihash encode requires at least two args: digest, code')
  }

  // ensure it's a hashfunction code.
  const hashfn = exports.coerceCode(code)

  if (!(Buffer.isBuffer(digest))) {
    throw new Error('digest should be a Buffer')
  }

  if (length == null) {
    length = digest.length
  }

  if (length && digest.length !== length) {
    throw new Error('digest length should be equal to specified length.')
  }

  return Buffer.concat([
    Buffer.from(varint.encode(hashfn)),
    Buffer.from(varint.encode(length)),
    digest
  ])
}

/**
 * Converts a hash function name into the matching code.
 * If passed a number it will return the number if it's a valid code.
 * @param {string|number} name
 * @returns {number}
 */
exports.coerceCode = function coerceCode (name) {
  let code = name

  if (typeof name === 'string') {
    if (!cs.names[name]) {
      throw new Error(`Unrecognized hash function named: ${name}`)
    }
    code = cs.names[name]
  }

  if (typeof code !== 'number') {
    throw new Error(`Hash function code should be a number. Got: ${code}`)
  }

  if (!cs.codes[code] && !exports.isAppCode(code)) {
    throw new Error(`Unrecognized function code: ${code}`)
  }

  return code
}

/**
 * Checks wether a code is part of the app range
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isAppCode = function appCode (code) {
  return code > 0 && code < 0x10
}

/**
 * Checks whether a multihash code is valid.
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isValidCode = function validCode (code) {
  if (exports.isAppCode(code)) {
    return true
  }

  if (cs.codes[code]) {
    return true
  }

  return false
}

/**
 * Check if the given buffer is a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
function validate (multihash) {
  exports.decode(multihash) // throws if bad.
}
exports.validate = validate

/**
 * Returns a prefix from a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
exports.prefix = function prefix (multihash) {
  validate(multihash)

  return multihash.slice(0, 2)
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const baseTable = __webpack_require__(2)
const varintBufferEncode = __webpack_require__(6).varintBufferEncode

// this creates a map for codecName -> codeVarintBuffer

const varintTable = {}
module.exports = varintTable

for (let encodingName in baseTable) {
  let code = baseTable[encodingName]
  varintTable[encodingName] = varintBufferEncode(code)
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
const varint = __webpack_require__(1)

module.exports = {
  numberToBuffer,
  bufferToNumber,
  varintBufferEncode,
  varintBufferDecode
}

function bufferToNumber (buf) {
  return parseInt(buf.toString('hex'), 16)
}

function numberToBuffer (num) {
  let hexString = num.toString(16)
  if (hexString.length % 2 === 1) {
    hexString = '0' + hexString
  }
  return Buffer.from(hexString, 'hex')
}

function varintBufferEncode (input) {
  return Buffer.from(varint.encode(bufferToNumber(input)))
}

function varintBufferDecode (input) {
  return numberToBuffer(varint.decode(input))
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(8);
(function webpackMissingModule() { throw new Error("Cannot find module \"build\""); }());


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CID = __webpack_require__(3)
const { IpldProxy } = __webpack_require__(27)

/**
 * Merkling entrypoint
 * @constructor
 * @param {Object} options setup options for this merkling instance
 */
const Merkling = function (options) {
  if (!options.ipfs) {
    throw Error('IPFS must be passed as an option to Merkling')
  }

  this.ipfs = options.ipfs
  this.ipldProxy = new IpldProxy()

  /**
   * Create an IPLD node from a js object.
   * The IPLD node must be saved before it is persisted.
   * @param {Object} obj a js object
   * @returns {Object} an unsaved IPLD node
   */
  this.create = (obj) => {
    return this.ipldProxy.createDirtyNode(obj)
  }

  /**
   * Persist a js object or IPLD node to the IPLD graph
   * @param {Object} obj a js object or IPLD node
   */
  this.save = (obj) => {
    if (!obj) {
      throw Error('Argument exception, trying to save null or undefined')
    }

    const objToPersist = this.ipldProxy.isIpld(obj)
      ? obj
      : this.ipldProxy.createDirtyNode(obj)

    return this._persist(objToPersist)
  }

  /**
   * Given an IPLD id, retrieve the value from the IPLD graph
   * as a js object
   * @param {Object|String} cid
   * @returns {Object} an IPLD node
   */
  this.get = (cid) => {
    return new Promise((resolve, reject) => {
      this.ipfs.dag.get(cid, (err, block) => {
        if (err) {
          reject(err)
        }

        const id = CID.isCID(cid) ? cid : new CID(cid)
        const node = this._substituteMerkleLinkProxies(block.value)
        const merkleProxy = this.ipldProxy.createSavedNode(id, node)

        resolve(merkleProxy)
      })
    })
  }

  this._persist = (elem) => {
    return new Promise((resolve, reject) => {
      if (this.ipldProxy.isPersisted(elem)) {
        return resolve(elem)
      }

      const subpersists = Object.keys(elem).map(key => {
        return typeof elem[key] === 'object'
          ? this._persist(elem[key])
          : null
      }).filter(Boolean)

      return Promise.all(subpersists).then(() => {
        const dagNode = this._substituteMerkleLinks(elem)

        this.ipfs.dag.put(dagNode, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
          if (err) {
            return reject(err)
          }

          this.ipldProxy.transition(elem, { transition: 'save', cid: cid })

          return resolve(elem)
        })
      })
    })
  }

  this._substituteMerkleLinks = (elem) => {
    const dagNode = this.ipldProxy.extract(elem)

    Object.keys(dagNode).forEach(key => {
      if ((typeof dagNode[key] !== 'object')) {
        return
      }

      if (this.ipldProxy.isIpld(dagNode[key])) {
        if (!this.ipldProxy.isPersisted(dagNode[key])) {
          throw Error('Attempting substitution on unpersisted ipld node')
        }

        dagNode[key] = this._convertToMerkleLinkObject(dagNode[key])
      } else {
        this._substituteMerkleLinks(dagNode[key])
      }
    })

    return dagNode
  }

  this._substituteMerkleLinkProxies = (obj) => {
    const merkleNode = Object.assign({}, obj)

    Object.keys(merkleNode).forEach(key => {
      if (typeof merkleNode[key] === 'object') {
        if (this._isMerkleLinkObject(merkleNode[key])) {
          merkleNode[key] = this._convertFromMerkleLinkObject(merkleNode[key])
        } else {
          this._substituteMerkleLinkProxies(merkleNode[key])
        }
      }
    })

    return merkleNode
  }

  this._convertToMerkleLinkObject = (obj) => {
    return {
      '/': obj._cid.toBaseEncodedString()
    }
  }

  this._convertFromMerkleLinkObject = (link) => {
    return this.ipldProxy.createLinkNode(new CID(link['/']))
  }

  this._isMerkleLinkObject = (obj) => {
    return (typeof obj === 'object') && obj.hasOwnProperty('/')
  }

  return this
}

module.exports = Merkling


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 12 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var basex = __webpack_require__(14)
var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

module.exports = basex(ALPHABET)


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

var Buffer = __webpack_require__(15).Buffer

module.exports = function base (ALPHABET) {
  var ALPHABET_MAP = {}
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)

  // pre-compute lookup table
  for (var z = 0; z < ALPHABET.length; z++) {
    var x = ALPHABET.charAt(z)

    if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
    ALPHABET_MAP[x] = z
  }

  function encode (source) {
    if (source.length === 0) return ''

    var digits = [0]
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < digits.length; ++j) {
        carry += digits[j] << 8
        digits[j] = carry % BASE
        carry = (carry / BASE) | 0
      }

      while (carry > 0) {
        digits.push(carry % BASE)
        carry = (carry / BASE) | 0
      }
    }

    var string = ''

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += ALPHABET[0]
    // convert digits to a string
    for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]]

    return string
  }

  function decodeUnsafe (string) {
    if (typeof string !== 'string') throw new TypeError('Expected String')
    if (string.length === 0) return Buffer.allocUnsafe(0)

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
      var value = ALPHABET_MAP[string[i]]
      if (value === undefined) return

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * BASE
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === LEADER && k < string.length - 1; ++k) {
      bytes.push(0)
    }

    return Buffer.from(bytes.reverse())
  }

  function decode (string) {
    var buffer = decodeUnsafe(string)
    if (buffer) return buffer

    throw new Error('Non-base' + BASE + ' character')
  }

  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(0)
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint quote-props: off */
/* eslint key-spacing: off */


exports.names = Object.freeze({
  'sha1':       0x11,
  'sha2-256':   0x12,
  'sha2-512':   0x13,
  'sha3-224':   0x17,
  'sha3-256':   0x16,
  'sha3-384':   0x15,
  'sha3-512':   0x14,
  'shake-128':  0x18,
  'shake-256':  0x19,
  'keccak-224': 0x1A,
  'keccak-256': 0x1B,
  'keccak-384': 0x1C,
  'keccak-512': 0x1D,
  'murmur3-128': 0x22,
  'murmur3-32':  0x23,
  'blake2b-8':   0xb201,
  'blake2b-16':  0xb202,
  'blake2b-24':  0xb203,
  'blake2b-32':  0xb204,
  'blake2b-40':  0xb205,
  'blake2b-48':  0xb206,
  'blake2b-56':  0xb207,
  'blake2b-64':  0xb208,
  'blake2b-72':  0xb209,
  'blake2b-80':  0xb20a,
  'blake2b-88':  0xb20b,
  'blake2b-96':  0xb20c,
  'blake2b-104': 0xb20d,
  'blake2b-112': 0xb20e,
  'blake2b-120': 0xb20f,
  'blake2b-128': 0xb210,
  'blake2b-136': 0xb211,
  'blake2b-144': 0xb212,
  'blake2b-152': 0xb213,
  'blake2b-160': 0xb214,
  'blake2b-168': 0xb215,
  'blake2b-176': 0xb216,
  'blake2b-184': 0xb217,
  'blake2b-192': 0xb218,
  'blake2b-200': 0xb219,
  'blake2b-208': 0xb21a,
  'blake2b-216': 0xb21b,
  'blake2b-224': 0xb21c,
  'blake2b-232': 0xb21d,
  'blake2b-240': 0xb21e,
  'blake2b-248': 0xb21f,
  'blake2b-256': 0xb220,
  'blake2b-264': 0xb221,
  'blake2b-272': 0xb222,
  'blake2b-280': 0xb223,
  'blake2b-288': 0xb224,
  'blake2b-296': 0xb225,
  'blake2b-304': 0xb226,
  'blake2b-312': 0xb227,
  'blake2b-320': 0xb228,
  'blake2b-328': 0xb229,
  'blake2b-336': 0xb22a,
  'blake2b-344': 0xb22b,
  'blake2b-352': 0xb22c,
  'blake2b-360': 0xb22d,
  'blake2b-368': 0xb22e,
  'blake2b-376': 0xb22f,
  'blake2b-384': 0xb230,
  'blake2b-392': 0xb231,
  'blake2b-400': 0xb232,
  'blake2b-408': 0xb233,
  'blake2b-416': 0xb234,
  'blake2b-424': 0xb235,
  'blake2b-432': 0xb236,
  'blake2b-440': 0xb237,
  'blake2b-448': 0xb238,
  'blake2b-456': 0xb239,
  'blake2b-464': 0xb23a,
  'blake2b-472': 0xb23b,
  'blake2b-480': 0xb23c,
  'blake2b-488': 0xb23d,
  'blake2b-496': 0xb23e,
  'blake2b-504': 0xb23f,
  'blake2b-512': 0xb240,
  'blake2s-8':   0xb241,
  'blake2s-16':  0xb242,
  'blake2s-24':  0xb243,
  'blake2s-32':  0xb244,
  'blake2s-40':  0xb245,
  'blake2s-48':  0xb246,
  'blake2s-56':  0xb247,
  'blake2s-64':  0xb248,
  'blake2s-72':  0xb249,
  'blake2s-80':  0xb24a,
  'blake2s-88':  0xb24b,
  'blake2s-96':  0xb24c,
  'blake2s-104': 0xb24d,
  'blake2s-112': 0xb24e,
  'blake2s-120': 0xb24f,
  'blake2s-128': 0xb250,
  'blake2s-136': 0xb251,
  'blake2s-144': 0xb252,
  'blake2s-152': 0xb253,
  'blake2s-160': 0xb254,
  'blake2s-168': 0xb255,
  'blake2s-176': 0xb256,
  'blake2s-184': 0xb257,
  'blake2s-192': 0xb258,
  'blake2s-200': 0xb259,
  'blake2s-208': 0xb25a,
  'blake2s-216': 0xb25b,
  'blake2s-224': 0xb25c,
  'blake2s-232': 0xb25d,
  'blake2s-240': 0xb25e,
  'blake2s-248': 0xb25f,
  'blake2s-256': 0xb260,
  'Skein256-8': 0xb301,
  'Skein256-16': 0xb302,
  'Skein256-24': 0xb303,
  'Skein256-32': 0xb304,
  'Skein256-40': 0xb305,
  'Skein256-48': 0xb306,
  'Skein256-56': 0xb307,
  'Skein256-64': 0xb308,
  'Skein256-72': 0xb309,
  'Skein256-80': 0xb30a,
  'Skein256-88': 0xb30b,
  'Skein256-96': 0xb30c,
  'Skein256-104': 0xb30d,
  'Skein256-112': 0xb30e,
  'Skein256-120': 0xb30f,
  'Skein256-128': 0xb310,
  'Skein256-136': 0xb311,
  'Skein256-144': 0xb312,
  'Skein256-152': 0xb313,
  'Skein256-160': 0xb314,
  'Skein256-168': 0xb315,
  'Skein256-176': 0xb316,
  'Skein256-184': 0xb317,
  'Skein256-192': 0xb318,
  'Skein256-200': 0xb319,
  'Skein256-208': 0xb31a,
  'Skein256-216': 0xb31b,
  'Skein256-224': 0xb31c,
  'Skein256-232': 0xb31d,
  'Skein256-240': 0xb31e,
  'Skein256-248': 0xb31f,
  'Skein256-256': 0xb320,
  'Skein512-8': 0xb321,
  'Skein512-16': 0xb322,
  'Skein512-24': 0xb323,
  'Skein512-32': 0xb324,
  'Skein512-40': 0xb325,
  'Skein512-48': 0xb326,
  'Skein512-56': 0xb327,
  'Skein512-64': 0xb328,
  'Skein512-72': 0xb329,
  'Skein512-80': 0xb32a,
  'Skein512-88': 0xb32b,
  'Skein512-96': 0xb32c,
  'Skein512-104': 0xb32d,
  'Skein512-112': 0xb32e,
  'Skein512-120': 0xb32f,
  'Skein512-128': 0xb330,
  'Skein512-136': 0xb331,
  'Skein512-144': 0xb332,
  'Skein512-152': 0xb333,
  'Skein512-160': 0xb334,
  'Skein512-168': 0xb335,
  'Skein512-176': 0xb336,
  'Skein512-184': 0xb337,
  'Skein512-192': 0xb338,
  'Skein512-200': 0xb339,
  'Skein512-208': 0xb33a,
  'Skein512-216': 0xb33b,
  'Skein512-224': 0xb33c,
  'Skein512-232': 0xb33d,
  'Skein512-240': 0xb33e,
  'Skein512-248': 0xb33f,
  'Skein512-256': 0xb340,
  'Skein512-264': 0xb341,
  'Skein512-272': 0xb342,
  'Skein512-280': 0xb343,
  'Skein512-288': 0xb344,
  'Skein512-296': 0xb345,
  'Skein512-304': 0xb346,
  'Skein512-312': 0xb347,
  'Skein512-320': 0xb348,
  'Skein512-328': 0xb349,
  'Skein512-336': 0xb34a,
  'Skein512-344': 0xb34b,
  'Skein512-352': 0xb34c,
  'Skein512-360': 0xb34d,
  'Skein512-368': 0xb34e,
  'Skein512-376': 0xb34f,
  'Skein512-384': 0xb350,
  'Skein512-392': 0xb351,
  'Skein512-400': 0xb352,
  'Skein512-408': 0xb353,
  'Skein512-416': 0xb354,
  'Skein512-424': 0xb355,
  'Skein512-432': 0xb356,
  'Skein512-440': 0xb357,
  'Skein512-448': 0xb358,
  'Skein512-456': 0xb359,
  'Skein512-464': 0xb35a,
  'Skein512-472': 0xb35b,
  'Skein512-480': 0xb35c,
  'Skein512-488': 0xb35d,
  'Skein512-496': 0xb35e,
  'Skein512-504': 0xb35f,
  'Skein512-512': 0xb360,
  'Skein1024-8': 0xb361,
  'Skein1024-16': 0xb362,
  'Skein1024-24': 0xb363,
  'Skein1024-32': 0xb364,
  'Skein1024-40': 0xb365,
  'Skein1024-48': 0xb366,
  'Skein1024-56': 0xb367,
  'Skein1024-64': 0xb368,
  'Skein1024-72': 0xb369,
  'Skein1024-80': 0xb36a,
  'Skein1024-88': 0xb36b,
  'Skein1024-96': 0xb36c,
  'Skein1024-104': 0xb36d,
  'Skein1024-112': 0xb36e,
  'Skein1024-120': 0xb36f,
  'Skein1024-128': 0xb370,
  'Skein1024-136': 0xb371,
  'Skein1024-144': 0xb372,
  'Skein1024-152': 0xb373,
  'Skein1024-160': 0xb374,
  'Skein1024-168': 0xb375,
  'Skein1024-176': 0xb376,
  'Skein1024-184': 0xb377,
  'Skein1024-192': 0xb378,
  'Skein1024-200': 0xb379,
  'Skein1024-208': 0xb37a,
  'Skein1024-216': 0xb37b,
  'Skein1024-224': 0xb37c,
  'Skein1024-232': 0xb37d,
  'Skein1024-240': 0xb37e,
  'Skein1024-248': 0xb37f,
  'Skein1024-256': 0xb380,
  'Skein1024-264': 0xb381,
  'Skein1024-272': 0xb382,
  'Skein1024-280': 0xb383,
  'Skein1024-288': 0xb384,
  'Skein1024-296': 0xb385,
  'Skein1024-304': 0xb386,
  'Skein1024-312': 0xb387,
  'Skein1024-320': 0xb388,
  'Skein1024-328': 0xb389,
  'Skein1024-336': 0xb38a,
  'Skein1024-344': 0xb38b,
  'Skein1024-352': 0xb38c,
  'Skein1024-360': 0xb38d,
  'Skein1024-368': 0xb38e,
  'Skein1024-376': 0xb38f,
  'Skein1024-384': 0xb390,
  'Skein1024-392': 0xb391,
  'Skein1024-400': 0xb392,
  'Skein1024-408': 0xb393,
  'Skein1024-416': 0xb394,
  'Skein1024-424': 0xb395,
  'Skein1024-432': 0xb396,
  'Skein1024-440': 0xb397,
  'Skein1024-448': 0xb398,
  'Skein1024-456': 0xb399,
  'Skein1024-464': 0xb39a,
  'Skein1024-472': 0xb39b,
  'Skein1024-480': 0xb39c,
  'Skein1024-488': 0xb39d,
  'Skein1024-496': 0xb39e,
  'Skein1024-504': 0xb39f,
  'Skein1024-512': 0xb3a0,
  'Skein1024-520': 0xb3a1,
  'Skein1024-528': 0xb3a2,
  'Skein1024-536': 0xb3a3,
  'Skein1024-544': 0xb3a4,
  'Skein1024-552': 0xb3a5,
  'Skein1024-560': 0xb3a6,
  'Skein1024-568': 0xb3a7,
  'Skein1024-576': 0xb3a8,
  'Skein1024-584': 0xb3a9,
  'Skein1024-592': 0xb3aa,
  'Skein1024-600': 0xb3ab,
  'Skein1024-608': 0xb3ac,
  'Skein1024-616': 0xb3ad,
  'Skein1024-624': 0xb3ae,
  'Skein1024-632': 0xb3af,
  'Skein1024-640': 0xb3b0,
  'Skein1024-648': 0xb3b1,
  'Skein1024-656': 0xb3b2,
  'Skein1024-664': 0xb3b3,
  'Skein1024-672': 0xb3b4,
  'Skein1024-680': 0xb3b5,
  'Skein1024-688': 0xb3b6,
  'Skein1024-696': 0xb3b7,
  'Skein1024-704': 0xb3b8,
  'Skein1024-712': 0xb3b9,
  'Skein1024-720': 0xb3ba,
  'Skein1024-728': 0xb3bb,
  'Skein1024-736': 0xb3bc,
  'Skein1024-744': 0xb3bd,
  'Skein1024-752': 0xb3be,
  'Skein1024-760': 0xb3bf,
  'Skein1024-768': 0xb3c0,
  'Skein1024-776': 0xb3c1,
  'Skein1024-784': 0xb3c2,
  'Skein1024-792': 0xb3c3,
  'Skein1024-800': 0xb3c4,
  'Skein1024-808': 0xb3c5,
  'Skein1024-816': 0xb3c6,
  'Skein1024-824': 0xb3c7,
  'Skein1024-832': 0xb3c8,
  'Skein1024-840': 0xb3c9,
  'Skein1024-848': 0xb3ca,
  'Skein1024-856': 0xb3cb,
  'Skein1024-864': 0xb3cc,
  'Skein1024-872': 0xb3cd,
  'Skein1024-880': 0xb3ce,
  'Skein1024-888': 0xb3cf,
  'Skein1024-896': 0xb3d0,
  'Skein1024-904': 0xb3d1,
  'Skein1024-912': 0xb3d2,
  'Skein1024-920': 0xb3d3,
  'Skein1024-928': 0xb3d4,
  'Skein1024-936': 0xb3d5,
  'Skein1024-944': 0xb3d6,
  'Skein1024-952': 0xb3d7,
  'Skein1024-960': 0xb3d8,
  'Skein1024-968': 0xb3d9,
  'Skein1024-976': 0xb3da,
  'Skein1024-984': 0xb3db,
  'Skein1024-992': 0xb3dc,
  'Skein1024-1000': 0xb3dd,
  'Skein1024-1008': 0xb3de,
  'Skein1024-1016': 0xb3df,
  'Skein1024-1024': 0xb3e0
})

exports.codes = Object.freeze({
  0x11: 'sha1',
  0x12: 'sha2-256',
  0x13: 'sha2-512',
  0x17: 'sha3-224',
  0x16: 'sha3-256',
  0x15: 'sha3-384',
  0x14: 'sha3-512',
  0x18: 'shake-128',
  0x19: 'shake-256',
  0x1A: 'keccak-224',
  0x1B: 'keccak-256',
  0x1C: 'keccak-384',
  0x1D: 'keccak-512',
  0x22: 'murmur3-128',
  0x23: 'murmur3-32',

  // blake2
  0xb201: 'blake2b-8',
  0xb202: 'blake2b-16',
  0xb203: 'blake2b-24',
  0xb204: 'blake2b-32',
  0xb205: 'blake2b-40',
  0xb206: 'blake2b-48',
  0xb207: 'blake2b-56',
  0xb208: 'blake2b-64',
  0xb209: 'blake2b-72',
  0xb20a: 'blake2b-80',
  0xb20b: 'blake2b-88',
  0xb20c: 'blake2b-96',
  0xb20d: 'blake2b-104',
  0xb20e: 'blake2b-112',
  0xb20f: 'blake2b-120',
  0xb210: 'blake2b-128',
  0xb211: 'blake2b-136',
  0xb212: 'blake2b-144',
  0xb213: 'blake2b-152',
  0xb214: 'blake2b-160',
  0xb215: 'blake2b-168',
  0xb216: 'blake2b-176',
  0xb217: 'blake2b-184',
  0xb218: 'blake2b-192',
  0xb219: 'blake2b-200',
  0xb21a: 'blake2b-208',
  0xb21b: 'blake2b-216',
  0xb21c: 'blake2b-224',
  0xb21d: 'blake2b-232',
  0xb21e: 'blake2b-240',
  0xb21f: 'blake2b-248',
  0xb220: 'blake2b-256',
  0xb221: 'blake2b-264',
  0xb222: 'blake2b-272',
  0xb223: 'blake2b-280',
  0xb224: 'blake2b-288',
  0xb225: 'blake2b-296',
  0xb226: 'blake2b-304',
  0xb227: 'blake2b-312',
  0xb228: 'blake2b-320',
  0xb229: 'blake2b-328',
  0xb22a: 'blake2b-336',
  0xb22b: 'blake2b-344',
  0xb22c: 'blake2b-352',
  0xb22d: 'blake2b-360',
  0xb22e: 'blake2b-368',
  0xb22f: 'blake2b-376',
  0xb230: 'blake2b-384',
  0xb231: 'blake2b-392',
  0xb232: 'blake2b-400',
  0xb233: 'blake2b-408',
  0xb234: 'blake2b-416',
  0xb235: 'blake2b-424',
  0xb236: 'blake2b-432',
  0xb237: 'blake2b-440',
  0xb238: 'blake2b-448',
  0xb239: 'blake2b-456',
  0xb23a: 'blake2b-464',
  0xb23b: 'blake2b-472',
  0xb23c: 'blake2b-480',
  0xb23d: 'blake2b-488',
  0xb23e: 'blake2b-496',
  0xb23f: 'blake2b-504',
  0xb240: 'blake2b-512',
  0xb241: 'blake2s-8',
  0xb242: 'blake2s-16',
  0xb243: 'blake2s-24',
  0xb244: 'blake2s-32',
  0xb245: 'blake2s-40',
  0xb246: 'blake2s-48',
  0xb247: 'blake2s-56',
  0xb248: 'blake2s-64',
  0xb249: 'blake2s-72',
  0xb24a: 'blake2s-80',
  0xb24b: 'blake2s-88',
  0xb24c: 'blake2s-96',
  0xb24d: 'blake2s-104',
  0xb24e: 'blake2s-112',
  0xb24f: 'blake2s-120',
  0xb250: 'blake2s-128',
  0xb251: 'blake2s-136',
  0xb252: 'blake2s-144',
  0xb253: 'blake2s-152',
  0xb254: 'blake2s-160',
  0xb255: 'blake2s-168',
  0xb256: 'blake2s-176',
  0xb257: 'blake2s-184',
  0xb258: 'blake2s-192',
  0xb259: 'blake2s-200',
  0xb25a: 'blake2s-208',
  0xb25b: 'blake2s-216',
  0xb25c: 'blake2s-224',
  0xb25d: 'blake2s-232',
  0xb25e: 'blake2s-240',
  0xb25f: 'blake2s-248',
  0xb260: 'blake2s-256',

  // skein
  0xb301: 'Skein256-8',
  0xb302: 'Skein256-16',
  0xb303: 'Skein256-24',
  0xb304: 'Skein256-32',
  0xb305: 'Skein256-40',
  0xb306: 'Skein256-48',
  0xb307: 'Skein256-56',
  0xb308: 'Skein256-64',
  0xb309: 'Skein256-72',
  0xb30a: 'Skein256-80',
  0xb30b: 'Skein256-88',
  0xb30c: 'Skein256-96',
  0xb30d: 'Skein256-104',
  0xb30e: 'Skein256-112',
  0xb30f: 'Skein256-120',
  0xb310: 'Skein256-128',
  0xb311: 'Skein256-136',
  0xb312: 'Skein256-144',
  0xb313: 'Skein256-152',
  0xb314: 'Skein256-160',
  0xb315: 'Skein256-168',
  0xb316: 'Skein256-176',
  0xb317: 'Skein256-184',
  0xb318: 'Skein256-192',
  0xb319: 'Skein256-200',
  0xb31a: 'Skein256-208',
  0xb31b: 'Skein256-216',
  0xb31c: 'Skein256-224',
  0xb31d: 'Skein256-232',
  0xb31e: 'Skein256-240',
  0xb31f: 'Skein256-248',
  0xb320: 'Skein256-256',
  0xb321: 'Skein512-8',
  0xb322: 'Skein512-16',
  0xb323: 'Skein512-24',
  0xb324: 'Skein512-32',
  0xb325: 'Skein512-40',
  0xb326: 'Skein512-48',
  0xb327: 'Skein512-56',
  0xb328: 'Skein512-64',
  0xb329: 'Skein512-72',
  0xb32a: 'Skein512-80',
  0xb32b: 'Skein512-88',
  0xb32c: 'Skein512-96',
  0xb32d: 'Skein512-104',
  0xb32e: 'Skein512-112',
  0xb32f: 'Skein512-120',
  0xb330: 'Skein512-128',
  0xb331: 'Skein512-136',
  0xb332: 'Skein512-144',
  0xb333: 'Skein512-152',
  0xb334: 'Skein512-160',
  0xb335: 'Skein512-168',
  0xb336: 'Skein512-176',
  0xb337: 'Skein512-184',
  0xb338: 'Skein512-192',
  0xb339: 'Skein512-200',
  0xb33a: 'Skein512-208',
  0xb33b: 'Skein512-216',
  0xb33c: 'Skein512-224',
  0xb33d: 'Skein512-232',
  0xb33e: 'Skein512-240',
  0xb33f: 'Skein512-248',
  0xb340: 'Skein512-256',
  0xb341: 'Skein512-264',
  0xb342: 'Skein512-272',
  0xb343: 'Skein512-280',
  0xb344: 'Skein512-288',
  0xb345: 'Skein512-296',
  0xb346: 'Skein512-304',
  0xb347: 'Skein512-312',
  0xb348: 'Skein512-320',
  0xb349: 'Skein512-328',
  0xb34a: 'Skein512-336',
  0xb34b: 'Skein512-344',
  0xb34c: 'Skein512-352',
  0xb34d: 'Skein512-360',
  0xb34e: 'Skein512-368',
  0xb34f: 'Skein512-376',
  0xb350: 'Skein512-384',
  0xb351: 'Skein512-392',
  0xb352: 'Skein512-400',
  0xb353: 'Skein512-408',
  0xb354: 'Skein512-416',
  0xb355: 'Skein512-424',
  0xb356: 'Skein512-432',
  0xb357: 'Skein512-440',
  0xb358: 'Skein512-448',
  0xb359: 'Skein512-456',
  0xb35a: 'Skein512-464',
  0xb35b: 'Skein512-472',
  0xb35c: 'Skein512-480',
  0xb35d: 'Skein512-488',
  0xb35e: 'Skein512-496',
  0xb35f: 'Skein512-504',
  0xb360: 'Skein512-512',
  0xb361: 'Skein1024-8',
  0xb362: 'Skein1024-16',
  0xb363: 'Skein1024-24',
  0xb364: 'Skein1024-32',
  0xb365: 'Skein1024-40',
  0xb366: 'Skein1024-48',
  0xb367: 'Skein1024-56',
  0xb368: 'Skein1024-64',
  0xb369: 'Skein1024-72',
  0xb36a: 'Skein1024-80',
  0xb36b: 'Skein1024-88',
  0xb36c: 'Skein1024-96',
  0xb36d: 'Skein1024-104',
  0xb36e: 'Skein1024-112',
  0xb36f: 'Skein1024-120',
  0xb370: 'Skein1024-128',
  0xb371: 'Skein1024-136',
  0xb372: 'Skein1024-144',
  0xb373: 'Skein1024-152',
  0xb374: 'Skein1024-160',
  0xb375: 'Skein1024-168',
  0xb376: 'Skein1024-176',
  0xb377: 'Skein1024-184',
  0xb378: 'Skein1024-192',
  0xb379: 'Skein1024-200',
  0xb37a: 'Skein1024-208',
  0xb37b: 'Skein1024-216',
  0xb37c: 'Skein1024-224',
  0xb37d: 'Skein1024-232',
  0xb37e: 'Skein1024-240',
  0xb37f: 'Skein1024-248',
  0xb380: 'Skein1024-256',
  0xb381: 'Skein1024-264',
  0xb382: 'Skein1024-272',
  0xb383: 'Skein1024-280',
  0xb384: 'Skein1024-288',
  0xb385: 'Skein1024-296',
  0xb386: 'Skein1024-304',
  0xb387: 'Skein1024-312',
  0xb388: 'Skein1024-320',
  0xb389: 'Skein1024-328',
  0xb38a: 'Skein1024-336',
  0xb38b: 'Skein1024-344',
  0xb38c: 'Skein1024-352',
  0xb38d: 'Skein1024-360',
  0xb38e: 'Skein1024-368',
  0xb38f: 'Skein1024-376',
  0xb390: 'Skein1024-384',
  0xb391: 'Skein1024-392',
  0xb392: 'Skein1024-400',
  0xb393: 'Skein1024-408',
  0xb394: 'Skein1024-416',
  0xb395: 'Skein1024-424',
  0xb396: 'Skein1024-432',
  0xb397: 'Skein1024-440',
  0xb398: 'Skein1024-448',
  0xb399: 'Skein1024-456',
  0xb39a: 'Skein1024-464',
  0xb39b: 'Skein1024-472',
  0xb39c: 'Skein1024-480',
  0xb39d: 'Skein1024-488',
  0xb39e: 'Skein1024-496',
  0xb39f: 'Skein1024-504',
  0xb3a0: 'Skein1024-512',
  0xb3a1: 'Skein1024-520',
  0xb3a2: 'Skein1024-528',
  0xb3a3: 'Skein1024-536',
  0xb3a4: 'Skein1024-544',
  0xb3a5: 'Skein1024-552',
  0xb3a6: 'Skein1024-560',
  0xb3a7: 'Skein1024-568',
  0xb3a8: 'Skein1024-576',
  0xb3a9: 'Skein1024-584',
  0xb3aa: 'Skein1024-592',
  0xb3ab: 'Skein1024-600',
  0xb3ac: 'Skein1024-608',
  0xb3ad: 'Skein1024-616',
  0xb3ae: 'Skein1024-624',
  0xb3af: 'Skein1024-632',
  0xb3b0: 'Skein1024-640',
  0xb3b1: 'Skein1024-648',
  0xb3b2: 'Skein1024-656',
  0xb3b3: 'Skein1024-664',
  0xb3b4: 'Skein1024-672',
  0xb3b5: 'Skein1024-680',
  0xb3b6: 'Skein1024-688',
  0xb3b7: 'Skein1024-696',
  0xb3b8: 'Skein1024-704',
  0xb3b9: 'Skein1024-712',
  0xb3ba: 'Skein1024-720',
  0xb3bb: 'Skein1024-728',
  0xb3bc: 'Skein1024-736',
  0xb3bd: 'Skein1024-744',
  0xb3be: 'Skein1024-752',
  0xb3bf: 'Skein1024-760',
  0xb3c0: 'Skein1024-768',
  0xb3c1: 'Skein1024-776',
  0xb3c2: 'Skein1024-784',
  0xb3c3: 'Skein1024-792',
  0xb3c4: 'Skein1024-800',
  0xb3c5: 'Skein1024-808',
  0xb3c6: 'Skein1024-816',
  0xb3c7: 'Skein1024-824',
  0xb3c8: 'Skein1024-832',
  0xb3c9: 'Skein1024-840',
  0xb3ca: 'Skein1024-848',
  0xb3cb: 'Skein1024-856',
  0xb3cc: 'Skein1024-864',
  0xb3cd: 'Skein1024-872',
  0xb3ce: 'Skein1024-880',
  0xb3cf: 'Skein1024-888',
  0xb3d0: 'Skein1024-896',
  0xb3d1: 'Skein1024-904',
  0xb3d2: 'Skein1024-912',
  0xb3d3: 'Skein1024-920',
  0xb3d4: 'Skein1024-928',
  0xb3d5: 'Skein1024-936',
  0xb3d6: 'Skein1024-944',
  0xb3d7: 'Skein1024-952',
  0xb3d8: 'Skein1024-960',
  0xb3d9: 'Skein1024-968',
  0xb3da: 'Skein1024-976',
  0xb3db: 'Skein1024-984',
  0xb3dc: 'Skein1024-992',
  0xb3dd: 'Skein1024-1000',
  0xb3de: 'Skein1024-1008',
  0xb3df: 'Skein1024-1016',
  0xb3e0: 'Skein1024-1024'
})

exports.defaultLengths = Object.freeze({
  0x11: 20,
  0x12: 32,
  0x13: 64,
  0x17: 28,
  0x16: 32,
  0x15: 48,
  0x14: 64,
  0x18: 32,
  0x19: 64,
  0x1A: 28,
  0x1B: 32,
  0x1C: 48,
  0x1D: 64,
  0x22: 32,

  0xb201: 0x01,
  0xb202: 0x02,
  0xb203: 0x03,
  0xb204: 0x04,
  0xb205: 0x05,
  0xb206: 0x06,
  0xb207: 0x07,
  0xb208: 0x08,
  0xb209: 0x09,
  0xb20a: 0x0a,
  0xb20b: 0x0b,
  0xb20c: 0x0c,
  0xb20d: 0x0d,
  0xb20e: 0x0e,
  0xb20f: 0x0f,
  0xb210: 0x10,
  0xb211: 0x11,
  0xb212: 0x12,
  0xb213: 0x13,
  0xb214: 0x14,
  0xb215: 0x15,
  0xb216: 0x16,
  0xb217: 0x17,
  0xb218: 0x18,
  0xb219: 0x19,
  0xb21a: 0x1a,
  0xb21b: 0x1b,
  0xb21c: 0x1c,
  0xb21d: 0x1d,
  0xb21e: 0x1e,
  0xb21f: 0x1f,
  0xb220: 0x20,
  0xb221: 0x21,
  0xb222: 0x22,
  0xb223: 0x23,
  0xb224: 0x24,
  0xb225: 0x25,
  0xb226: 0x26,
  0xb227: 0x27,
  0xb228: 0x28,
  0xb229: 0x29,
  0xb22a: 0x2a,
  0xb22b: 0x2b,
  0xb22c: 0x2c,
  0xb22d: 0x2d,
  0xb22e: 0x2e,
  0xb22f: 0x2f,
  0xb230: 0x30,
  0xb231: 0x31,
  0xb232: 0x32,
  0xb233: 0x33,
  0xb234: 0x34,
  0xb235: 0x35,
  0xb236: 0x36,
  0xb237: 0x37,
  0xb238: 0x38,
  0xb239: 0x39,
  0xb23a: 0x3a,
  0xb23b: 0x3b,
  0xb23c: 0x3c,
  0xb23d: 0x3d,
  0xb23e: 0x3e,
  0xb23f: 0x3f,
  0xb240: 0x40,
  0xb241: 0x01,
  0xb242: 0x02,
  0xb243: 0x03,
  0xb244: 0x04,
  0xb245: 0x05,
  0xb246: 0x06,
  0xb247: 0x07,
  0xb248: 0x08,
  0xb249: 0x09,
  0xb24a: 0x0a,
  0xb24b: 0x0b,
  0xb24c: 0x0c,
  0xb24d: 0x0d,
  0xb24e: 0x0e,
  0xb24f: 0x0f,
  0xb250: 0x10,
  0xb251: 0x11,
  0xb252: 0x12,
  0xb253: 0x13,
  0xb254: 0x14,
  0xb255: 0x15,
  0xb256: 0x16,
  0xb257: 0x17,
  0xb258: 0x18,
  0xb259: 0x19,
  0xb25a: 0x1a,
  0xb25b: 0x1b,
  0xb25c: 0x1c,
  0xb25d: 0x1d,
  0xb25e: 0x1e,
  0xb25f: 0x1f,
  0xb260: 0x20,
  0xb301: 0x01,
  0xb302: 0x02,
  0xb303: 0x03,
  0xb304: 0x04,
  0xb305: 0x05,
  0xb306: 0x06,
  0xb307: 0x07,
  0xb308: 0x08,
  0xb309: 0x09,
  0xb30a: 0x0a,
  0xb30b: 0x0b,
  0xb30c: 0x0c,
  0xb30d: 0x0d,
  0xb30e: 0x0e,
  0xb30f: 0x0f,
  0xb310: 0x10,
  0xb311: 0x11,
  0xb312: 0x12,
  0xb313: 0x13,
  0xb314: 0x14,
  0xb315: 0x15,
  0xb316: 0x16,
  0xb317: 0x17,
  0xb318: 0x18,
  0xb319: 0x19,
  0xb31a: 0x1a,
  0xb31b: 0x1b,
  0xb31c: 0x1c,
  0xb31d: 0x1d,
  0xb31e: 0x1e,
  0xb31f: 0x1f,
  0xb320: 0x20,
  0xb321: 0x01,
  0xb322: 0x02,
  0xb323: 0x03,
  0xb324: 0x04,
  0xb325: 0x05,
  0xb326: 0x06,
  0xb327: 0x07,
  0xb328: 0x08,
  0xb329: 0x09,
  0xb32a: 0x0a,
  0xb32b: 0x0b,
  0xb32c: 0x0c,
  0xb32d: 0x0d,
  0xb32e: 0x0e,
  0xb32f: 0x0f,
  0xb330: 0x10,
  0xb331: 0x11,
  0xb332: 0x12,
  0xb333: 0x13,
  0xb334: 0x14,
  0xb335: 0x15,
  0xb336: 0x16,
  0xb337: 0x17,
  0xb338: 0x18,
  0xb339: 0x19,
  0xb33a: 0x1a,
  0xb33b: 0x1b,
  0xb33c: 0x1c,
  0xb33d: 0x1d,
  0xb33e: 0x1e,
  0xb33f: 0x1f,
  0xb340: 0x20,
  0xb341: 0x21,
  0xb342: 0x22,
  0xb343: 0x23,
  0xb344: 0x24,
  0xb345: 0x25,
  0xb346: 0x26,
  0xb347: 0x27,
  0xb348: 0x28,
  0xb349: 0x29,
  0xb34a: 0x2a,
  0xb34b: 0x2b,
  0xb34c: 0x2c,
  0xb34d: 0x2d,
  0xb34e: 0x2e,
  0xb34f: 0x2f,
  0xb350: 0x30,
  0xb351: 0x31,
  0xb352: 0x32,
  0xb353: 0x33,
  0xb354: 0x34,
  0xb355: 0x35,
  0xb356: 0x36,
  0xb357: 0x37,
  0xb358: 0x38,
  0xb359: 0x39,
  0xb35a: 0x3a,
  0xb35b: 0x3b,
  0xb35c: 0x3c,
  0xb35d: 0x3d,
  0xb35e: 0x3e,
  0xb35f: 0x3f,
  0xb360: 0x40,
  0xb361: 0x01,
  0xb362: 0x02,
  0xb363: 0x03,
  0xb364: 0x04,
  0xb365: 0x05,
  0xb366: 0x06,
  0xb367: 0x07,
  0xb368: 0x08,
  0xb369: 0x09,
  0xb36a: 0x0a,
  0xb36b: 0x0b,
  0xb36c: 0x0c,
  0xb36d: 0x0d,
  0xb36e: 0x0e,
  0xb36f: 0x0f,
  0xb370: 0x10,
  0xb371: 0x11,
  0xb372: 0x12,
  0xb373: 0x13,
  0xb374: 0x14,
  0xb375: 0x15,
  0xb376: 0x16,
  0xb377: 0x17,
  0xb378: 0x18,
  0xb379: 0x19,
  0xb37a: 0x1a,
  0xb37b: 0x1b,
  0xb37c: 0x1c,
  0xb37d: 0x1d,
  0xb37e: 0x1e,
  0xb37f: 0x1f,
  0xb380: 0x20,
  0xb381: 0x21,
  0xb382: 0x22,
  0xb383: 0x23,
  0xb384: 0x24,
  0xb385: 0x25,
  0xb386: 0x26,
  0xb387: 0x27,
  0xb388: 0x28,
  0xb389: 0x29,
  0xb38a: 0x2a,
  0xb38b: 0x2b,
  0xb38c: 0x2c,
  0xb38d: 0x2d,
  0xb38e: 0x2e,
  0xb38f: 0x2f,
  0xb390: 0x30,
  0xb391: 0x31,
  0xb392: 0x32,
  0xb393: 0x33,
  0xb394: 0x34,
  0xb395: 0x35,
  0xb396: 0x36,
  0xb397: 0x37,
  0xb398: 0x38,
  0xb399: 0x39,
  0xb39a: 0x3a,
  0xb39b: 0x3b,
  0xb39c: 0x3c,
  0xb39d: 0x3d,
  0xb39e: 0x3e,
  0xb39f: 0x3f,
  0xb3a0: 0x40,
  0xb3a1: 0x41,
  0xb3a2: 0x42,
  0xb3a3: 0x43,
  0xb3a4: 0x44,
  0xb3a5: 0x45,
  0xb3a6: 0x46,
  0xb3a7: 0x47,
  0xb3a8: 0x48,
  0xb3a9: 0x49,
  0xb3aa: 0x4a,
  0xb3ab: 0x4b,
  0xb3ac: 0x4c,
  0xb3ad: 0x4d,
  0xb3ae: 0x4e,
  0xb3af: 0x4f,
  0xb3b0: 0x50,
  0xb3b1: 0x51,
  0xb3b2: 0x52,
  0xb3b3: 0x53,
  0xb3b4: 0x54,
  0xb3b5: 0x55,
  0xb3b6: 0x56,
  0xb3b7: 0x57,
  0xb3b8: 0x58,
  0xb3b9: 0x59,
  0xb3ba: 0x5a,
  0xb3bb: 0x5b,
  0xb3bc: 0x5c,
  0xb3bd: 0x5d,
  0xb3be: 0x5e,
  0xb3bf: 0x5f,
  0xb3c0: 0x60,
  0xb3c1: 0x61,
  0xb3c2: 0x62,
  0xb3c3: 0x63,
  0xb3c4: 0x64,
  0xb3c5: 0x65,
  0xb3c6: 0x66,
  0xb3c7: 0x67,
  0xb3c8: 0x68,
  0xb3c9: 0x69,
  0xb3ca: 0x6a,
  0xb3cb: 0x6b,
  0xb3cc: 0x6c,
  0xb3cd: 0x6d,
  0xb3ce: 0x6e,
  0xb3cf: 0x6f,
  0xb3d0: 0x70,
  0xb3d1: 0x71,
  0xb3d2: 0x72,
  0xb3d3: 0x73,
  0xb3d4: 0x74,
  0xb3d5: 0x75,
  0xb3d6: 0x76,
  0xb3d7: 0x77,
  0xb3d8: 0x78,
  0xb3d9: 0x79,
  0xb3da: 0x7a,
  0xb3db: 0x7b,
  0xb3dc: 0x7c,
  0xb3dd: 0x7d,
  0xb3de: 0x7e,
  0xb3df: 0x7f,
  0xb3e0: 0x80
})


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = encode

var MSB = 0x80
  , REST = 0x7F
  , MSBALL = ~REST
  , INT = Math.pow(2, 31)

function encode(num, out, offset) {
  out = out || []
  offset = offset || 0
  var oldOffset = offset

  while(num >= INT) {
    out[offset++] = (num & 0xFF) | MSB
    num /= 128
  }
  while(num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB
    num >>>= 7
  }
  out[offset] = num | 0
  
  encode.bytes = offset - oldOffset + 1
  
  return out
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = read

var MSB = 0x80
  , REST = 0x7F

function read(buf, offset) {
  var res    = 0
    , offset = offset || 0
    , shift  = 0
    , counter = offset
    , b
    , l = buf.length

  do {
    if (counter >= l) {
      read.bytes = 0
      throw new RangeError('Could not decode varint')
    }
    b = buf[counter++]
    res += shift < 28
      ? (b & REST) << shift
      : (b & REST) * Math.pow(2, shift)
    shift += 7
  } while (b >= MSB)

  read.bytes = counter - offset

  return res
}


/***/ }),
/* 19 */
/***/ (function(module, exports) {


var N1 = Math.pow(2,  7)
var N2 = Math.pow(2, 14)
var N3 = Math.pow(2, 21)
var N4 = Math.pow(2, 28)
var N5 = Math.pow(2, 35)
var N6 = Math.pow(2, 42)
var N7 = Math.pow(2, 49)
var N8 = Math.pow(2, 56)
var N9 = Math.pow(2, 63)

module.exports = function (value) {
  return (
    value < N1 ? 1
  : value < N2 ? 2
  : value < N3 ? 3
  : value < N4 ? 4
  : value < N5 ? 5
  : value < N6 ? 6
  : value < N7 ? 7
  : value < N8 ? 8
  : value < N9 ? 9
  :              10
  )
}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * Implementation of the [multibase](https://github.com/multiformats/multibase) specification.
 * @module Multibase
 */


const constants = __webpack_require__(21)

exports = module.exports = multibase
exports.encode = encode
exports.decode = decode
exports.isEncoded = isEncoded

const errNotSupported = new Error('Unsupported encoding')

/**
 * Create a new buffer with the multibase varint+code.
 *
 * @param {string|number} nameOrCode - The multibase name or code number.
 * @param {Buffer} buf - The data to be prefixed with multibase.
 * @memberof Multibase
 * @returns {Buffer}
 */
function multibase (nameOrCode, buf) {
  if (!buf) {
    throw new Error('requires an encoded buffer')
  }
  const base = getBase(nameOrCode)
  const codeBuf = new Buffer(base.code)

  const name = base.name
  validEncode(name, buf)
  return Buffer.concat([codeBuf, buf])
}

/**
 * Encode data with the specified base and add the multibase prefix.
 *
 * @param {string|number} nameOrCode - The multibase name or code number.
 * @param {Buffer} buf - The data to be encoded.
 * @returns {Buffer}
 * @memberof Multibase
 */
function encode (nameOrCode, buf) {
  const base = getBase(nameOrCode)
  const name = base.name

  return multibase(name, new Buffer(base.encode(buf)))
}

/**
 *
 * Takes a buffer or string encoded with multibase header
 * decodes it and returns an object with the decoded buffer
 * and the encoded type { base: <name>, data: <buffer> }
 *
 * from @theobat : This is not what the multibase.spec.js test is waiting for,
 * hence the return decodeObject.data
 *
 * @param {Buffer|string} bufOrString
 * @returns {Object} result
 * @returns {string} result.base
 * @returns {Buffer} result.data
 * @memberof Multibase
 *
 */
function decode (bufOrString) {
  if (Buffer.isBuffer(bufOrString)) {
    bufOrString = bufOrString.toString()
  }

  const code = bufOrString.substring(0, 1)
  bufOrString = bufOrString.substring(1, bufOrString.length)

  if (typeof bufOrString === 'string') {
    bufOrString = new Buffer(bufOrString)
  }

  const base = getBase(code)

  const decodeObject = {
    base: base.name,
    data: new Buffer(base.decode(bufOrString.toString()))
  }
  return decodeObject.data
}

/**
 * Is the given data multibase encoded?
 *
 * @param {Buffer|string} bufOrString
 * @returns {boolean}
 * @memberof Multibase
 */
function isEncoded (bufOrString) {
  if (Buffer.isBuffer(bufOrString)) {
    bufOrString = bufOrString.toString()
  }

  const code = bufOrString.substring(0, 1)
  try {
    const base = getBase(code)
    return base.name
  } catch (err) {
    return false
  }
}

/**
 * @param {string} name
 * @param {Buffer} buf
 * @private
 * @returns {undefined}
 */
function validEncode (name, buf) {
  const base = getBase(name)
  base.decode(buf.toString())
}

function getBase (nameOrCode) {
  let base

  if (constants.names[nameOrCode]) {
    base = constants.names[nameOrCode]
  } else if (constants.codes[nameOrCode]) {
    base = constants.codes[nameOrCode]
  } else {
    throw errNotSupported
  }

  if (!base.isImplemented()) {
    throw new Error('Base ' + nameOrCode + ' is not implemented yet')
  }

  return base
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Base = __webpack_require__(22)
const baseX = __webpack_require__(23)
const base16 = __webpack_require__(24)

// name, code, implementation, alphabet
const constants = [
  ['base1', '1', '', '1'],
  ['base2', '0', baseX, '01'],
  ['base8', '7', baseX, '01234567'],
  ['base10', '9', baseX, '0123456789'],
  ['base16', 'f', base16, '0123456789abcdef'],
  ['base32hex', 'v', baseX, '0123456789abcdefghijklmnopqrstuv'],
  ['base32', 'b', baseX, 'abcdefghijklmnopqrstuvwxyz234567'],
  ['base32z', 'h', baseX, 'ybndrfg8ejkmcpqxot1uwisza345h769'],
  ['base58flickr', 'Z', baseX, '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'],
  ['base58btc', 'z', baseX, '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'],
  ['base64', 'm', baseX, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'],
  ['base64url', 'u', baseX, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_']
]

const names = constants.reduce((prev, tupple) => {
  prev[tupple[0]] = new Base(tupple[0], tupple[1], tupple[2], tupple[3])
  return prev
}, {})

const codes = constants.reduce((prev, tupple) => {
  prev[tupple[1]] = names[tupple[0]]
  return prev
}, {})

module.exports = {
  names: names,
  codes: codes
}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class Base {
  constructor (name, code, implementation, alphabet) {
    this.name = name
    this.code = code
    this.alphabet = alphabet
    if (implementation && alphabet) {
      this.engine = implementation(alphabet)
    }
  }

  encode (stringOrBuffer) {
    return this.engine.encode(stringOrBuffer)
  }

  decode (stringOrBuffer) {
    return this.engine.decode(stringOrBuffer)
  }

  isImplemented () {
    return this.engine
  }
}

module.exports = Base


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

module.exports = function base (ALPHABET) {
  var ALPHABET_MAP = {}
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)

  // pre-compute lookup table
  for (var z = 0; z < ALPHABET.length; z++) {
    var x = ALPHABET.charAt(z)

    if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
    ALPHABET_MAP[x] = z
  }

  function encode (source) {
    if (source.length === 0) return ''

    var digits = [0]
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < digits.length; ++j) {
        carry += digits[j] << 8
        digits[j] = carry % BASE
        carry = (carry / BASE) | 0
      }

      while (carry > 0) {
        digits.push(carry % BASE)
        carry = (carry / BASE) | 0
      }
    }

    var string = ''

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += ALPHABET[0]
    // convert digits to a string
    for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]]

    return string
  }

  function decodeUnsafe (string) {
    if (string.length === 0) return Buffer.allocUnsafe(0)

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
      var value = ALPHABET_MAP[string[i]]
      if (value === undefined) return

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * BASE
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === LEADER && k < string.length - 1; ++k) {
      bytes.push(0)
    }

    return Buffer.from(bytes.reverse())
  }

  function decode (string) {
    var buffer = decodeUnsafe(string)
    if (buffer) return buffer

    throw new Error('Non-base' + BASE + ' character')
  }

  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

module.exports = function base16 (alphabet) {
  return {
    encode (input) {
      if (typeof input === 'string') {
        return new Buffer(input).toString('hex')
      }
      return input.toString('hex')
    },
    decode (input) {
      for (let char of input) {
        if (alphabet.indexOf(char) < 0) {
          throw new Error('invalid base16 character')
        }
      }
      return new Buffer(input, 'hex')
    }
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * Implementation of the multicodec specification.
 *
 * @module multicodec
 * @example
 * const multicodec = require('multicodec')
 *
 * const prefixedProtobuf = multicodec.addPrefix('protobuf', protobufBuffer)
 * // prefixedProtobuf 0x50...
 *
 */


const varint = __webpack_require__(1)
const codecNameToCodeVarint = __webpack_require__(5)
const codeToCodecName = __webpack_require__(26)
const util = __webpack_require__(6)

exports = module.exports

/**
 * Prefix a buffer with a multicodec-packed.
 *
 * @param {string|number} multicodecStrOrCode
 * @param {Buffer} data
 * @returns {Buffer}
 */
exports.addPrefix = (multicodecStrOrCode, data) => {
  let prefix

  if (Buffer.isBuffer(multicodecStrOrCode)) {
    prefix = util.varintBufferEncode(multicodecStrOrCode)
  } else {
    if (codecNameToCodeVarint[multicodecStrOrCode]) {
      prefix = codecNameToCodeVarint[multicodecStrOrCode]
    } else {
      throw new Error('multicodec not recognized')
    }
  }
  return Buffer.concat([prefix, data])
}

/**
 * Decapsulate the multicodec-packed prefix from the data.
 *
 * @param {Buffer} data
 * @returns {Buffer}
 */
exports.rmPrefix = (data) => {
  varint.decode(data)
  return data.slice(varint.decode.bytes)
}

/**
 * Get the codec of the prefixed data.
 * @param {Buffer} prefixedData
 * @returns {string}
 */
exports.getCodec = (prefixedData) => {
  const code = util.varintBufferDecode(prefixedData)
  const codecName = codeToCodecName[code.toString('hex')]
  return codecName
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const baseTable = __webpack_require__(2)

// this creates a map for code as hexString -> codecName

const nameTable = {}
module.exports = nameTable

for (let encodingName in baseTable) {
  let code = baseTable[encodingName]
  nameTable[code.toString('hex')] = encodingName
}


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CID = __webpack_require__(3)

const cidSymbol = Symbol.for('merkling#cid')
const statusSymbol = Symbol.for('merkling#status')

const IpldProxyExtension = {
  get (target, key) {
    if (key === cidSymbol) {
      const status = target[statusSymbol]
      if (status === 'UNLOADED' || status === 'SAVED') {
        return target[cidSymbol]
      }

      if (status === 'DIRTY') {
        throw Error('Can\'t read CID of unloaded ipld node')
      }
    }

    if (key === '_cid') {
      return target[cidSymbol]
    }

    if (typeof key !== 'string' || key === 'inspect') {
      return target[key]
    }

    if (!target[statusSymbol]) {
      throw Error(`IPLD node <${target[cidSymbol].toBaseEncodedString}> not loaded so access '${key.toString()}' failed`)
    }

    return target[key]
  },

  set (target, key, value) {
    if (key === statusSymbol || key === cidSymbol) {
      Reflect.set(...arguments)
      return true
    }

    if (target[statusSymbol] === 'SAVED') {
      target[cidSymbol] = undefined
      target[statusSymbol] = 'DIRTY'
      Reflect.set(...arguments)
      return true
    }

    if (target[statusSymbol] === 'UNLOADED') {
      return false
    }

    Reflect.set(...arguments)
    return true
  }
}

class IpldProxy {
  constructor () {
    this.UNLOADED = 'UNLOADED'
    this.SAVED = 'SAVED'
    this.DIRTY = 'DIRTY'
    this.TEMP = 'TEMP'

    this.allowedStatuses = [this.UNLOADED, this.SAVED, this.DIRTY]
  }

  isIpld (obj) {
    return this.allowedStatuses.includes(obj[statusSymbol])
  }

  isPersisted (obj) {
    return obj[statusSymbol] === this.UNLOADED || obj[statusSymbol] === this.SAVED
  }

  create (cid, status, obj) {
    if (!this.allowedStatuses.includes(status)) {
      throw Error('Unrecognized status ' + status)
    }

    obj[cidSymbol] = cid
    obj[statusSymbol] = status
    return new Proxy(obj, IpldProxyExtension)
  }

  createDirtyNode (obj) {
    return this.create(null, this.DIRTY, obj)
  }

  createSavedNode (cid, obj) {
    const id = CID.isCID(cid) ? cid : new CID(cid)
    return this.create(id, this.SAVED, obj)
  }

  createLinkNode (cid) {
    const id = CID.isCID(cid) ? cid : new CID(cid)

    const linkObj = {
      '/': id.toBaseEncodedString()
    }

    return this.create(id, this.UNLOADED, linkObj)
  }

  readCID (obj) {
    return obj[cidSymbol]
  }

  transition (node, options) {
    const { transition } = options
    switch (transition) {
      case 'load':
        if (node[statusSymbol] !== this.UNLOADED) {
          throw Error(`Transition not allowed ${transition} in state ${node[statusSymbol]}`)
        }

        this._loadLink(node, options)
        break
      case 'save':
        if (node[statusSymbol] !== this.DIRTY) {
          throw Error(`Transition not allowed ${transition} in state ${node[statusSymbol]}`)
        }

        this._saveDirty(node, options)
        break
      default:
        throw Error('Unkown transition ' + transition)
    }
  }

  extract (obj) {
    if (!this.isIpld(obj)) {
      return Object.assign({}, obj)
    } else {
      const status = obj[statusSymbol]
      obj[statusSymbol] = this.TEMP
      const objCopy = Object.assign({}, obj)
      delete objCopy[statusSymbol]
      delete objCopy[cidSymbol]
      obj[statusSymbol] = status
      return objCopy
    }
  }

  _loadLink (node, { object }) {
    node[statusSymbol] = null
    delete node['/']
    Object.assign(node, object)
    node[statusSymbol] = this.SAVED
  }

  _saveDirty (node, { cid }) {
    node[statusSymbol] = this.SAVED
    node[cidSymbol] = cid
  }
}

module.exports = {
  IpldProxy: IpldProxy
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAyNmUwNjNmMjFhMzA4NDJhZWVmZSIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92YXJpbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL2Jhc2UtdGFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NpZHMvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWhhc2hlcy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL3ZhcmludC10YWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbXVsdGljb2RlYy9zcmMvdXRpbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWVya2xpbmcuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9iczU4L2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9iYXNlLXgvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3NhZmUtYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWhhc2hlcy9zcmMvY29uc3RhbnRzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92YXJpbnQvZW5jb2RlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92YXJpbnQvZGVjb2RlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy92YXJpbnQvbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWJhc2Uvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWJhc2Uvc3JjL2NvbnN0YW50cy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbXVsdGliYXNlL3NyYy9iYXNlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWJhc2Uvbm9kZV9tb2R1bGVzL2Jhc2UteC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbXVsdGliYXNlL3NyYy9iYXNlMTYuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tdWx0aWNvZGVjL3NyYy9uYW1lLXRhYmxlLmpzIiwid2VicGFjazovLy8uL3NyYy9pcGxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO0FDVkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLG1EQUFtRDtBQUN4RTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFVBQVU7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSx1Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGlCQUFpQjtBQUNoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWEsaUJBQWlCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxFQUFFO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGlCQUFpQixTQUFTO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixlQUFlO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLHdCQUF3QixRQUFRO0FBQ2hDO0FBQ0EscUJBQXFCLGVBQWU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHFCQUFxQixTQUFTO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsa0JBQWtCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxtQkFBbUIsY0FBYztBQUNqQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdURBQXVELE9BQU87QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVEQUF1RCxPQUFPO0FBQzlEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQjtBQUNsQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFCQUFxQixRQUFRO0FBQzdCO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxlQUFlLFNBQVM7QUFDeEI7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUIsU0FBUztBQUM1QjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxpQkFBaUI7QUFDaEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBaUIsWUFBWTtBQUM3Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCLGdCQUFnQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixnQkFBZ0I7QUFDakM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDNXZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs4Q0NKQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OzhDQ3hGQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLE9BQU87QUFDcEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxjQUFjO0FBQzNCLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sT0FBTztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLE9BQU87QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsYUFBYTtBQUNuQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsZUFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLElBQUk7QUFDakIsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLElBQUk7QUFDakIsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsSUFBSTtBQUNqQixlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7OztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsY0FBYyw0REFBNEQ7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBEQUEwRCxrQkFBa0I7QUFDNUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBOztBQUVBO0FBQ0Esd0RBQXdELG9CQUFvQjtBQUM1RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsY0FBYztBQUN6QixXQUFXLE9BQU87QUFDbEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJEQUEyRCxLQUFLO0FBQ2hFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1FQUFtRSxLQUFLO0FBQ3hFOztBQUVBO0FBQ0EsbURBQW1ELEtBQUs7QUFDeEQ7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYTtBQUNiLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2IsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7QUNoT0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OzhDQ1pBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzVCQTs7QUFFQTtBQUNBLE9BQU8sWUFBWTs7QUFFbkI7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEIsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLGNBQWM7QUFDM0IsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTs7QUFFQSxvQ0FBb0MsMENBQTBDO0FBQzlFO0FBQ0E7QUFDQTs7QUFFQSwyQ0FBMkMsK0JBQStCOztBQUUxRTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBLHVDQUF1Qzs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOzs7Ozs7O0FDckpBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDOzs7Ozs7OztBQ3BCQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDLFNBQVM7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsU0FBUztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMENBQTBDLFVBQVU7QUFDcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsV0FBVzs7QUFFbkI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxXQUFXOztBQUVuQjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxXQUFXOztBQUVuQjtBQUNBO0FBQ0EsUUFBUSxVQUFVOztBQUVsQjtBQUNBOzs7Ozs7O0FDbkZBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBOzs7Ozs7O0FDSkE7QUFDQTs7QUFFQTs7Ozs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCLHFCQUFxQjtBQUN0Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEMsd0NBQXdDLG1CQUFtQjtBQUMzRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsbUJBQW1CLDBDQUEwQztBQUM3RDtBQUNBLG1DQUFtQyxRQUFROztBQUUzQztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEM7QUFDQTs7QUFFQSxvQ0FBb0Msa0JBQWtCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsK0NBQStDO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUMzRkE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzdEQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7OztBQzUvQkQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7Ozs7Ozs7QUN6QkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7Ozs7Ozs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsT0FBTztBQUNsQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGNBQWM7QUFDekIsV0FBVyxPQUFPO0FBQ2xCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLGNBQWM7QUFDekIsYUFBYSxPQUFPO0FBQ3BCLGFBQWEsT0FBTztBQUNwQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsY0FBYztBQUN6QixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEI7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdklBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJOztBQUVMO0FBQ0E7QUFDQTtBQUNBLENBQUMsSUFBSTs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNuQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQkFBaUIscUJBQXFCO0FBQ3RDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbUJBQW1CLG1CQUFtQjtBQUN0Qyx3Q0FBd0MsbUJBQW1CO0FBQzNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxtQkFBbUIsMENBQTBDO0FBQzdEO0FBQ0EsbUNBQW1DLFFBQVE7O0FBRTNDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEM7QUFDQTs7QUFFQSxvQ0FBb0Msa0JBQWtCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxtQkFBbUIsK0NBQStDO0FBQ2xFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs4Q0N4RkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQzlEQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDWEE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0NBQWdDLHNDQUFzQywwQkFBMEIsZUFBZTtBQUMvRzs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVyxhQUFhO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxXQUFXLFlBQVksbUJBQW1CO0FBQzFGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFdBQVcsWUFBWSxtQkFBbUI7QUFDMUY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUJBQXFCLE1BQU07QUFDM0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwiZmlsZSI6Im1lcmtsaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibWVya2xpbmdcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiTWVya2xpbmdcIl0gPSBmYWN0b3J5KCk7XG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDcpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDI2ZTA2M2YyMWEzMDg0MmFlZWZlIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogRHVlIHRvIHZhcmlvdXMgYnJvd3NlciBidWdzLCBzb21ldGltZXMgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiB3aWxsIGJlIHVzZWQgZXZlblxuICogd2hlbiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0eXBlZCBhcnJheXMuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAgIC0gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLFxuICogICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG5cbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5XG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCBiZWhhdmVzIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVCAhPT0gdW5kZWZpbmVkXG4gID8gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgOiB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbi8qXG4gKiBFeHBvcnQga01heExlbmd0aCBhZnRlciB0eXBlZCBhcnJheSBzdXBwb3J0IGlzIGRldGVybWluZWQuXG4gKi9cbmV4cG9ydHMua01heExlbmd0aCA9IGtNYXhMZW5ndGgoKVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgYXJyLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGtNYXhMZW5ndGggKCkge1xuICByZXR1cm4gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgaWYgKGtNYXhMZW5ndGgoKSA8IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgaWYgKHRoYXQgPT09IG51bGwpIHtcbiAgICAgIHRoYXQgPSBuZXcgQnVmZmVyKGxlbmd0aClcbiAgICB9XG4gICAgdGhhdC5sZW5ndGggPSBsZW5ndGhcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKHRoaXMsIGFyZylcbiAgfVxuICByZXR1cm4gZnJvbSh0aGlzLCBhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbi8vIFRPRE86IExlZ2FjeSwgbm90IG5lZWRlZCBhbnltb3JlLiBSZW1vdmUgaW4gbmV4dCBtYWpvciB2ZXJzaW9uLlxuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIGZyb20gKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhhdCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh0aGF0LCB2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbShudWxsLCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG5pZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuICBCdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICAgIC8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBuZWdhdGl2ZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHRoYXQsIHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcih0aGF0LCBzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKG51bGwsIHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAodGhhdCwgc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHRoYXQgPSBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7ICsraSkge1xuICAgICAgdGhhdFtpXSA9IDBcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShudWxsLCBzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZW5jb2RpbmdcIiBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nIGVuY29kaW5nJylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgdGhhdCA9IHRoYXQuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBhcnJheS5ieXRlTGVuZ3RoIC8vIHRoaXMgdGhyb3dzIGlmIGBhcnJheWAgaXMgbm90IGEgdmFsaWQgQXJyYXlCdWZmZXJcblxuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IGFycmF5XG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQgPSBmcm9tQXJyYXlMaWtlKHRoYXQsIGFycmF5KVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKHRoYXQsIG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIGxlbilcblxuICAgIGlmICh0aGF0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoYXRcbiAgICB9XG5cbiAgICBvYmouY29weSh0aGF0LCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIHRoYXRcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgb2JqLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgaXNuYW4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcih0aGF0LCAwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwga01heExlbmd0aCgpYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGUgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCBhbmQgYGlzLWJ1ZmZlcmAgKGluIFNhZmFyaSA1LTcpIHRvIGRldGVjdFxuLy8gQnVmZmVyIGluc3RhbmNlcy5cbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGggfCAwXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKGlzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiZcbiAgICAgICAgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpICsgMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZlxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gICAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyArK2kpIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7ICsraSkge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogdXRmOFRvQnl0ZXMobmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGVuY29kZTogcmVxdWlyZSgnLi9lbmNvZGUuanMnKVxuICAsIGRlY29kZTogcmVxdWlyZSgnLi9kZWNvZGUuanMnKVxuICAsIGVuY29kaW5nTGVuZ3RoOiByZXF1aXJlKCcuL2xlbmd0aC5qcycpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92YXJpbnQvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbi8vIHNwZWMgYW5kIHRhYmxlIGF0OiBodHRwczovL2dpdGh1Yi5jb20vbXVsdGlmb3JtYXRzL211bHRpY29kZWNcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzXG5cbi8vIE1pc2NlbGxhbmVvdXNcbmV4cG9ydHNbJ3JhdyddID0gQnVmZmVyLmZyb20oJzU1JywgJ2hleCcpXG5cbi8vIGJhc2VzIGVuY29kaW5nc1xuZXhwb3J0c1snYmFzZTEnXSA9IEJ1ZmZlci5mcm9tKCcwMScsICdoZXgnKVxuZXhwb3J0c1snYmFzZTgnXSA9IEJ1ZmZlci5mcm9tKCcwNycsICdoZXgnKVxuZXhwb3J0c1snYmFzZTEwJ10gPSBCdWZmZXIuZnJvbSgnMDknLCAnaGV4JylcblxuLy8gU2VyaWFsaXphdGlvbiBmb3JtYXRzXG5leHBvcnRzWydwcm90b2J1ZiddID0gQnVmZmVyLmZyb20oJzUwJywgJ2hleCcpXG5leHBvcnRzWydjYm9yJ10gPSBCdWZmZXIuZnJvbSgnNTEnLCAnaGV4JylcbmV4cG9ydHNbJ3JscCddID0gQnVmZmVyLmZyb20oJzYwJywgJ2hleCcpXG5leHBvcnRzWydiZW5jb2RlJ10gPSBCdWZmZXIuZnJvbSgnNjMnLCAnaGV4JylcblxuLy8gTXVsdGlmb3JtYXRzXG5leHBvcnRzWydtdWx0aWNvZGVjJ10gPSBCdWZmZXIuZnJvbSgnMzAnLCAnaGV4JylcbmV4cG9ydHNbJ211bHRpaGFzaCddID0gQnVmZmVyLmZyb20oJzMxJywgJ2hleCcpXG5leHBvcnRzWydtdWx0aWFkZHInXSA9IEJ1ZmZlci5mcm9tKCczMicsICdoZXgnKVxuZXhwb3J0c1snbXVsdGliYXNlJ10gPSBCdWZmZXIuZnJvbSgnMzMnLCAnaGV4JylcblxuLy8gbXVsdGloYXNoZXNcbmV4cG9ydHNbJ3NoYTEnXSA9IEJ1ZmZlci5mcm9tKCcxMScsICdoZXgnKVxuZXhwb3J0c1snc2hhMi0yNTYnXSA9IEJ1ZmZlci5mcm9tKCcxMicsICdoZXgnKVxuZXhwb3J0c1snc2hhMi01MTInXSA9IEJ1ZmZlci5mcm9tKCcxMycsICdoZXgnKVxuZXhwb3J0c1snc2hhMy0yMjQnXSA9IEJ1ZmZlci5mcm9tKCcxNycsICdoZXgnKVxuZXhwb3J0c1snc2hhMy0yNTYnXSA9IEJ1ZmZlci5mcm9tKCcxNicsICdoZXgnKVxuZXhwb3J0c1snc2hhMy0zODQnXSA9IEJ1ZmZlci5mcm9tKCcxNScsICdoZXgnKVxuZXhwb3J0c1snc2hhMy01MTInXSA9IEJ1ZmZlci5mcm9tKCcxNCcsICdoZXgnKVxuZXhwb3J0c1snc2hha2UtMTI4J10gPSBCdWZmZXIuZnJvbSgnMTgnLCAnaGV4JylcbmV4cG9ydHNbJ3NoYWtlLTI1NiddID0gQnVmZmVyLmZyb20oJzE5JywgJ2hleCcpXG5leHBvcnRzWydrZWNjYWstMjI0J10gPSBCdWZmZXIuZnJvbSgnMWEnLCAnaGV4JylcbmV4cG9ydHNbJ2tlY2Nhay0yNTYnXSA9IEJ1ZmZlci5mcm9tKCcxYicsICdoZXgnKVxuZXhwb3J0c1sna2VjY2FrLTM4NCddID0gQnVmZmVyLmZyb20oJzFjJywgJ2hleCcpXG5leHBvcnRzWydrZWNjYWstNTEyJ10gPSBCdWZmZXIuZnJvbSgnMWQnLCAnaGV4JylcbmV4cG9ydHNbJ2JsYWtlMmInXSA9IEJ1ZmZlci5mcm9tKCc0MCcsICdoZXgnKVxuZXhwb3J0c1snYmxha2UycyddID0gQnVmZmVyLmZyb20oJzQxJywgJ2hleCcpXG5cbi8vIG11bHRpYWRkcnNcbmV4cG9ydHNbJ2lwNCddID0gQnVmZmVyLmZyb20oJzA0JywgJ2hleCcpXG5leHBvcnRzWydpcDYnXSA9IEJ1ZmZlci5mcm9tKCcyOScsICdoZXgnKVxuZXhwb3J0c1sndGNwJ10gPSBCdWZmZXIuZnJvbSgnMDYnLCAnaGV4JylcbmV4cG9ydHNbJ3VkcCddID0gQnVmZmVyLmZyb20oJzAxMTEnLCAnaGV4JylcbmV4cG9ydHNbJ2RjY3AnXSA9IEJ1ZmZlci5mcm9tKCcyMScsICdoZXgnKVxuZXhwb3J0c1snc2N0cCddID0gQnVmZmVyLmZyb20oJzg0JywgJ2hleCcpXG5leHBvcnRzWyd1ZHQnXSA9IEJ1ZmZlci5mcm9tKCcwMTJkJywgJ2hleCcpXG5leHBvcnRzWyd1dHAnXSA9IEJ1ZmZlci5mcm9tKCcwMTJlJywgJ2hleCcpXG5leHBvcnRzWydpcGZzJ10gPSBCdWZmZXIuZnJvbSgnMmEnLCAnaGV4JylcbmV4cG9ydHNbJ2h0dHAnXSA9IEJ1ZmZlci5mcm9tKCcwMWUwJywgJ2hleCcpXG5leHBvcnRzWydodHRwcyddID0gQnVmZmVyLmZyb20oJzAxYmInLCAnaGV4JylcbmV4cG9ydHNbJ3dzJ10gPSBCdWZmZXIuZnJvbSgnMDFkZCcsICdoZXgnKVxuZXhwb3J0c1snb25pb24nXSA9IEJ1ZmZlci5mcm9tKCcwMWJjJywgJ2hleCcpXG5cbi8vIGFyY2hpdmluZyBmb3JtYXRzXG5cbi8vIGltYWdlIGZvcm1hdHNcblxuLy8gdmlkZW8gZm9ybWF0c1xuXG4vLyBWQ1MgZm9ybWF0c1xuZXhwb3J0c1snZ2l0LXJhdyddID0gQnVmZmVyLmZyb20oJzc4JywgJ2hleCcpXG5cbi8vIElQTEQgZm9ybWF0c1xuZXhwb3J0c1snZGFnLXBiJ10gPSBCdWZmZXIuZnJvbSgnNzAnLCAnaGV4JylcbmV4cG9ydHNbJ2RhZy1jYm9yJ10gPSBCdWZmZXIuZnJvbSgnNzEnLCAnaGV4JylcblxuZXhwb3J0c1snZXRoLWJsb2NrJ10gPSBCdWZmZXIuZnJvbSgnOTAnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC1ibG9jay1saXN0J10gPSBCdWZmZXIuZnJvbSgnOTEnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC10eC10cmllJ10gPSBCdWZmZXIuZnJvbSgnOTInLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC10eCddID0gQnVmZmVyLmZyb20oJzkzJywgJ2hleCcpXG5leHBvcnRzWydldGgtdHgtcmVjZWlwdC10cmllJ10gPSBCdWZmZXIuZnJvbSgnOTQnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC10eC1yZWNlaXB0J10gPSBCdWZmZXIuZnJvbSgnOTUnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC1zdGF0ZS10cmllJ10gPSBCdWZmZXIuZnJvbSgnOTYnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC1hY2NvdW50LXNuYXBzaG90J10gPSBCdWZmZXIuZnJvbSgnOTcnLCAnaGV4JylcbmV4cG9ydHNbJ2V0aC1zdG9yYWdlLXRyaWUnXSA9IEJ1ZmZlci5mcm9tKCc5OCcsICdoZXgnKVxuXG5leHBvcnRzWydiaXRjb2luLWJsb2NrJ10gPSBCdWZmZXIuZnJvbSgnYjAnLCAnaGV4JylcbmV4cG9ydHNbJ2JpdGNvaW4tdHgnXSA9IEJ1ZmZlci5mcm9tKCdiMScsICdoZXgnKVxuXG5leHBvcnRzWydzdGVsbGFyLWJsb2NrJ10gPSBCdWZmZXIuZnJvbSgnZDAnLCAnaGV4JylcbmV4cG9ydHNbJ3N0ZWxsYXItdHgnXSA9IEJ1ZmZlci5mcm9tKCdkMScsICdoZXgnKVxuXG5leHBvcnRzWyd0b3JyZW50LWluZm8nXSA9IEJ1ZmZlci5mcm9tKCc3YicsICdoZXgnKVxuZXhwb3J0c1sndG9ycmVudC1maWxlJ10gPSBCdWZmZXIuZnJvbSgnN2MnLCAnaGV4JylcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL2Jhc2UtdGFibGUuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IG1oID0gcmVxdWlyZSgnbXVsdGloYXNoZXMnKVxuY29uc3QgbXVsdGliYXNlID0gcmVxdWlyZSgnbXVsdGliYXNlJylcbmNvbnN0IG11bHRpY29kZWMgPSByZXF1aXJlKCdtdWx0aWNvZGVjJylcbmNvbnN0IGNvZGVjcyA9IHJlcXVpcmUoJ211bHRpY29kZWMvc3JjL2Jhc2UtdGFibGUnKVxuY29uc3QgY29kZWNWYXJpbnRzID0gcmVxdWlyZSgnbXVsdGljb2RlYy9zcmMvdmFyaW50LXRhYmxlJylcbmNvbnN0IG11bHRpaGFzaCA9IHJlcXVpcmUoJ211bHRpaGFzaGVzJylcblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBTZXJpYWxpemVkQ0lEXG4gKiBAcGFyYW0ge3N0cmluZ30gY29kZWNcbiAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJzaW9uXG4gKiBAcGFyYW0ge0J1ZmZlcn0gbXVsdGloYXNoXG4gKlxuICovXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgQ0lEIGA8bWJhc2U+PHZlcnNpb24+PG1jb2RlYz48bWhhc2g+YFxuICogLCBhcyBkZWZpbmVkIGluIFtpcGxkL2NpZF0oaHR0cHM6Ly9naXRodWIuY29tL2lwbGQvY2lkKS5cbiAqIEBjbGFzcyBDSURcbiAqL1xuY2xhc3MgQ0lEIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBDSUQuXG4gICAqXG4gICAqIFRoZSBhbGdvcml0aG0gZm9yIGFyZ3VtZW50IGlucHV0IGlzIHJvdWdobHk6XG4gICAqIGBgYFxuICAgKiBpZiAoc3RyKVxuICAgKiAgIGlmICgxc3QgY2hhciBpcyBvbiBtdWx0aWJhc2UgdGFibGUpIC0+IENJRCBTdHJpbmdcbiAgICogICBlbHNlIC0+IGJzNTggZW5jb2RlZCBtdWx0aWhhc2hcbiAgICogZWxzZSBpZiAoQnVmZmVyKVxuICAgKiAgIGlmICgwIG9yIDEpIC0+IENJRFxuICAgKiAgIGVsc2UgLT4gbXVsdGloYXNoXG4gICAqIGVsc2UgaWYgKE51bWJlcilcbiAgICogICAtPiBjb25zdHJ1Y3QgQ0lEIGJ5IHBhcnRzXG4gICAqXG4gICAqIC4uaWYgb25seSBKUyBoYWQgdHJhaXRzLi5cbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfEJ1ZmZlcn0gdmVyc2lvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVjXVxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gW211bHRpaGFzaF1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogbmV3IENJRCg8dmVyc2lvbj4sIDxjb2RlYz4sIDxtdWx0aWhhc2g+KVxuICAgKiBuZXcgQ0lEKDxjaWRTdHI+KVxuICAgKiBuZXcgQ0lEKDxjaWQuYnVmZmVyPilcbiAgICogbmV3IENJRCg8bXVsdGloYXNoPilcbiAgICogbmV3IENJRCg8YnM1OCBlbmNvZGVkIG11bHRpaGFzaD4pXG4gICAqIG5ldyBDSUQoPGNpZD4pXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3RvciAodmVyc2lvbiwgY29kZWMsIG11bHRpaGFzaCkge1xuICAgIGlmIChDSUQuaXNDSUQodmVyc2lvbikpIHtcbiAgICAgIGxldCBjaWQgPSB2ZXJzaW9uXG4gICAgICB0aGlzLnZlcnNpb24gPSBjaWQudmVyc2lvblxuICAgICAgdGhpcy5jb2RlYyA9IGNpZC5jb2RlY1xuICAgICAgdGhpcy5tdWx0aWhhc2ggPSBCdWZmZXIuZnJvbShjaWQubXVsdGloYXNoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChtdWx0aWJhc2UuaXNFbmNvZGVkKHZlcnNpb24pKSB7IC8vIENJRCBTdHJpbmcgKGVuY29kZWQgd2l0aCBtdWx0aWJhc2UpXG4gICAgICAgIGNvbnN0IGNpZCA9IG11bHRpYmFzZS5kZWNvZGUodmVyc2lvbilcbiAgICAgICAgdmVyc2lvbiA9IHBhcnNlSW50KGNpZC5zbGljZSgwLCAxKS50b1N0cmluZygnaGV4JyksIDE2KVxuICAgICAgICBjb2RlYyA9IG11bHRpY29kZWMuZ2V0Q29kZWMoY2lkLnNsaWNlKDEpKVxuICAgICAgICBtdWx0aWhhc2ggPSBtdWx0aWNvZGVjLnJtUHJlZml4KGNpZC5zbGljZSgxKSlcbiAgICAgIH0gZWxzZSB7IC8vIGJzNTggc3RyaW5nIGVuY29kZWQgbXVsdGloYXNoXG4gICAgICAgIGNvZGVjID0gJ2RhZy1wYidcbiAgICAgICAgbXVsdGloYXNoID0gbWguZnJvbUI1OFN0cmluZyh2ZXJzaW9uKVxuICAgICAgICB2ZXJzaW9uID0gMFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoQnVmZmVyLmlzQnVmZmVyKHZlcnNpb24pKSB7XG4gICAgICBjb25zdCBmaXJzdEJ5dGUgPSB2ZXJzaW9uLnNsaWNlKDAsIDEpXG4gICAgICBjb25zdCB2ID0gcGFyc2VJbnQoZmlyc3RCeXRlLnRvU3RyaW5nKCdoZXgnKSwgMTYpXG4gICAgICBpZiAodiA9PT0gMCB8fCB2ID09PSAxKSB7IC8vIENJRFxuICAgICAgICBjb25zdCBjaWQgPSB2ZXJzaW9uXG4gICAgICAgIHZlcnNpb24gPSB2XG4gICAgICAgIGNvZGVjID0gbXVsdGljb2RlYy5nZXRDb2RlYyhjaWQuc2xpY2UoMSkpXG4gICAgICAgIG11bHRpaGFzaCA9IG11bHRpY29kZWMucm1QcmVmaXgoY2lkLnNsaWNlKDEpKVxuICAgICAgfSBlbHNlIHsgLy8gbXVsdGloYXNoXG4gICAgICAgIGNvZGVjID0gJ2RhZy1wYidcbiAgICAgICAgbXVsdGloYXNoID0gdmVyc2lvblxuICAgICAgICB2ZXJzaW9uID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5jb2RlYyA9IGNvZGVjXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5tdWx0aWhhc2ggPSBtdWx0aWhhc2hcblxuICAgIENJRC52YWxpZGF0ZUNJRCh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBDSUQgYXMgYSBgQnVmZmVyYFxuICAgKlxuICAgKiBAcmV0dXJuIHtCdWZmZXJ9XG4gICAqIEByZWFkb25seVxuICAgKlxuICAgKiBAbWVtYmVyT2YgQ0lEXG4gICAqL1xuICBnZXQgYnVmZmVyICgpIHtcbiAgICBzd2l0Y2ggKHRoaXMudmVyc2lvbikge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5tdWx0aWhhc2hcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW1xuICAgICAgICAgIEJ1ZmZlci5mcm9tKCcwMScsICdoZXgnKSxcbiAgICAgICAgICBCdWZmZXIuZnJvbShjb2RlY1ZhcmludHNbdGhpcy5jb2RlY10pLFxuICAgICAgICAgIHRoaXMubXVsdGloYXNoXG4gICAgICAgIF0pXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIHZlcnNpb24nKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHByZWZpeCBvZiB0aGUgQ0lELlxuICAgKlxuICAgKiBAcmV0dXJucyB7QnVmZmVyfVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBwcmVmaXggKCkge1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtcbiAgICAgIEJ1ZmZlci5mcm9tKGAwJHt0aGlzLnZlcnNpb259YCwgJ2hleCcpLFxuICAgICAgY29kZWNWYXJpbnRzW3RoaXMuY29kZWNdLFxuICAgICAgbXVsdGloYXNoLnByZWZpeCh0aGlzLm11bHRpaGFzaClcbiAgICBdKVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdG8gYSBDSUQgb2YgdmVyc2lvbiBgMGAuXG4gICAqXG4gICAqIEByZXR1cm5zIHtDSUR9XG4gICAqL1xuICB0b1YwICgpIHtcbiAgICBpZiAodGhpcy5jb2RlYyAhPT0gJ2RhZy1wYicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNvbnZlcnQgYSBub24gZGFnLXBiIENJRCB0byBDSUR2MCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBDSUQoMCwgdGhpcy5jb2RlYywgdGhpcy5tdWx0aWhhc2gpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0byBhIENJRCBvZiB2ZXJzaW9uIGAxYC5cbiAgICpcbiAgICogQHJldHVybnMge0NJRH1cbiAgICovXG4gIHRvVjEgKCkge1xuICAgIHJldHVybiBuZXcgQ0lEKDEsIHRoaXMuY29kZWMsIHRoaXMubXVsdGloYXNoKVxuICB9XG5cbiAgLyoqXG4gICAqIEVuY29kZSB0aGUgQ0lEIGludG8gYSBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFzZT0nYmFzZTU4YnRjJ10gLSBCYXNlIGVuY29kaW5nIHRvIHVzZS5cbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvQmFzZUVuY29kZWRTdHJpbmcgKGJhc2UpIHtcbiAgICBiYXNlID0gYmFzZSB8fCAnYmFzZTU4YnRjJ1xuXG4gICAgc3dpdGNoICh0aGlzLnZlcnNpb24pIHtcbiAgICAgIGNhc2UgMDoge1xuICAgICAgICBpZiAoYmFzZSAhPT0gJ2Jhc2U1OGJ0YycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBzdXBwb3J0ZWQgd2l0aCBDSUR2MCwgdG8gc3VwcG9ydCBkaWZmZXJlbnQgYmFzZXMsIHBsZWFzZSBtaWdyYXRlIHRoZSBpbnN0YW5jZSBkbyBDSUR2MSwgeW91IGNhbiBkbyB0aGF0IHRocm91Z2ggY2lkLnRvVjEoKScpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1oLnRvQjU4U3RyaW5nKHRoaXMubXVsdGloYXNoKVxuICAgICAgfVxuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gbXVsdGliYXNlLmVuY29kZShiYXNlLCB0aGlzLmJ1ZmZlcikudG9TdHJpbmcoKVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCB2ZXJzaW9uJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRvIGEgcGxhaW4gb2JqZWN0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7U2VyaWFsaXplZENJRH1cbiAgICovXG4gIHRvSlNPTiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGVjOiB0aGlzLmNvZGVjLFxuICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLFxuICAgICAgaGFzaDogdGhpcy5tdWx0aWhhc2hcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZSBlcXVhbGl0eSB3aXRoIGFub3RoZXIgQ0lELlxuICAgKlxuICAgKiBAcGFyYW0ge0NJRH0gb3RoZXJcbiAgICogQHJldHVybnMge2Jvb2x9XG4gICAqL1xuICBlcXVhbHMgKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29kZWMgPT09IG90aGVyLmNvZGVjICYmXG4gICAgICB0aGlzLnZlcnNpb24gPT09IG90aGVyLnZlcnNpb24gJiZcbiAgICAgIHRoaXMubXVsdGloYXNoLmVxdWFscyhvdGhlci5tdWx0aWhhc2gpXG4gIH1cblxuICAvKipcbiAgICogVGVzdCBpZiB0aGUgZ2l2ZW4gaW5wdXQgaXMgYSBDSUQuXG4gICAqXG4gICAqIEBwYXJhbSB7YW55fSBvdGhlclxuICAgKiBAcmV0dXJucyB7Ym9vbH1cbiAgICovXG4gIHN0YXRpYyBpc0NJRCAob3RoZXIpIHtcbiAgICB0cnkge1xuICAgICAgQ0lELnZhbGlkYXRlQ0lEKG90aGVyKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoZSBnaXZlbiBpbnB1dCBpcyBhIHZhbGlkIENJRCBvYmplY3QuXG4gICAqIFRocm93cyBpZiBpdCBpcyBub3QuXG4gICAqXG4gICAqIEBwYXJhbSB7YW55fSBvdGhlclxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUNJRCAob3RoZXIpIHtcbiAgICBpZiAob3RoZXIgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdudWxsIHZhbHVlcyBhcmUgbm90IHZhbGlkIENJRHMnKVxuICAgIH1cblxuICAgIGlmICghKG90aGVyLnZlcnNpb24gPT09IDAgfHwgb3RoZXIudmVyc2lvbiA9PT0gMSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJzaW9uLCBtdXN0IGJlIGEgbnVtYmVyIGVxdWFsIHRvIDEgb3IgMCcpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvdGhlci5jb2RlYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29kZWMgbXVzdCBiZSBzdHJpbmcnKVxuICAgIH1cblxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKG90aGVyLm11bHRpaGFzaCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbXVsdGloYXNoIG11c3QgYmUgYSBCdWZmZXInKVxuICAgIH1cblxuICAgIG1oLnZhbGlkYXRlKG90aGVyLm11bHRpaGFzaClcbiAgfVxufVxuXG5DSUQuY29kZWNzID0gY29kZWNzXG5cbm1vZHVsZS5leHBvcnRzID0gQ0lEXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jaWRzL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIE11bHRpaGFzaCBpbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0LlxuICpcbiAqIEBtb2R1bGUgbXVsdGloYXNoXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBiczU4ID0gcmVxdWlyZSgnYnM1OCcpXG5cbmNvbnN0IGNzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5leHBvcnRzLm5hbWVzID0gY3MubmFtZXNcbmV4cG9ydHMuY29kZXMgPSBjcy5jb2Rlc1xuZXhwb3J0cy5kZWZhdWx0TGVuZ3RocyA9IGNzLmRlZmF1bHRMZW5ndGhzXG5cbmNvbnN0IHZhcmludCA9IHJlcXVpcmUoJ3ZhcmludCcpXG5cbi8qKlxuICogQ29udmVydCB0aGUgZ2l2ZW4gbXVsdGloYXNoIHRvIGEgaGV4IGVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBoYXNoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnRzLnRvSGV4U3RyaW5nID0gZnVuY3Rpb24gdG9IZXhTdHJpbmcgKGhhc2gpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoaGFzaCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3QgYmUgcGFzc2VkIGEgYnVmZmVyJylcbiAgfVxuXG4gIHJldHVybiBoYXNoLnRvU3RyaW5nKCdoZXgnKVxufVxuXG4vKipcbiAqIENvbnZlcnQgdGhlIGdpdmVuIGhleCBlbmNvZGVkIHN0cmluZyB0byBhIG11bHRpaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaFxuICogQHJldHVybnMge0J1ZmZlcn1cbiAqL1xuZXhwb3J0cy5mcm9tSGV4U3RyaW5nID0gZnVuY3Rpb24gZnJvbUhleFN0cmluZyAoaGFzaCkge1xuICByZXR1cm4gQnVmZmVyLmZyb20oaGFzaCwgJ2hleCcpXG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgZ2l2ZW4gbXVsdGloYXNoIHRvIGEgYmFzZTU4IGVuY29kZWQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBoYXNoXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnRzLnRvQjU4U3RyaW5nID0gZnVuY3Rpb24gdG9CNThTdHJpbmcgKGhhc2gpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoaGFzaCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3QgYmUgcGFzc2VkIGEgYnVmZmVyJylcbiAgfVxuXG4gIHJldHVybiBiczU4LmVuY29kZShoYXNoKVxufVxuXG4vKipcbiAqIENvbnZlcnQgdGhlIGdpdmVuIGJhc2U1OCBlbmNvZGVkIHN0cmluZyB0byBhIG11bHRpaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xCdWZmZXJ9IGhhc2hcbiAqIEByZXR1cm5zIHtCdWZmZXJ9XG4gKi9cbmV4cG9ydHMuZnJvbUI1OFN0cmluZyA9IGZ1bmN0aW9uIGZyb21CNThTdHJpbmcgKGhhc2gpIHtcbiAgbGV0IGVuY29kZWQgPSBoYXNoXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoaGFzaCkpIHtcbiAgICBlbmNvZGVkID0gaGFzaC50b1N0cmluZygpXG4gIH1cblxuICByZXR1cm4gQnVmZmVyLmZyb20oYnM1OC5kZWNvZGUoZW5jb2RlZCkpXG59XG5cbi8qKlxuICogRGVjb2RlIGEgaGFzaCBmcm9tIHRoZSBnaXZlbiBtdWx0aWhhc2guXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZlxuICogQHJldHVybnMge3tjb2RlOiBudW1iZXIsIG5hbWU6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIsIGRpZ2VzdDogQnVmZmVyfX0gcmVzdWx0XG4gKi9cbmV4cG9ydHMuZGVjb2RlID0gZnVuY3Rpb24gZGVjb2RlIChidWYpIHtcbiAgaWYgKCEoQnVmZmVyLmlzQnVmZmVyKGJ1ZikpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aWhhc2ggbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoYnVmLmxlbmd0aCA8IDMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpaGFzaCB0b28gc2hvcnQuIG11c3QgYmUgPiAzIGJ5dGVzLicpXG4gIH1cblxuICBsZXQgY29kZSA9IHZhcmludC5kZWNvZGUoYnVmKVxuICBpZiAoIWV4cG9ydHMuaXNWYWxpZENvZGUoY29kZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYG11bHRpaGFzaCB1bmtub3duIGZ1bmN0aW9uIGNvZGU6IDB4JHtjb2RlLnRvU3RyaW5nKDE2KX1gKVxuICB9XG4gIGJ1ZiA9IGJ1Zi5zbGljZSh2YXJpbnQuZGVjb2RlLmJ5dGVzKVxuXG4gIGxldCBsZW4gPSB2YXJpbnQuZGVjb2RlKGJ1ZilcbiAgaWYgKGxlbiA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYG11bHRpaGFzaCBpbnZhbGlkIGxlbmd0aDogMHgke2xlbi50b1N0cmluZygxNil9YClcbiAgfVxuICBidWYgPSBidWYuc2xpY2UodmFyaW50LmRlY29kZS5ieXRlcylcblxuICBpZiAoYnVmLmxlbmd0aCAhPT0gbGVuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBtdWx0aWhhc2ggbGVuZ3RoIGluY29uc2lzdGVudDogMHgke2J1Zi50b1N0cmluZygnaGV4Jyl9YClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZTogY29kZSxcbiAgICBuYW1lOiBjcy5jb2Rlc1tjb2RlXSxcbiAgICBsZW5ndGg6IGxlbixcbiAgICBkaWdlc3Q6IGJ1ZlxuICB9XG59XG5cbi8qKlxuICogIEVuY29kZSBhIGhhc2ggZGlnZXN0IGFsb25nIHdpdGggdGhlIHNwZWNpZmllZCBmdW5jdGlvbiBjb2RlLlxuICpcbiAqID4gKipOb3RlOioqIHRoZSBsZW5ndGggaXMgZGVyaXZlZCBmcm9tIHRoZSBsZW5ndGggb2YgdGhlIGRpZ2VzdCBpdHNlbGYuXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGRpZ2VzdFxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSBjb2RlXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aF1cbiAqIEByZXR1cm5zIHtCdWZmZXJ9XG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gZW5jb2RlIChkaWdlc3QsIGNvZGUsIGxlbmd0aCkge1xuICBpZiAoIWRpZ2VzdCB8fCAhY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGloYXNoIGVuY29kZSByZXF1aXJlcyBhdCBsZWFzdCB0d28gYXJnczogZGlnZXN0LCBjb2RlJylcbiAgfVxuXG4gIC8vIGVuc3VyZSBpdCdzIGEgaGFzaGZ1bmN0aW9uIGNvZGUuXG4gIGNvbnN0IGhhc2hmbiA9IGV4cG9ydHMuY29lcmNlQ29kZShjb2RlKVxuXG4gIGlmICghKEJ1ZmZlci5pc0J1ZmZlcihkaWdlc3QpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZGlnZXN0IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAobGVuZ3RoID09IG51bGwpIHtcbiAgICBsZW5ndGggPSBkaWdlc3QubGVuZ3RoXG4gIH1cblxuICBpZiAobGVuZ3RoICYmIGRpZ2VzdC5sZW5ndGggIT09IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZGlnZXN0IGxlbmd0aCBzaG91bGQgYmUgZXF1YWwgdG8gc3BlY2lmaWVkIGxlbmd0aC4nKVxuICB9XG5cbiAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW1xuICAgIEJ1ZmZlci5mcm9tKHZhcmludC5lbmNvZGUoaGFzaGZuKSksXG4gICAgQnVmZmVyLmZyb20odmFyaW50LmVuY29kZShsZW5ndGgpKSxcbiAgICBkaWdlc3RcbiAgXSlcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGhhc2ggZnVuY3Rpb24gbmFtZSBpbnRvIHRoZSBtYXRjaGluZyBjb2RlLlxuICogSWYgcGFzc2VkIGEgbnVtYmVyIGl0IHdpbGwgcmV0dXJuIHRoZSBudW1iZXIgaWYgaXQncyBhIHZhbGlkIGNvZGUuXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IG5hbWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmV4cG9ydHMuY29lcmNlQ29kZSA9IGZ1bmN0aW9uIGNvZXJjZUNvZGUgKG5hbWUpIHtcbiAgbGV0IGNvZGUgPSBuYW1lXG5cbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgIGlmICghY3MubmFtZXNbbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGhhc2ggZnVuY3Rpb24gbmFtZWQ6ICR7bmFtZX1gKVxuICAgIH1cbiAgICBjb2RlID0gY3MubmFtZXNbbmFtZV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgY29kZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEhhc2ggZnVuY3Rpb24gY29kZSBzaG91bGQgYmUgYSBudW1iZXIuIEdvdDogJHtjb2RlfWApXG4gIH1cblxuICBpZiAoIWNzLmNvZGVzW2NvZGVdICYmICFleHBvcnRzLmlzQXBwQ29kZShjb2RlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGZ1bmN0aW9uIGNvZGU6ICR7Y29kZX1gKVxuICB9XG5cbiAgcmV0dXJuIGNvZGVcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2V0aGVyIGEgY29kZSBpcyBwYXJ0IG9mIHRoZSBhcHAgcmFuZ2VcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydHMuaXNBcHBDb2RlID0gZnVuY3Rpb24gYXBwQ29kZSAoY29kZSkge1xuICByZXR1cm4gY29kZSA+IDAgJiYgY29kZSA8IDB4MTBcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIG11bHRpaGFzaCBjb2RlIGlzIHZhbGlkLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0cy5pc1ZhbGlkQ29kZSA9IGZ1bmN0aW9uIHZhbGlkQ29kZSAoY29kZSkge1xuICBpZiAoZXhwb3J0cy5pc0FwcENvZGUoY29kZSkpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGNzLmNvZGVzW2NvZGVdKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBidWZmZXIgaXMgYSB2YWxpZCBtdWx0aWhhc2guIFRocm93cyBhbiBlcnJvciBpZiBpdCBpcyBub3QgdmFsaWQuXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IG11bHRpaGFzaFxuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqIEB0aHJvd3Mge0Vycm9yfVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZSAobXVsdGloYXNoKSB7XG4gIGV4cG9ydHMuZGVjb2RlKG11bHRpaGFzaCkgLy8gdGhyb3dzIGlmIGJhZC5cbn1cbmV4cG9ydHMudmFsaWRhdGUgPSB2YWxpZGF0ZVxuXG4vKipcbiAqIFJldHVybnMgYSBwcmVmaXggZnJvbSBhIHZhbGlkIG11bHRpaGFzaC4gVGhyb3dzIGFuIGVycm9yIGlmIGl0IGlzIG5vdCB2YWxpZC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gbXVsdGloYXNoXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICogQHRocm93cyB7RXJyb3J9XG4gKi9cbmV4cG9ydHMucHJlZml4ID0gZnVuY3Rpb24gcHJlZml4IChtdWx0aWhhc2gpIHtcbiAgdmFsaWRhdGUobXVsdGloYXNoKVxuXG4gIHJldHVybiBtdWx0aWhhc2guc2xpY2UoMCwgMilcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL211bHRpaGFzaGVzL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCdcbmNvbnN0IGJhc2VUYWJsZSA9IHJlcXVpcmUoJy4vYmFzZS10YWJsZScpXG5jb25zdCB2YXJpbnRCdWZmZXJFbmNvZGUgPSByZXF1aXJlKCcuL3V0aWwnKS52YXJpbnRCdWZmZXJFbmNvZGVcblxuLy8gdGhpcyBjcmVhdGVzIGEgbWFwIGZvciBjb2RlY05hbWUgLT4gY29kZVZhcmludEJ1ZmZlclxuXG5jb25zdCB2YXJpbnRUYWJsZSA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IHZhcmludFRhYmxlXG5cbmZvciAobGV0IGVuY29kaW5nTmFtZSBpbiBiYXNlVGFibGUpIHtcbiAgbGV0IGNvZGUgPSBiYXNlVGFibGVbZW5jb2RpbmdOYW1lXVxuICB2YXJpbnRUYWJsZVtlbmNvZGluZ05hbWVdID0gdmFyaW50QnVmZmVyRW5jb2RlKGNvZGUpXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tdWx0aWNvZGVjL3NyYy92YXJpbnQtdGFibGUuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCB2YXJpbnQgPSByZXF1aXJlKCd2YXJpbnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbnVtYmVyVG9CdWZmZXIsXG4gIGJ1ZmZlclRvTnVtYmVyLFxuICB2YXJpbnRCdWZmZXJFbmNvZGUsXG4gIHZhcmludEJ1ZmZlckRlY29kZVxufVxuXG5mdW5jdGlvbiBidWZmZXJUb051bWJlciAoYnVmKSB7XG4gIHJldHVybiBwYXJzZUludChidWYudG9TdHJpbmcoJ2hleCcpLCAxNilcbn1cblxuZnVuY3Rpb24gbnVtYmVyVG9CdWZmZXIgKG51bSkge1xuICBsZXQgaGV4U3RyaW5nID0gbnVtLnRvU3RyaW5nKDE2KVxuICBpZiAoaGV4U3RyaW5nLmxlbmd0aCAlIDIgPT09IDEpIHtcbiAgICBoZXhTdHJpbmcgPSAnMCcgKyBoZXhTdHJpbmdcbiAgfVxuICByZXR1cm4gQnVmZmVyLmZyb20oaGV4U3RyaW5nLCAnaGV4Jylcbn1cblxuZnVuY3Rpb24gdmFyaW50QnVmZmVyRW5jb2RlIChpbnB1dCkge1xuICByZXR1cm4gQnVmZmVyLmZyb20odmFyaW50LmVuY29kZShidWZmZXJUb051bWJlcihpbnB1dCkpKVxufVxuXG5mdW5jdGlvbiB2YXJpbnRCdWZmZXJEZWNvZGUgKGlucHV0KSB7XG4gIHJldHVybiBudW1iZXJUb0J1ZmZlcih2YXJpbnQuZGVjb2RlKGlucHV0KSlcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL3V0aWwuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IENJRCA9IHJlcXVpcmUoJ2NpZHMnKVxuY29uc3QgeyBJcGxkUHJveHkgfSA9IHJlcXVpcmUoJy4vaXBsZCcpXG5cbi8qKlxuICogTWVya2xpbmcgZW50cnlwb2ludFxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBzZXR1cCBvcHRpb25zIGZvciB0aGlzIG1lcmtsaW5nIGluc3RhbmNlXG4gKi9cbmNvbnN0IE1lcmtsaW5nID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zLmlwZnMpIHtcbiAgICB0aHJvdyBFcnJvcignSVBGUyBtdXN0IGJlIHBhc3NlZCBhcyBhbiBvcHRpb24gdG8gTWVya2xpbmcnKVxuICB9XG5cbiAgdGhpcy5pcGZzID0gb3B0aW9ucy5pcGZzXG4gIHRoaXMuaXBsZFByb3h5ID0gbmV3IElwbGRQcm94eSgpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBJUExEIG5vZGUgZnJvbSBhIGpzIG9iamVjdC5cbiAgICogVGhlIElQTEQgbm9kZSBtdXN0IGJlIHNhdmVkIGJlZm9yZSBpdCBpcyBwZXJzaXN0ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogYSBqcyBvYmplY3RcbiAgICogQHJldHVybnMge09iamVjdH0gYW4gdW5zYXZlZCBJUExEIG5vZGVcbiAgICovXG4gIHRoaXMuY3JlYXRlID0gKG9iaikgPT4ge1xuICAgIHJldHVybiB0aGlzLmlwbGRQcm94eS5jcmVhdGVEaXJ0eU5vZGUob2JqKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcnNpc3QgYSBqcyBvYmplY3Qgb3IgSVBMRCBub2RlIHRvIHRoZSBJUExEIGdyYXBoXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmogYSBqcyBvYmplY3Qgb3IgSVBMRCBub2RlXG4gICAqL1xuICB0aGlzLnNhdmUgPSAob2JqKSA9PiB7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIHRocm93IEVycm9yKCdBcmd1bWVudCBleGNlcHRpb24sIHRyeWluZyB0byBzYXZlIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgICB9XG5cbiAgICBjb25zdCBvYmpUb1BlcnNpc3QgPSB0aGlzLmlwbGRQcm94eS5pc0lwbGQob2JqKVxuICAgICAgPyBvYmpcbiAgICAgIDogdGhpcy5pcGxkUHJveHkuY3JlYXRlRGlydHlOb2RlKG9iailcblxuICAgIHJldHVybiB0aGlzLl9wZXJzaXN0KG9ialRvUGVyc2lzdClcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBJUExEIGlkLCByZXRyaWV2ZSB0aGUgdmFsdWUgZnJvbSB0aGUgSVBMRCBncmFwaFxuICAgKiBhcyBhIGpzIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGNpZFxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBhbiBJUExEIG5vZGVcbiAgICovXG4gIHRoaXMuZ2V0ID0gKGNpZCkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmlwZnMuZGFnLmdldChjaWQsIChlcnIsIGJsb2NrKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWQgPSBDSUQuaXNDSUQoY2lkKSA/IGNpZCA6IG5ldyBDSUQoY2lkKVxuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3Vic3RpdHV0ZU1lcmtsZUxpbmtQcm94aWVzKGJsb2NrLnZhbHVlKVxuICAgICAgICBjb25zdCBtZXJrbGVQcm94eSA9IHRoaXMuaXBsZFByb3h5LmNyZWF0ZVNhdmVkTm9kZShpZCwgbm9kZSlcblxuICAgICAgICByZXNvbHZlKG1lcmtsZVByb3h5KVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdGhpcy5fcGVyc2lzdCA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLmlwbGRQcm94eS5pc1BlcnNpc3RlZChlbGVtKSkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShlbGVtKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzdWJwZXJzaXN0cyA9IE9iamVjdC5rZXlzKGVsZW0pLm1hcChrZXkgPT4ge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGVsZW1ba2V5XSA9PT0gJ29iamVjdCdcbiAgICAgICAgICA/IHRoaXMuX3BlcnNpc3QoZWxlbVtrZXldKVxuICAgICAgICAgIDogbnVsbFxuICAgICAgfSkuZmlsdGVyKEJvb2xlYW4pXG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChzdWJwZXJzaXN0cykudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhZ05vZGUgPSB0aGlzLl9zdWJzdGl0dXRlTWVya2xlTGlua3MoZWxlbSlcblxuICAgICAgICB0aGlzLmlwZnMuZGFnLnB1dChkYWdOb2RlLCB7IGZvcm1hdDogJ2RhZy1jYm9yJywgaGFzaEFsZzogJ3NoYTItMjU2JyB9LCAoZXJyLCBjaWQpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycilcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmlwbGRQcm94eS50cmFuc2l0aW9uKGVsZW0sIHsgdHJhbnNpdGlvbjogJ3NhdmUnLCBjaWQ6IGNpZCB9KVxuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZWxlbSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHRoaXMuX3N1YnN0aXR1dGVNZXJrbGVMaW5rcyA9IChlbGVtKSA9PiB7XG4gICAgY29uc3QgZGFnTm9kZSA9IHRoaXMuaXBsZFByb3h5LmV4dHJhY3QoZWxlbSlcblxuICAgIE9iamVjdC5rZXlzKGRhZ05vZGUpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICgodHlwZW9mIGRhZ05vZGVba2V5XSAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pcGxkUHJveHkuaXNJcGxkKGRhZ05vZGVba2V5XSkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlwbGRQcm94eS5pc1BlcnNpc3RlZChkYWdOb2RlW2tleV0pKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoJ0F0dGVtcHRpbmcgc3Vic3RpdHV0aW9uIG9uIHVucGVyc2lzdGVkIGlwbGQgbm9kZScpXG4gICAgICAgIH1cblxuICAgICAgICBkYWdOb2RlW2tleV0gPSB0aGlzLl9jb252ZXJ0VG9NZXJrbGVMaW5rT2JqZWN0KGRhZ05vZGVba2V5XSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3N1YnN0aXR1dGVNZXJrbGVMaW5rcyhkYWdOb2RlW2tleV0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBkYWdOb2RlXG4gIH1cblxuICB0aGlzLl9zdWJzdGl0dXRlTWVya2xlTGlua1Byb3hpZXMgPSAob2JqKSA9PiB7XG4gICAgY29uc3QgbWVya2xlTm9kZSA9IE9iamVjdC5hc3NpZ24oe30sIG9iailcblxuICAgIE9iamVjdC5rZXlzKG1lcmtsZU5vZGUpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgbWVya2xlTm9kZVtrZXldID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAodGhpcy5faXNNZXJrbGVMaW5rT2JqZWN0KG1lcmtsZU5vZGVba2V5XSkpIHtcbiAgICAgICAgICBtZXJrbGVOb2RlW2tleV0gPSB0aGlzLl9jb252ZXJ0RnJvbU1lcmtsZUxpbmtPYmplY3QobWVya2xlTm9kZVtrZXldKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3N1YnN0aXR1dGVNZXJrbGVMaW5rUHJveGllcyhtZXJrbGVOb2RlW2tleV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG1lcmtsZU5vZGVcbiAgfVxuXG4gIHRoaXMuX2NvbnZlcnRUb01lcmtsZUxpbmtPYmplY3QgPSAob2JqKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICcvJzogb2JqLl9jaWQudG9CYXNlRW5jb2RlZFN0cmluZygpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5fY29udmVydEZyb21NZXJrbGVMaW5rT2JqZWN0ID0gKGxpbmspID0+IHtcbiAgICByZXR1cm4gdGhpcy5pcGxkUHJveHkuY3JlYXRlTGlua05vZGUobmV3IENJRChsaW5rWycvJ10pKVxuICB9XG5cbiAgdGhpcy5faXNNZXJrbGVMaW5rT2JqZWN0ID0gKG9iaikgPT4ge1xuICAgIHJldHVybiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpICYmIG9iai5oYXNPd25Qcm9wZXJ0eSgnLycpXG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lcmtsaW5nXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tZXJrbGluZy5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gcGxhY2VIb2xkZXJzQ291bnQgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcbiAgLy8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuICAvLyByZXByZXNlbnQgb25lIGJ5dGVcbiAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG4gIC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcbiAgcmV0dXJuIGI2NFtsZW4gLSAyXSA9PT0gJz0nID8gMiA6IGI2NFtsZW4gLSAxXSA9PT0gJz0nID8gMSA6IDBcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuICByZXR1cm4gKGI2NC5sZW5ndGggKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIoKGxlbiAqIDMgLyA0KSAtIHBsYWNlSG9sZGVycylcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gbGVuIC0gNCA6IGxlblxuXG4gIHZhciBMID0gMFxuXG4gIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDQpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIG91dHB1dCA9ICcnXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAyXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9PSdcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgKHVpbnQ4W2xlbiAtIDFdKVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDEwXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz0nXG4gIH1cblxuICBwYXJ0cy5wdXNoKG91dHB1dClcblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciBiYXNleCA9IHJlcXVpcmUoJ2Jhc2UteCcpXG52YXIgQUxQSEFCRVQgPSAnMTIzNDU2Nzg5QUJDREVGR0hKS0xNTlBRUlNUVVZXWFlaYWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5eidcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNleChBTFBIQUJFVClcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2JzNTgvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8vIGJhc2UteCBlbmNvZGluZ1xuLy8gRm9ya2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NyeXB0b2NvaW5qcy9iczU4XG4vLyBPcmlnaW5hbGx5IHdyaXR0ZW4gYnkgTWlrZSBIZWFybiBmb3IgQml0Y29pbkpcbi8vIENvcHlyaWdodCAoYykgMjAxMSBHb29nbGUgSW5jXG4vLyBQb3J0ZWQgdG8gSmF2YVNjcmlwdCBieSBTdGVmYW4gVGhvbWFzXG4vLyBNZXJnZWQgQnVmZmVyIHJlZmFjdG9yaW5ncyBmcm9tIGJhc2U1OC1uYXRpdmUgYnkgU3RlcGhlbiBQYWlyXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTMgQml0UGF5IEluY1xuXG52YXIgQnVmZmVyID0gcmVxdWlyZSgnc2FmZS1idWZmZXInKS5CdWZmZXJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiYXNlIChBTFBIQUJFVCkge1xuICB2YXIgQUxQSEFCRVRfTUFQID0ge31cbiAgdmFyIEJBU0UgPSBBTFBIQUJFVC5sZW5ndGhcbiAgdmFyIExFQURFUiA9IEFMUEhBQkVULmNoYXJBdCgwKVxuXG4gIC8vIHByZS1jb21wdXRlIGxvb2t1cCB0YWJsZVxuICBmb3IgKHZhciB6ID0gMDsgeiA8IEFMUEhBQkVULmxlbmd0aDsgeisrKSB7XG4gICAgdmFyIHggPSBBTFBIQUJFVC5jaGFyQXQoeilcblxuICAgIGlmIChBTFBIQUJFVF9NQVBbeF0gIT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFR5cGVFcnJvcih4ICsgJyBpcyBhbWJpZ3VvdXMnKVxuICAgIEFMUEhBQkVUX01BUFt4XSA9IHpcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuY29kZSAoc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuXG4gICAgdmFyIGRpZ2l0cyA9IFswXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMCwgY2FycnkgPSBzb3VyY2VbaV07IGogPCBkaWdpdHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgY2FycnkgKz0gZGlnaXRzW2pdIDw8IDhcbiAgICAgICAgZGlnaXRzW2pdID0gY2FycnkgJSBCQVNFXG4gICAgICAgIGNhcnJ5ID0gKGNhcnJ5IC8gQkFTRSkgfCAwXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcbiAgICAgICAgZGlnaXRzLnB1c2goY2FycnkgJSBCQVNFKVxuICAgICAgICBjYXJyeSA9IChjYXJyeSAvIEJBU0UpIHwgMFxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdHJpbmcgPSAnJ1xuXG4gICAgLy8gZGVhbCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICBmb3IgKHZhciBrID0gMDsgc291cmNlW2tdID09PSAwICYmIGsgPCBzb3VyY2UubGVuZ3RoIC0gMTsgKytrKSBzdHJpbmcgKz0gQUxQSEFCRVRbMF1cbiAgICAvLyBjb252ZXJ0IGRpZ2l0cyB0byBhIHN0cmluZ1xuICAgIGZvciAodmFyIHEgPSBkaWdpdHMubGVuZ3RoIC0gMTsgcSA+PSAwOyAtLXEpIHN0cmluZyArPSBBTFBIQUJFVFtkaWdpdHNbcV1dXG5cbiAgICByZXR1cm4gc3RyaW5nXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVVbnNhZmUgKHN0cmluZykge1xuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgU3RyaW5nJylcbiAgICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkgcmV0dXJuIEJ1ZmZlci5hbGxvY1Vuc2FmZSgwKVxuXG4gICAgdmFyIGJ5dGVzID0gWzBdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IEFMUEhBQkVUX01BUFtzdHJpbmdbaV1dXG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG5cbiAgICAgIGZvciAodmFyIGogPSAwLCBjYXJyeSA9IHZhbHVlOyBqIDwgYnl0ZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgY2FycnkgKz0gYnl0ZXNbal0gKiBCQVNFXG4gICAgICAgIGJ5dGVzW2pdID0gY2FycnkgJiAweGZmXG4gICAgICAgIGNhcnJ5ID4+PSA4XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcbiAgICAgICAgYnl0ZXMucHVzaChjYXJyeSAmIDB4ZmYpXG4gICAgICAgIGNhcnJ5ID4+PSA4XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGVhbCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICBmb3IgKHZhciBrID0gMDsgc3RyaW5nW2tdID09PSBMRUFERVIgJiYgayA8IHN0cmluZy5sZW5ndGggLSAxOyArK2spIHtcbiAgICAgIGJ5dGVzLnB1c2goMClcbiAgICB9XG5cbiAgICByZXR1cm4gQnVmZmVyLmZyb20oYnl0ZXMucmV2ZXJzZSgpKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlIChzdHJpbmcpIHtcbiAgICB2YXIgYnVmZmVyID0gZGVjb2RlVW5zYWZlKHN0cmluZylcbiAgICBpZiAoYnVmZmVyKSByZXR1cm4gYnVmZmVyXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbi1iYXNlJyArIEJBU0UgKyAnIGNoYXJhY3RlcicpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVuY29kZTogZW5jb2RlLFxuICAgIGRlY29kZVVuc2FmZTogZGVjb2RlVW5zYWZlLFxuICAgIGRlY29kZTogZGVjb2RlXG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2Jhc2UteC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyogZXNsaW50LWRpc2FibGUgbm9kZS9uby1kZXByZWNhdGVkLWFwaSAqL1xudmFyIGJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpXG52YXIgQnVmZmVyID0gYnVmZmVyLkJ1ZmZlclxuXG4vLyBhbHRlcm5hdGl2ZSB0byB1c2luZyBPYmplY3Qua2V5cyBmb3Igb2xkIGJyb3dzZXJzXG5mdW5jdGlvbiBjb3B5UHJvcHMgKHNyYywgZHN0KSB7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBkc3Rba2V5XSA9IHNyY1trZXldXG4gIH1cbn1cbmlmIChCdWZmZXIuZnJvbSAmJiBCdWZmZXIuYWxsb2MgJiYgQnVmZmVyLmFsbG9jVW5zYWZlICYmIEJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBidWZmZXJcbn0gZWxzZSB7XG4gIC8vIENvcHkgcHJvcGVydGllcyBmcm9tIHJlcXVpcmUoJ2J1ZmZlcicpXG4gIGNvcHlQcm9wcyhidWZmZXIsIGV4cG9ydHMpXG4gIGV4cG9ydHMuQnVmZmVyID0gU2FmZUJ1ZmZlclxufVxuXG5mdW5jdGlvbiBTYWZlQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gQnVmZmVyKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBDb3B5IHN0YXRpYyBtZXRob2RzIGZyb20gQnVmZmVyXG5jb3B5UHJvcHMoQnVmZmVyLCBTYWZlQnVmZmVyKVxuXG5TYWZlQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG4gIHJldHVybiBCdWZmZXIoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cblNhZmVCdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9XG4gIHZhciBidWYgPSBCdWZmZXIoc2l6ZSlcbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICBidWYuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmLmZpbGwoZmlsbClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmLmZpbGwoMClcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cblNhZmVCdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlcihzaXplKVxufVxuXG5TYWZlQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfVxuICByZXR1cm4gYnVmZmVyLlNsb3dCdWZmZXIoc2l6ZSlcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3NhZmUtYnVmZmVyL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBlc2xpbnQgcXVvdGUtcHJvcHM6IG9mZiAqL1xuLyogZXNsaW50IGtleS1zcGFjaW5nOiBvZmYgKi9cbid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLm5hbWVzID0gT2JqZWN0LmZyZWV6ZSh7XG4gICdzaGExJzogICAgICAgMHgxMSxcbiAgJ3NoYTItMjU2JzogICAweDEyLFxuICAnc2hhMi01MTInOiAgIDB4MTMsXG4gICdzaGEzLTIyNCc6ICAgMHgxNyxcbiAgJ3NoYTMtMjU2JzogICAweDE2LFxuICAnc2hhMy0zODQnOiAgIDB4MTUsXG4gICdzaGEzLTUxMic6ICAgMHgxNCxcbiAgJ3NoYWtlLTEyOCc6ICAweDE4LFxuICAnc2hha2UtMjU2JzogIDB4MTksXG4gICdrZWNjYWstMjI0JzogMHgxQSxcbiAgJ2tlY2Nhay0yNTYnOiAweDFCLFxuICAna2VjY2FrLTM4NCc6IDB4MUMsXG4gICdrZWNjYWstNTEyJzogMHgxRCxcbiAgJ211cm11cjMtMTI4JzogMHgyMixcbiAgJ211cm11cjMtMzInOiAgMHgyMyxcbiAgJ2JsYWtlMmItOCc6ICAgMHhiMjAxLFxuICAnYmxha2UyYi0xNic6ICAweGIyMDIsXG4gICdibGFrZTJiLTI0JzogIDB4YjIwMyxcbiAgJ2JsYWtlMmItMzInOiAgMHhiMjA0LFxuICAnYmxha2UyYi00MCc6ICAweGIyMDUsXG4gICdibGFrZTJiLTQ4JzogIDB4YjIwNixcbiAgJ2JsYWtlMmItNTYnOiAgMHhiMjA3LFxuICAnYmxha2UyYi02NCc6ICAweGIyMDgsXG4gICdibGFrZTJiLTcyJzogIDB4YjIwOSxcbiAgJ2JsYWtlMmItODAnOiAgMHhiMjBhLFxuICAnYmxha2UyYi04OCc6ICAweGIyMGIsXG4gICdibGFrZTJiLTk2JzogIDB4YjIwYyxcbiAgJ2JsYWtlMmItMTA0JzogMHhiMjBkLFxuICAnYmxha2UyYi0xMTInOiAweGIyMGUsXG4gICdibGFrZTJiLTEyMCc6IDB4YjIwZixcbiAgJ2JsYWtlMmItMTI4JzogMHhiMjEwLFxuICAnYmxha2UyYi0xMzYnOiAweGIyMTEsXG4gICdibGFrZTJiLTE0NCc6IDB4YjIxMixcbiAgJ2JsYWtlMmItMTUyJzogMHhiMjEzLFxuICAnYmxha2UyYi0xNjAnOiAweGIyMTQsXG4gICdibGFrZTJiLTE2OCc6IDB4YjIxNSxcbiAgJ2JsYWtlMmItMTc2JzogMHhiMjE2LFxuICAnYmxha2UyYi0xODQnOiAweGIyMTcsXG4gICdibGFrZTJiLTE5Mic6IDB4YjIxOCxcbiAgJ2JsYWtlMmItMjAwJzogMHhiMjE5LFxuICAnYmxha2UyYi0yMDgnOiAweGIyMWEsXG4gICdibGFrZTJiLTIxNic6IDB4YjIxYixcbiAgJ2JsYWtlMmItMjI0JzogMHhiMjFjLFxuICAnYmxha2UyYi0yMzInOiAweGIyMWQsXG4gICdibGFrZTJiLTI0MCc6IDB4YjIxZSxcbiAgJ2JsYWtlMmItMjQ4JzogMHhiMjFmLFxuICAnYmxha2UyYi0yNTYnOiAweGIyMjAsXG4gICdibGFrZTJiLTI2NCc6IDB4YjIyMSxcbiAgJ2JsYWtlMmItMjcyJzogMHhiMjIyLFxuICAnYmxha2UyYi0yODAnOiAweGIyMjMsXG4gICdibGFrZTJiLTI4OCc6IDB4YjIyNCxcbiAgJ2JsYWtlMmItMjk2JzogMHhiMjI1LFxuICAnYmxha2UyYi0zMDQnOiAweGIyMjYsXG4gICdibGFrZTJiLTMxMic6IDB4YjIyNyxcbiAgJ2JsYWtlMmItMzIwJzogMHhiMjI4LFxuICAnYmxha2UyYi0zMjgnOiAweGIyMjksXG4gICdibGFrZTJiLTMzNic6IDB4YjIyYSxcbiAgJ2JsYWtlMmItMzQ0JzogMHhiMjJiLFxuICAnYmxha2UyYi0zNTInOiAweGIyMmMsXG4gICdibGFrZTJiLTM2MCc6IDB4YjIyZCxcbiAgJ2JsYWtlMmItMzY4JzogMHhiMjJlLFxuICAnYmxha2UyYi0zNzYnOiAweGIyMmYsXG4gICdibGFrZTJiLTM4NCc6IDB4YjIzMCxcbiAgJ2JsYWtlMmItMzkyJzogMHhiMjMxLFxuICAnYmxha2UyYi00MDAnOiAweGIyMzIsXG4gICdibGFrZTJiLTQwOCc6IDB4YjIzMyxcbiAgJ2JsYWtlMmItNDE2JzogMHhiMjM0LFxuICAnYmxha2UyYi00MjQnOiAweGIyMzUsXG4gICdibGFrZTJiLTQzMic6IDB4YjIzNixcbiAgJ2JsYWtlMmItNDQwJzogMHhiMjM3LFxuICAnYmxha2UyYi00NDgnOiAweGIyMzgsXG4gICdibGFrZTJiLTQ1Nic6IDB4YjIzOSxcbiAgJ2JsYWtlMmItNDY0JzogMHhiMjNhLFxuICAnYmxha2UyYi00NzInOiAweGIyM2IsXG4gICdibGFrZTJiLTQ4MCc6IDB4YjIzYyxcbiAgJ2JsYWtlMmItNDg4JzogMHhiMjNkLFxuICAnYmxha2UyYi00OTYnOiAweGIyM2UsXG4gICdibGFrZTJiLTUwNCc6IDB4YjIzZixcbiAgJ2JsYWtlMmItNTEyJzogMHhiMjQwLFxuICAnYmxha2Uycy04JzogICAweGIyNDEsXG4gICdibGFrZTJzLTE2JzogIDB4YjI0MixcbiAgJ2JsYWtlMnMtMjQnOiAgMHhiMjQzLFxuICAnYmxha2Uycy0zMic6ICAweGIyNDQsXG4gICdibGFrZTJzLTQwJzogIDB4YjI0NSxcbiAgJ2JsYWtlMnMtNDgnOiAgMHhiMjQ2LFxuICAnYmxha2Uycy01Nic6ICAweGIyNDcsXG4gICdibGFrZTJzLTY0JzogIDB4YjI0OCxcbiAgJ2JsYWtlMnMtNzInOiAgMHhiMjQ5LFxuICAnYmxha2Uycy04MCc6ICAweGIyNGEsXG4gICdibGFrZTJzLTg4JzogIDB4YjI0YixcbiAgJ2JsYWtlMnMtOTYnOiAgMHhiMjRjLFxuICAnYmxha2Uycy0xMDQnOiAweGIyNGQsXG4gICdibGFrZTJzLTExMic6IDB4YjI0ZSxcbiAgJ2JsYWtlMnMtMTIwJzogMHhiMjRmLFxuICAnYmxha2Uycy0xMjgnOiAweGIyNTAsXG4gICdibGFrZTJzLTEzNic6IDB4YjI1MSxcbiAgJ2JsYWtlMnMtMTQ0JzogMHhiMjUyLFxuICAnYmxha2Uycy0xNTInOiAweGIyNTMsXG4gICdibGFrZTJzLTE2MCc6IDB4YjI1NCxcbiAgJ2JsYWtlMnMtMTY4JzogMHhiMjU1LFxuICAnYmxha2Uycy0xNzYnOiAweGIyNTYsXG4gICdibGFrZTJzLTE4NCc6IDB4YjI1NyxcbiAgJ2JsYWtlMnMtMTkyJzogMHhiMjU4LFxuICAnYmxha2Uycy0yMDAnOiAweGIyNTksXG4gICdibGFrZTJzLTIwOCc6IDB4YjI1YSxcbiAgJ2JsYWtlMnMtMjE2JzogMHhiMjViLFxuICAnYmxha2Uycy0yMjQnOiAweGIyNWMsXG4gICdibGFrZTJzLTIzMic6IDB4YjI1ZCxcbiAgJ2JsYWtlMnMtMjQwJzogMHhiMjVlLFxuICAnYmxha2Uycy0yNDgnOiAweGIyNWYsXG4gICdibGFrZTJzLTI1Nic6IDB4YjI2MCxcbiAgJ1NrZWluMjU2LTgnOiAweGIzMDEsXG4gICdTa2VpbjI1Ni0xNic6IDB4YjMwMixcbiAgJ1NrZWluMjU2LTI0JzogMHhiMzAzLFxuICAnU2tlaW4yNTYtMzInOiAweGIzMDQsXG4gICdTa2VpbjI1Ni00MCc6IDB4YjMwNSxcbiAgJ1NrZWluMjU2LTQ4JzogMHhiMzA2LFxuICAnU2tlaW4yNTYtNTYnOiAweGIzMDcsXG4gICdTa2VpbjI1Ni02NCc6IDB4YjMwOCxcbiAgJ1NrZWluMjU2LTcyJzogMHhiMzA5LFxuICAnU2tlaW4yNTYtODAnOiAweGIzMGEsXG4gICdTa2VpbjI1Ni04OCc6IDB4YjMwYixcbiAgJ1NrZWluMjU2LTk2JzogMHhiMzBjLFxuICAnU2tlaW4yNTYtMTA0JzogMHhiMzBkLFxuICAnU2tlaW4yNTYtMTEyJzogMHhiMzBlLFxuICAnU2tlaW4yNTYtMTIwJzogMHhiMzBmLFxuICAnU2tlaW4yNTYtMTI4JzogMHhiMzEwLFxuICAnU2tlaW4yNTYtMTM2JzogMHhiMzExLFxuICAnU2tlaW4yNTYtMTQ0JzogMHhiMzEyLFxuICAnU2tlaW4yNTYtMTUyJzogMHhiMzEzLFxuICAnU2tlaW4yNTYtMTYwJzogMHhiMzE0LFxuICAnU2tlaW4yNTYtMTY4JzogMHhiMzE1LFxuICAnU2tlaW4yNTYtMTc2JzogMHhiMzE2LFxuICAnU2tlaW4yNTYtMTg0JzogMHhiMzE3LFxuICAnU2tlaW4yNTYtMTkyJzogMHhiMzE4LFxuICAnU2tlaW4yNTYtMjAwJzogMHhiMzE5LFxuICAnU2tlaW4yNTYtMjA4JzogMHhiMzFhLFxuICAnU2tlaW4yNTYtMjE2JzogMHhiMzFiLFxuICAnU2tlaW4yNTYtMjI0JzogMHhiMzFjLFxuICAnU2tlaW4yNTYtMjMyJzogMHhiMzFkLFxuICAnU2tlaW4yNTYtMjQwJzogMHhiMzFlLFxuICAnU2tlaW4yNTYtMjQ4JzogMHhiMzFmLFxuICAnU2tlaW4yNTYtMjU2JzogMHhiMzIwLFxuICAnU2tlaW41MTItOCc6IDB4YjMyMSxcbiAgJ1NrZWluNTEyLTE2JzogMHhiMzIyLFxuICAnU2tlaW41MTItMjQnOiAweGIzMjMsXG4gICdTa2VpbjUxMi0zMic6IDB4YjMyNCxcbiAgJ1NrZWluNTEyLTQwJzogMHhiMzI1LFxuICAnU2tlaW41MTItNDgnOiAweGIzMjYsXG4gICdTa2VpbjUxMi01Nic6IDB4YjMyNyxcbiAgJ1NrZWluNTEyLTY0JzogMHhiMzI4LFxuICAnU2tlaW41MTItNzInOiAweGIzMjksXG4gICdTa2VpbjUxMi04MCc6IDB4YjMyYSxcbiAgJ1NrZWluNTEyLTg4JzogMHhiMzJiLFxuICAnU2tlaW41MTItOTYnOiAweGIzMmMsXG4gICdTa2VpbjUxMi0xMDQnOiAweGIzMmQsXG4gICdTa2VpbjUxMi0xMTInOiAweGIzMmUsXG4gICdTa2VpbjUxMi0xMjAnOiAweGIzMmYsXG4gICdTa2VpbjUxMi0xMjgnOiAweGIzMzAsXG4gICdTa2VpbjUxMi0xMzYnOiAweGIzMzEsXG4gICdTa2VpbjUxMi0xNDQnOiAweGIzMzIsXG4gICdTa2VpbjUxMi0xNTInOiAweGIzMzMsXG4gICdTa2VpbjUxMi0xNjAnOiAweGIzMzQsXG4gICdTa2VpbjUxMi0xNjgnOiAweGIzMzUsXG4gICdTa2VpbjUxMi0xNzYnOiAweGIzMzYsXG4gICdTa2VpbjUxMi0xODQnOiAweGIzMzcsXG4gICdTa2VpbjUxMi0xOTInOiAweGIzMzgsXG4gICdTa2VpbjUxMi0yMDAnOiAweGIzMzksXG4gICdTa2VpbjUxMi0yMDgnOiAweGIzM2EsXG4gICdTa2VpbjUxMi0yMTYnOiAweGIzM2IsXG4gICdTa2VpbjUxMi0yMjQnOiAweGIzM2MsXG4gICdTa2VpbjUxMi0yMzInOiAweGIzM2QsXG4gICdTa2VpbjUxMi0yNDAnOiAweGIzM2UsXG4gICdTa2VpbjUxMi0yNDgnOiAweGIzM2YsXG4gICdTa2VpbjUxMi0yNTYnOiAweGIzNDAsXG4gICdTa2VpbjUxMi0yNjQnOiAweGIzNDEsXG4gICdTa2VpbjUxMi0yNzInOiAweGIzNDIsXG4gICdTa2VpbjUxMi0yODAnOiAweGIzNDMsXG4gICdTa2VpbjUxMi0yODgnOiAweGIzNDQsXG4gICdTa2VpbjUxMi0yOTYnOiAweGIzNDUsXG4gICdTa2VpbjUxMi0zMDQnOiAweGIzNDYsXG4gICdTa2VpbjUxMi0zMTInOiAweGIzNDcsXG4gICdTa2VpbjUxMi0zMjAnOiAweGIzNDgsXG4gICdTa2VpbjUxMi0zMjgnOiAweGIzNDksXG4gICdTa2VpbjUxMi0zMzYnOiAweGIzNGEsXG4gICdTa2VpbjUxMi0zNDQnOiAweGIzNGIsXG4gICdTa2VpbjUxMi0zNTInOiAweGIzNGMsXG4gICdTa2VpbjUxMi0zNjAnOiAweGIzNGQsXG4gICdTa2VpbjUxMi0zNjgnOiAweGIzNGUsXG4gICdTa2VpbjUxMi0zNzYnOiAweGIzNGYsXG4gICdTa2VpbjUxMi0zODQnOiAweGIzNTAsXG4gICdTa2VpbjUxMi0zOTInOiAweGIzNTEsXG4gICdTa2VpbjUxMi00MDAnOiAweGIzNTIsXG4gICdTa2VpbjUxMi00MDgnOiAweGIzNTMsXG4gICdTa2VpbjUxMi00MTYnOiAweGIzNTQsXG4gICdTa2VpbjUxMi00MjQnOiAweGIzNTUsXG4gICdTa2VpbjUxMi00MzInOiAweGIzNTYsXG4gICdTa2VpbjUxMi00NDAnOiAweGIzNTcsXG4gICdTa2VpbjUxMi00NDgnOiAweGIzNTgsXG4gICdTa2VpbjUxMi00NTYnOiAweGIzNTksXG4gICdTa2VpbjUxMi00NjQnOiAweGIzNWEsXG4gICdTa2VpbjUxMi00NzInOiAweGIzNWIsXG4gICdTa2VpbjUxMi00ODAnOiAweGIzNWMsXG4gICdTa2VpbjUxMi00ODgnOiAweGIzNWQsXG4gICdTa2VpbjUxMi00OTYnOiAweGIzNWUsXG4gICdTa2VpbjUxMi01MDQnOiAweGIzNWYsXG4gICdTa2VpbjUxMi01MTInOiAweGIzNjAsXG4gICdTa2VpbjEwMjQtOCc6IDB4YjM2MSxcbiAgJ1NrZWluMTAyNC0xNic6IDB4YjM2MixcbiAgJ1NrZWluMTAyNC0yNCc6IDB4YjM2MyxcbiAgJ1NrZWluMTAyNC0zMic6IDB4YjM2NCxcbiAgJ1NrZWluMTAyNC00MCc6IDB4YjM2NSxcbiAgJ1NrZWluMTAyNC00OCc6IDB4YjM2NixcbiAgJ1NrZWluMTAyNC01Nic6IDB4YjM2NyxcbiAgJ1NrZWluMTAyNC02NCc6IDB4YjM2OCxcbiAgJ1NrZWluMTAyNC03Mic6IDB4YjM2OSxcbiAgJ1NrZWluMTAyNC04MCc6IDB4YjM2YSxcbiAgJ1NrZWluMTAyNC04OCc6IDB4YjM2YixcbiAgJ1NrZWluMTAyNC05Nic6IDB4YjM2YyxcbiAgJ1NrZWluMTAyNC0xMDQnOiAweGIzNmQsXG4gICdTa2VpbjEwMjQtMTEyJzogMHhiMzZlLFxuICAnU2tlaW4xMDI0LTEyMCc6IDB4YjM2ZixcbiAgJ1NrZWluMTAyNC0xMjgnOiAweGIzNzAsXG4gICdTa2VpbjEwMjQtMTM2JzogMHhiMzcxLFxuICAnU2tlaW4xMDI0LTE0NCc6IDB4YjM3MixcbiAgJ1NrZWluMTAyNC0xNTInOiAweGIzNzMsXG4gICdTa2VpbjEwMjQtMTYwJzogMHhiMzc0LFxuICAnU2tlaW4xMDI0LTE2OCc6IDB4YjM3NSxcbiAgJ1NrZWluMTAyNC0xNzYnOiAweGIzNzYsXG4gICdTa2VpbjEwMjQtMTg0JzogMHhiMzc3LFxuICAnU2tlaW4xMDI0LTE5Mic6IDB4YjM3OCxcbiAgJ1NrZWluMTAyNC0yMDAnOiAweGIzNzksXG4gICdTa2VpbjEwMjQtMjA4JzogMHhiMzdhLFxuICAnU2tlaW4xMDI0LTIxNic6IDB4YjM3YixcbiAgJ1NrZWluMTAyNC0yMjQnOiAweGIzN2MsXG4gICdTa2VpbjEwMjQtMjMyJzogMHhiMzdkLFxuICAnU2tlaW4xMDI0LTI0MCc6IDB4YjM3ZSxcbiAgJ1NrZWluMTAyNC0yNDgnOiAweGIzN2YsXG4gICdTa2VpbjEwMjQtMjU2JzogMHhiMzgwLFxuICAnU2tlaW4xMDI0LTI2NCc6IDB4YjM4MSxcbiAgJ1NrZWluMTAyNC0yNzInOiAweGIzODIsXG4gICdTa2VpbjEwMjQtMjgwJzogMHhiMzgzLFxuICAnU2tlaW4xMDI0LTI4OCc6IDB4YjM4NCxcbiAgJ1NrZWluMTAyNC0yOTYnOiAweGIzODUsXG4gICdTa2VpbjEwMjQtMzA0JzogMHhiMzg2LFxuICAnU2tlaW4xMDI0LTMxMic6IDB4YjM4NyxcbiAgJ1NrZWluMTAyNC0zMjAnOiAweGIzODgsXG4gICdTa2VpbjEwMjQtMzI4JzogMHhiMzg5LFxuICAnU2tlaW4xMDI0LTMzNic6IDB4YjM4YSxcbiAgJ1NrZWluMTAyNC0zNDQnOiAweGIzOGIsXG4gICdTa2VpbjEwMjQtMzUyJzogMHhiMzhjLFxuICAnU2tlaW4xMDI0LTM2MCc6IDB4YjM4ZCxcbiAgJ1NrZWluMTAyNC0zNjgnOiAweGIzOGUsXG4gICdTa2VpbjEwMjQtMzc2JzogMHhiMzhmLFxuICAnU2tlaW4xMDI0LTM4NCc6IDB4YjM5MCxcbiAgJ1NrZWluMTAyNC0zOTInOiAweGIzOTEsXG4gICdTa2VpbjEwMjQtNDAwJzogMHhiMzkyLFxuICAnU2tlaW4xMDI0LTQwOCc6IDB4YjM5MyxcbiAgJ1NrZWluMTAyNC00MTYnOiAweGIzOTQsXG4gICdTa2VpbjEwMjQtNDI0JzogMHhiMzk1LFxuICAnU2tlaW4xMDI0LTQzMic6IDB4YjM5NixcbiAgJ1NrZWluMTAyNC00NDAnOiAweGIzOTcsXG4gICdTa2VpbjEwMjQtNDQ4JzogMHhiMzk4LFxuICAnU2tlaW4xMDI0LTQ1Nic6IDB4YjM5OSxcbiAgJ1NrZWluMTAyNC00NjQnOiAweGIzOWEsXG4gICdTa2VpbjEwMjQtNDcyJzogMHhiMzliLFxuICAnU2tlaW4xMDI0LTQ4MCc6IDB4YjM5YyxcbiAgJ1NrZWluMTAyNC00ODgnOiAweGIzOWQsXG4gICdTa2VpbjEwMjQtNDk2JzogMHhiMzllLFxuICAnU2tlaW4xMDI0LTUwNCc6IDB4YjM5ZixcbiAgJ1NrZWluMTAyNC01MTInOiAweGIzYTAsXG4gICdTa2VpbjEwMjQtNTIwJzogMHhiM2ExLFxuICAnU2tlaW4xMDI0LTUyOCc6IDB4YjNhMixcbiAgJ1NrZWluMTAyNC01MzYnOiAweGIzYTMsXG4gICdTa2VpbjEwMjQtNTQ0JzogMHhiM2E0LFxuICAnU2tlaW4xMDI0LTU1Mic6IDB4YjNhNSxcbiAgJ1NrZWluMTAyNC01NjAnOiAweGIzYTYsXG4gICdTa2VpbjEwMjQtNTY4JzogMHhiM2E3LFxuICAnU2tlaW4xMDI0LTU3Nic6IDB4YjNhOCxcbiAgJ1NrZWluMTAyNC01ODQnOiAweGIzYTksXG4gICdTa2VpbjEwMjQtNTkyJzogMHhiM2FhLFxuICAnU2tlaW4xMDI0LTYwMCc6IDB4YjNhYixcbiAgJ1NrZWluMTAyNC02MDgnOiAweGIzYWMsXG4gICdTa2VpbjEwMjQtNjE2JzogMHhiM2FkLFxuICAnU2tlaW4xMDI0LTYyNCc6IDB4YjNhZSxcbiAgJ1NrZWluMTAyNC02MzInOiAweGIzYWYsXG4gICdTa2VpbjEwMjQtNjQwJzogMHhiM2IwLFxuICAnU2tlaW4xMDI0LTY0OCc6IDB4YjNiMSxcbiAgJ1NrZWluMTAyNC02NTYnOiAweGIzYjIsXG4gICdTa2VpbjEwMjQtNjY0JzogMHhiM2IzLFxuICAnU2tlaW4xMDI0LTY3Mic6IDB4YjNiNCxcbiAgJ1NrZWluMTAyNC02ODAnOiAweGIzYjUsXG4gICdTa2VpbjEwMjQtNjg4JzogMHhiM2I2LFxuICAnU2tlaW4xMDI0LTY5Nic6IDB4YjNiNyxcbiAgJ1NrZWluMTAyNC03MDQnOiAweGIzYjgsXG4gICdTa2VpbjEwMjQtNzEyJzogMHhiM2I5LFxuICAnU2tlaW4xMDI0LTcyMCc6IDB4YjNiYSxcbiAgJ1NrZWluMTAyNC03MjgnOiAweGIzYmIsXG4gICdTa2VpbjEwMjQtNzM2JzogMHhiM2JjLFxuICAnU2tlaW4xMDI0LTc0NCc6IDB4YjNiZCxcbiAgJ1NrZWluMTAyNC03NTInOiAweGIzYmUsXG4gICdTa2VpbjEwMjQtNzYwJzogMHhiM2JmLFxuICAnU2tlaW4xMDI0LTc2OCc6IDB4YjNjMCxcbiAgJ1NrZWluMTAyNC03NzYnOiAweGIzYzEsXG4gICdTa2VpbjEwMjQtNzg0JzogMHhiM2MyLFxuICAnU2tlaW4xMDI0LTc5Mic6IDB4YjNjMyxcbiAgJ1NrZWluMTAyNC04MDAnOiAweGIzYzQsXG4gICdTa2VpbjEwMjQtODA4JzogMHhiM2M1LFxuICAnU2tlaW4xMDI0LTgxNic6IDB4YjNjNixcbiAgJ1NrZWluMTAyNC04MjQnOiAweGIzYzcsXG4gICdTa2VpbjEwMjQtODMyJzogMHhiM2M4LFxuICAnU2tlaW4xMDI0LTg0MCc6IDB4YjNjOSxcbiAgJ1NrZWluMTAyNC04NDgnOiAweGIzY2EsXG4gICdTa2VpbjEwMjQtODU2JzogMHhiM2NiLFxuICAnU2tlaW4xMDI0LTg2NCc6IDB4YjNjYyxcbiAgJ1NrZWluMTAyNC04NzInOiAweGIzY2QsXG4gICdTa2VpbjEwMjQtODgwJzogMHhiM2NlLFxuICAnU2tlaW4xMDI0LTg4OCc6IDB4YjNjZixcbiAgJ1NrZWluMTAyNC04OTYnOiAweGIzZDAsXG4gICdTa2VpbjEwMjQtOTA0JzogMHhiM2QxLFxuICAnU2tlaW4xMDI0LTkxMic6IDB4YjNkMixcbiAgJ1NrZWluMTAyNC05MjAnOiAweGIzZDMsXG4gICdTa2VpbjEwMjQtOTI4JzogMHhiM2Q0LFxuICAnU2tlaW4xMDI0LTkzNic6IDB4YjNkNSxcbiAgJ1NrZWluMTAyNC05NDQnOiAweGIzZDYsXG4gICdTa2VpbjEwMjQtOTUyJzogMHhiM2Q3LFxuICAnU2tlaW4xMDI0LTk2MCc6IDB4YjNkOCxcbiAgJ1NrZWluMTAyNC05NjgnOiAweGIzZDksXG4gICdTa2VpbjEwMjQtOTc2JzogMHhiM2RhLFxuICAnU2tlaW4xMDI0LTk4NCc6IDB4YjNkYixcbiAgJ1NrZWluMTAyNC05OTInOiAweGIzZGMsXG4gICdTa2VpbjEwMjQtMTAwMCc6IDB4YjNkZCxcbiAgJ1NrZWluMTAyNC0xMDA4JzogMHhiM2RlLFxuICAnU2tlaW4xMDI0LTEwMTYnOiAweGIzZGYsXG4gICdTa2VpbjEwMjQtMTAyNCc6IDB4YjNlMFxufSlcblxuZXhwb3J0cy5jb2RlcyA9IE9iamVjdC5mcmVlemUoe1xuICAweDExOiAnc2hhMScsXG4gIDB4MTI6ICdzaGEyLTI1NicsXG4gIDB4MTM6ICdzaGEyLTUxMicsXG4gIDB4MTc6ICdzaGEzLTIyNCcsXG4gIDB4MTY6ICdzaGEzLTI1NicsXG4gIDB4MTU6ICdzaGEzLTM4NCcsXG4gIDB4MTQ6ICdzaGEzLTUxMicsXG4gIDB4MTg6ICdzaGFrZS0xMjgnLFxuICAweDE5OiAnc2hha2UtMjU2JyxcbiAgMHgxQTogJ2tlY2Nhay0yMjQnLFxuICAweDFCOiAna2VjY2FrLTI1NicsXG4gIDB4MUM6ICdrZWNjYWstMzg0JyxcbiAgMHgxRDogJ2tlY2Nhay01MTInLFxuICAweDIyOiAnbXVybXVyMy0xMjgnLFxuICAweDIzOiAnbXVybXVyMy0zMicsXG5cbiAgLy8gYmxha2UyXG4gIDB4YjIwMTogJ2JsYWtlMmItOCcsXG4gIDB4YjIwMjogJ2JsYWtlMmItMTYnLFxuICAweGIyMDM6ICdibGFrZTJiLTI0JyxcbiAgMHhiMjA0OiAnYmxha2UyYi0zMicsXG4gIDB4YjIwNTogJ2JsYWtlMmItNDAnLFxuICAweGIyMDY6ICdibGFrZTJiLTQ4JyxcbiAgMHhiMjA3OiAnYmxha2UyYi01NicsXG4gIDB4YjIwODogJ2JsYWtlMmItNjQnLFxuICAweGIyMDk6ICdibGFrZTJiLTcyJyxcbiAgMHhiMjBhOiAnYmxha2UyYi04MCcsXG4gIDB4YjIwYjogJ2JsYWtlMmItODgnLFxuICAweGIyMGM6ICdibGFrZTJiLTk2JyxcbiAgMHhiMjBkOiAnYmxha2UyYi0xMDQnLFxuICAweGIyMGU6ICdibGFrZTJiLTExMicsXG4gIDB4YjIwZjogJ2JsYWtlMmItMTIwJyxcbiAgMHhiMjEwOiAnYmxha2UyYi0xMjgnLFxuICAweGIyMTE6ICdibGFrZTJiLTEzNicsXG4gIDB4YjIxMjogJ2JsYWtlMmItMTQ0JyxcbiAgMHhiMjEzOiAnYmxha2UyYi0xNTInLFxuICAweGIyMTQ6ICdibGFrZTJiLTE2MCcsXG4gIDB4YjIxNTogJ2JsYWtlMmItMTY4JyxcbiAgMHhiMjE2OiAnYmxha2UyYi0xNzYnLFxuICAweGIyMTc6ICdibGFrZTJiLTE4NCcsXG4gIDB4YjIxODogJ2JsYWtlMmItMTkyJyxcbiAgMHhiMjE5OiAnYmxha2UyYi0yMDAnLFxuICAweGIyMWE6ICdibGFrZTJiLTIwOCcsXG4gIDB4YjIxYjogJ2JsYWtlMmItMjE2JyxcbiAgMHhiMjFjOiAnYmxha2UyYi0yMjQnLFxuICAweGIyMWQ6ICdibGFrZTJiLTIzMicsXG4gIDB4YjIxZTogJ2JsYWtlMmItMjQwJyxcbiAgMHhiMjFmOiAnYmxha2UyYi0yNDgnLFxuICAweGIyMjA6ICdibGFrZTJiLTI1NicsXG4gIDB4YjIyMTogJ2JsYWtlMmItMjY0JyxcbiAgMHhiMjIyOiAnYmxha2UyYi0yNzInLFxuICAweGIyMjM6ICdibGFrZTJiLTI4MCcsXG4gIDB4YjIyNDogJ2JsYWtlMmItMjg4JyxcbiAgMHhiMjI1OiAnYmxha2UyYi0yOTYnLFxuICAweGIyMjY6ICdibGFrZTJiLTMwNCcsXG4gIDB4YjIyNzogJ2JsYWtlMmItMzEyJyxcbiAgMHhiMjI4OiAnYmxha2UyYi0zMjAnLFxuICAweGIyMjk6ICdibGFrZTJiLTMyOCcsXG4gIDB4YjIyYTogJ2JsYWtlMmItMzM2JyxcbiAgMHhiMjJiOiAnYmxha2UyYi0zNDQnLFxuICAweGIyMmM6ICdibGFrZTJiLTM1MicsXG4gIDB4YjIyZDogJ2JsYWtlMmItMzYwJyxcbiAgMHhiMjJlOiAnYmxha2UyYi0zNjgnLFxuICAweGIyMmY6ICdibGFrZTJiLTM3NicsXG4gIDB4YjIzMDogJ2JsYWtlMmItMzg0JyxcbiAgMHhiMjMxOiAnYmxha2UyYi0zOTInLFxuICAweGIyMzI6ICdibGFrZTJiLTQwMCcsXG4gIDB4YjIzMzogJ2JsYWtlMmItNDA4JyxcbiAgMHhiMjM0OiAnYmxha2UyYi00MTYnLFxuICAweGIyMzU6ICdibGFrZTJiLTQyNCcsXG4gIDB4YjIzNjogJ2JsYWtlMmItNDMyJyxcbiAgMHhiMjM3OiAnYmxha2UyYi00NDAnLFxuICAweGIyMzg6ICdibGFrZTJiLTQ0OCcsXG4gIDB4YjIzOTogJ2JsYWtlMmItNDU2JyxcbiAgMHhiMjNhOiAnYmxha2UyYi00NjQnLFxuICAweGIyM2I6ICdibGFrZTJiLTQ3MicsXG4gIDB4YjIzYzogJ2JsYWtlMmItNDgwJyxcbiAgMHhiMjNkOiAnYmxha2UyYi00ODgnLFxuICAweGIyM2U6ICdibGFrZTJiLTQ5NicsXG4gIDB4YjIzZjogJ2JsYWtlMmItNTA0JyxcbiAgMHhiMjQwOiAnYmxha2UyYi01MTInLFxuICAweGIyNDE6ICdibGFrZTJzLTgnLFxuICAweGIyNDI6ICdibGFrZTJzLTE2JyxcbiAgMHhiMjQzOiAnYmxha2Uycy0yNCcsXG4gIDB4YjI0NDogJ2JsYWtlMnMtMzInLFxuICAweGIyNDU6ICdibGFrZTJzLTQwJyxcbiAgMHhiMjQ2OiAnYmxha2Uycy00OCcsXG4gIDB4YjI0NzogJ2JsYWtlMnMtNTYnLFxuICAweGIyNDg6ICdibGFrZTJzLTY0JyxcbiAgMHhiMjQ5OiAnYmxha2Uycy03MicsXG4gIDB4YjI0YTogJ2JsYWtlMnMtODAnLFxuICAweGIyNGI6ICdibGFrZTJzLTg4JyxcbiAgMHhiMjRjOiAnYmxha2Uycy05NicsXG4gIDB4YjI0ZDogJ2JsYWtlMnMtMTA0JyxcbiAgMHhiMjRlOiAnYmxha2Uycy0xMTInLFxuICAweGIyNGY6ICdibGFrZTJzLTEyMCcsXG4gIDB4YjI1MDogJ2JsYWtlMnMtMTI4JyxcbiAgMHhiMjUxOiAnYmxha2Uycy0xMzYnLFxuICAweGIyNTI6ICdibGFrZTJzLTE0NCcsXG4gIDB4YjI1MzogJ2JsYWtlMnMtMTUyJyxcbiAgMHhiMjU0OiAnYmxha2Uycy0xNjAnLFxuICAweGIyNTU6ICdibGFrZTJzLTE2OCcsXG4gIDB4YjI1NjogJ2JsYWtlMnMtMTc2JyxcbiAgMHhiMjU3OiAnYmxha2Uycy0xODQnLFxuICAweGIyNTg6ICdibGFrZTJzLTE5MicsXG4gIDB4YjI1OTogJ2JsYWtlMnMtMjAwJyxcbiAgMHhiMjVhOiAnYmxha2Uycy0yMDgnLFxuICAweGIyNWI6ICdibGFrZTJzLTIxNicsXG4gIDB4YjI1YzogJ2JsYWtlMnMtMjI0JyxcbiAgMHhiMjVkOiAnYmxha2Uycy0yMzInLFxuICAweGIyNWU6ICdibGFrZTJzLTI0MCcsXG4gIDB4YjI1ZjogJ2JsYWtlMnMtMjQ4JyxcbiAgMHhiMjYwOiAnYmxha2Uycy0yNTYnLFxuXG4gIC8vIHNrZWluXG4gIDB4YjMwMTogJ1NrZWluMjU2LTgnLFxuICAweGIzMDI6ICdTa2VpbjI1Ni0xNicsXG4gIDB4YjMwMzogJ1NrZWluMjU2LTI0JyxcbiAgMHhiMzA0OiAnU2tlaW4yNTYtMzInLFxuICAweGIzMDU6ICdTa2VpbjI1Ni00MCcsXG4gIDB4YjMwNjogJ1NrZWluMjU2LTQ4JyxcbiAgMHhiMzA3OiAnU2tlaW4yNTYtNTYnLFxuICAweGIzMDg6ICdTa2VpbjI1Ni02NCcsXG4gIDB4YjMwOTogJ1NrZWluMjU2LTcyJyxcbiAgMHhiMzBhOiAnU2tlaW4yNTYtODAnLFxuICAweGIzMGI6ICdTa2VpbjI1Ni04OCcsXG4gIDB4YjMwYzogJ1NrZWluMjU2LTk2JyxcbiAgMHhiMzBkOiAnU2tlaW4yNTYtMTA0JyxcbiAgMHhiMzBlOiAnU2tlaW4yNTYtMTEyJyxcbiAgMHhiMzBmOiAnU2tlaW4yNTYtMTIwJyxcbiAgMHhiMzEwOiAnU2tlaW4yNTYtMTI4JyxcbiAgMHhiMzExOiAnU2tlaW4yNTYtMTM2JyxcbiAgMHhiMzEyOiAnU2tlaW4yNTYtMTQ0JyxcbiAgMHhiMzEzOiAnU2tlaW4yNTYtMTUyJyxcbiAgMHhiMzE0OiAnU2tlaW4yNTYtMTYwJyxcbiAgMHhiMzE1OiAnU2tlaW4yNTYtMTY4JyxcbiAgMHhiMzE2OiAnU2tlaW4yNTYtMTc2JyxcbiAgMHhiMzE3OiAnU2tlaW4yNTYtMTg0JyxcbiAgMHhiMzE4OiAnU2tlaW4yNTYtMTkyJyxcbiAgMHhiMzE5OiAnU2tlaW4yNTYtMjAwJyxcbiAgMHhiMzFhOiAnU2tlaW4yNTYtMjA4JyxcbiAgMHhiMzFiOiAnU2tlaW4yNTYtMjE2JyxcbiAgMHhiMzFjOiAnU2tlaW4yNTYtMjI0JyxcbiAgMHhiMzFkOiAnU2tlaW4yNTYtMjMyJyxcbiAgMHhiMzFlOiAnU2tlaW4yNTYtMjQwJyxcbiAgMHhiMzFmOiAnU2tlaW4yNTYtMjQ4JyxcbiAgMHhiMzIwOiAnU2tlaW4yNTYtMjU2JyxcbiAgMHhiMzIxOiAnU2tlaW41MTItOCcsXG4gIDB4YjMyMjogJ1NrZWluNTEyLTE2JyxcbiAgMHhiMzIzOiAnU2tlaW41MTItMjQnLFxuICAweGIzMjQ6ICdTa2VpbjUxMi0zMicsXG4gIDB4YjMyNTogJ1NrZWluNTEyLTQwJyxcbiAgMHhiMzI2OiAnU2tlaW41MTItNDgnLFxuICAweGIzMjc6ICdTa2VpbjUxMi01NicsXG4gIDB4YjMyODogJ1NrZWluNTEyLTY0JyxcbiAgMHhiMzI5OiAnU2tlaW41MTItNzInLFxuICAweGIzMmE6ICdTa2VpbjUxMi04MCcsXG4gIDB4YjMyYjogJ1NrZWluNTEyLTg4JyxcbiAgMHhiMzJjOiAnU2tlaW41MTItOTYnLFxuICAweGIzMmQ6ICdTa2VpbjUxMi0xMDQnLFxuICAweGIzMmU6ICdTa2VpbjUxMi0xMTInLFxuICAweGIzMmY6ICdTa2VpbjUxMi0xMjAnLFxuICAweGIzMzA6ICdTa2VpbjUxMi0xMjgnLFxuICAweGIzMzE6ICdTa2VpbjUxMi0xMzYnLFxuICAweGIzMzI6ICdTa2VpbjUxMi0xNDQnLFxuICAweGIzMzM6ICdTa2VpbjUxMi0xNTInLFxuICAweGIzMzQ6ICdTa2VpbjUxMi0xNjAnLFxuICAweGIzMzU6ICdTa2VpbjUxMi0xNjgnLFxuICAweGIzMzY6ICdTa2VpbjUxMi0xNzYnLFxuICAweGIzMzc6ICdTa2VpbjUxMi0xODQnLFxuICAweGIzMzg6ICdTa2VpbjUxMi0xOTInLFxuICAweGIzMzk6ICdTa2VpbjUxMi0yMDAnLFxuICAweGIzM2E6ICdTa2VpbjUxMi0yMDgnLFxuICAweGIzM2I6ICdTa2VpbjUxMi0yMTYnLFxuICAweGIzM2M6ICdTa2VpbjUxMi0yMjQnLFxuICAweGIzM2Q6ICdTa2VpbjUxMi0yMzInLFxuICAweGIzM2U6ICdTa2VpbjUxMi0yNDAnLFxuICAweGIzM2Y6ICdTa2VpbjUxMi0yNDgnLFxuICAweGIzNDA6ICdTa2VpbjUxMi0yNTYnLFxuICAweGIzNDE6ICdTa2VpbjUxMi0yNjQnLFxuICAweGIzNDI6ICdTa2VpbjUxMi0yNzInLFxuICAweGIzNDM6ICdTa2VpbjUxMi0yODAnLFxuICAweGIzNDQ6ICdTa2VpbjUxMi0yODgnLFxuICAweGIzNDU6ICdTa2VpbjUxMi0yOTYnLFxuICAweGIzNDY6ICdTa2VpbjUxMi0zMDQnLFxuICAweGIzNDc6ICdTa2VpbjUxMi0zMTInLFxuICAweGIzNDg6ICdTa2VpbjUxMi0zMjAnLFxuICAweGIzNDk6ICdTa2VpbjUxMi0zMjgnLFxuICAweGIzNGE6ICdTa2VpbjUxMi0zMzYnLFxuICAweGIzNGI6ICdTa2VpbjUxMi0zNDQnLFxuICAweGIzNGM6ICdTa2VpbjUxMi0zNTInLFxuICAweGIzNGQ6ICdTa2VpbjUxMi0zNjAnLFxuICAweGIzNGU6ICdTa2VpbjUxMi0zNjgnLFxuICAweGIzNGY6ICdTa2VpbjUxMi0zNzYnLFxuICAweGIzNTA6ICdTa2VpbjUxMi0zODQnLFxuICAweGIzNTE6ICdTa2VpbjUxMi0zOTInLFxuICAweGIzNTI6ICdTa2VpbjUxMi00MDAnLFxuICAweGIzNTM6ICdTa2VpbjUxMi00MDgnLFxuICAweGIzNTQ6ICdTa2VpbjUxMi00MTYnLFxuICAweGIzNTU6ICdTa2VpbjUxMi00MjQnLFxuICAweGIzNTY6ICdTa2VpbjUxMi00MzInLFxuICAweGIzNTc6ICdTa2VpbjUxMi00NDAnLFxuICAweGIzNTg6ICdTa2VpbjUxMi00NDgnLFxuICAweGIzNTk6ICdTa2VpbjUxMi00NTYnLFxuICAweGIzNWE6ICdTa2VpbjUxMi00NjQnLFxuICAweGIzNWI6ICdTa2VpbjUxMi00NzInLFxuICAweGIzNWM6ICdTa2VpbjUxMi00ODAnLFxuICAweGIzNWQ6ICdTa2VpbjUxMi00ODgnLFxuICAweGIzNWU6ICdTa2VpbjUxMi00OTYnLFxuICAweGIzNWY6ICdTa2VpbjUxMi01MDQnLFxuICAweGIzNjA6ICdTa2VpbjUxMi01MTInLFxuICAweGIzNjE6ICdTa2VpbjEwMjQtOCcsXG4gIDB4YjM2MjogJ1NrZWluMTAyNC0xNicsXG4gIDB4YjM2MzogJ1NrZWluMTAyNC0yNCcsXG4gIDB4YjM2NDogJ1NrZWluMTAyNC0zMicsXG4gIDB4YjM2NTogJ1NrZWluMTAyNC00MCcsXG4gIDB4YjM2NjogJ1NrZWluMTAyNC00OCcsXG4gIDB4YjM2NzogJ1NrZWluMTAyNC01NicsXG4gIDB4YjM2ODogJ1NrZWluMTAyNC02NCcsXG4gIDB4YjM2OTogJ1NrZWluMTAyNC03MicsXG4gIDB4YjM2YTogJ1NrZWluMTAyNC04MCcsXG4gIDB4YjM2YjogJ1NrZWluMTAyNC04OCcsXG4gIDB4YjM2YzogJ1NrZWluMTAyNC05NicsXG4gIDB4YjM2ZDogJ1NrZWluMTAyNC0xMDQnLFxuICAweGIzNmU6ICdTa2VpbjEwMjQtMTEyJyxcbiAgMHhiMzZmOiAnU2tlaW4xMDI0LTEyMCcsXG4gIDB4YjM3MDogJ1NrZWluMTAyNC0xMjgnLFxuICAweGIzNzE6ICdTa2VpbjEwMjQtMTM2JyxcbiAgMHhiMzcyOiAnU2tlaW4xMDI0LTE0NCcsXG4gIDB4YjM3MzogJ1NrZWluMTAyNC0xNTInLFxuICAweGIzNzQ6ICdTa2VpbjEwMjQtMTYwJyxcbiAgMHhiMzc1OiAnU2tlaW4xMDI0LTE2OCcsXG4gIDB4YjM3NjogJ1NrZWluMTAyNC0xNzYnLFxuICAweGIzNzc6ICdTa2VpbjEwMjQtMTg0JyxcbiAgMHhiMzc4OiAnU2tlaW4xMDI0LTE5MicsXG4gIDB4YjM3OTogJ1NrZWluMTAyNC0yMDAnLFxuICAweGIzN2E6ICdTa2VpbjEwMjQtMjA4JyxcbiAgMHhiMzdiOiAnU2tlaW4xMDI0LTIxNicsXG4gIDB4YjM3YzogJ1NrZWluMTAyNC0yMjQnLFxuICAweGIzN2Q6ICdTa2VpbjEwMjQtMjMyJyxcbiAgMHhiMzdlOiAnU2tlaW4xMDI0LTI0MCcsXG4gIDB4YjM3ZjogJ1NrZWluMTAyNC0yNDgnLFxuICAweGIzODA6ICdTa2VpbjEwMjQtMjU2JyxcbiAgMHhiMzgxOiAnU2tlaW4xMDI0LTI2NCcsXG4gIDB4YjM4MjogJ1NrZWluMTAyNC0yNzInLFxuICAweGIzODM6ICdTa2VpbjEwMjQtMjgwJyxcbiAgMHhiMzg0OiAnU2tlaW4xMDI0LTI4OCcsXG4gIDB4YjM4NTogJ1NrZWluMTAyNC0yOTYnLFxuICAweGIzODY6ICdTa2VpbjEwMjQtMzA0JyxcbiAgMHhiMzg3OiAnU2tlaW4xMDI0LTMxMicsXG4gIDB4YjM4ODogJ1NrZWluMTAyNC0zMjAnLFxuICAweGIzODk6ICdTa2VpbjEwMjQtMzI4JyxcbiAgMHhiMzhhOiAnU2tlaW4xMDI0LTMzNicsXG4gIDB4YjM4YjogJ1NrZWluMTAyNC0zNDQnLFxuICAweGIzOGM6ICdTa2VpbjEwMjQtMzUyJyxcbiAgMHhiMzhkOiAnU2tlaW4xMDI0LTM2MCcsXG4gIDB4YjM4ZTogJ1NrZWluMTAyNC0zNjgnLFxuICAweGIzOGY6ICdTa2VpbjEwMjQtMzc2JyxcbiAgMHhiMzkwOiAnU2tlaW4xMDI0LTM4NCcsXG4gIDB4YjM5MTogJ1NrZWluMTAyNC0zOTInLFxuICAweGIzOTI6ICdTa2VpbjEwMjQtNDAwJyxcbiAgMHhiMzkzOiAnU2tlaW4xMDI0LTQwOCcsXG4gIDB4YjM5NDogJ1NrZWluMTAyNC00MTYnLFxuICAweGIzOTU6ICdTa2VpbjEwMjQtNDI0JyxcbiAgMHhiMzk2OiAnU2tlaW4xMDI0LTQzMicsXG4gIDB4YjM5NzogJ1NrZWluMTAyNC00NDAnLFxuICAweGIzOTg6ICdTa2VpbjEwMjQtNDQ4JyxcbiAgMHhiMzk5OiAnU2tlaW4xMDI0LTQ1NicsXG4gIDB4YjM5YTogJ1NrZWluMTAyNC00NjQnLFxuICAweGIzOWI6ICdTa2VpbjEwMjQtNDcyJyxcbiAgMHhiMzljOiAnU2tlaW4xMDI0LTQ4MCcsXG4gIDB4YjM5ZDogJ1NrZWluMTAyNC00ODgnLFxuICAweGIzOWU6ICdTa2VpbjEwMjQtNDk2JyxcbiAgMHhiMzlmOiAnU2tlaW4xMDI0LTUwNCcsXG4gIDB4YjNhMDogJ1NrZWluMTAyNC01MTInLFxuICAweGIzYTE6ICdTa2VpbjEwMjQtNTIwJyxcbiAgMHhiM2EyOiAnU2tlaW4xMDI0LTUyOCcsXG4gIDB4YjNhMzogJ1NrZWluMTAyNC01MzYnLFxuICAweGIzYTQ6ICdTa2VpbjEwMjQtNTQ0JyxcbiAgMHhiM2E1OiAnU2tlaW4xMDI0LTU1MicsXG4gIDB4YjNhNjogJ1NrZWluMTAyNC01NjAnLFxuICAweGIzYTc6ICdTa2VpbjEwMjQtNTY4JyxcbiAgMHhiM2E4OiAnU2tlaW4xMDI0LTU3NicsXG4gIDB4YjNhOTogJ1NrZWluMTAyNC01ODQnLFxuICAweGIzYWE6ICdTa2VpbjEwMjQtNTkyJyxcbiAgMHhiM2FiOiAnU2tlaW4xMDI0LTYwMCcsXG4gIDB4YjNhYzogJ1NrZWluMTAyNC02MDgnLFxuICAweGIzYWQ6ICdTa2VpbjEwMjQtNjE2JyxcbiAgMHhiM2FlOiAnU2tlaW4xMDI0LTYyNCcsXG4gIDB4YjNhZjogJ1NrZWluMTAyNC02MzInLFxuICAweGIzYjA6ICdTa2VpbjEwMjQtNjQwJyxcbiAgMHhiM2IxOiAnU2tlaW4xMDI0LTY0OCcsXG4gIDB4YjNiMjogJ1NrZWluMTAyNC02NTYnLFxuICAweGIzYjM6ICdTa2VpbjEwMjQtNjY0JyxcbiAgMHhiM2I0OiAnU2tlaW4xMDI0LTY3MicsXG4gIDB4YjNiNTogJ1NrZWluMTAyNC02ODAnLFxuICAweGIzYjY6ICdTa2VpbjEwMjQtNjg4JyxcbiAgMHhiM2I3OiAnU2tlaW4xMDI0LTY5NicsXG4gIDB4YjNiODogJ1NrZWluMTAyNC03MDQnLFxuICAweGIzYjk6ICdTa2VpbjEwMjQtNzEyJyxcbiAgMHhiM2JhOiAnU2tlaW4xMDI0LTcyMCcsXG4gIDB4YjNiYjogJ1NrZWluMTAyNC03MjgnLFxuICAweGIzYmM6ICdTa2VpbjEwMjQtNzM2JyxcbiAgMHhiM2JkOiAnU2tlaW4xMDI0LTc0NCcsXG4gIDB4YjNiZTogJ1NrZWluMTAyNC03NTInLFxuICAweGIzYmY6ICdTa2VpbjEwMjQtNzYwJyxcbiAgMHhiM2MwOiAnU2tlaW4xMDI0LTc2OCcsXG4gIDB4YjNjMTogJ1NrZWluMTAyNC03NzYnLFxuICAweGIzYzI6ICdTa2VpbjEwMjQtNzg0JyxcbiAgMHhiM2MzOiAnU2tlaW4xMDI0LTc5MicsXG4gIDB4YjNjNDogJ1NrZWluMTAyNC04MDAnLFxuICAweGIzYzU6ICdTa2VpbjEwMjQtODA4JyxcbiAgMHhiM2M2OiAnU2tlaW4xMDI0LTgxNicsXG4gIDB4YjNjNzogJ1NrZWluMTAyNC04MjQnLFxuICAweGIzYzg6ICdTa2VpbjEwMjQtODMyJyxcbiAgMHhiM2M5OiAnU2tlaW4xMDI0LTg0MCcsXG4gIDB4YjNjYTogJ1NrZWluMTAyNC04NDgnLFxuICAweGIzY2I6ICdTa2VpbjEwMjQtODU2JyxcbiAgMHhiM2NjOiAnU2tlaW4xMDI0LTg2NCcsXG4gIDB4YjNjZDogJ1NrZWluMTAyNC04NzInLFxuICAweGIzY2U6ICdTa2VpbjEwMjQtODgwJyxcbiAgMHhiM2NmOiAnU2tlaW4xMDI0LTg4OCcsXG4gIDB4YjNkMDogJ1NrZWluMTAyNC04OTYnLFxuICAweGIzZDE6ICdTa2VpbjEwMjQtOTA0JyxcbiAgMHhiM2QyOiAnU2tlaW4xMDI0LTkxMicsXG4gIDB4YjNkMzogJ1NrZWluMTAyNC05MjAnLFxuICAweGIzZDQ6ICdTa2VpbjEwMjQtOTI4JyxcbiAgMHhiM2Q1OiAnU2tlaW4xMDI0LTkzNicsXG4gIDB4YjNkNjogJ1NrZWluMTAyNC05NDQnLFxuICAweGIzZDc6ICdTa2VpbjEwMjQtOTUyJyxcbiAgMHhiM2Q4OiAnU2tlaW4xMDI0LTk2MCcsXG4gIDB4YjNkOTogJ1NrZWluMTAyNC05NjgnLFxuICAweGIzZGE6ICdTa2VpbjEwMjQtOTc2JyxcbiAgMHhiM2RiOiAnU2tlaW4xMDI0LTk4NCcsXG4gIDB4YjNkYzogJ1NrZWluMTAyNC05OTInLFxuICAweGIzZGQ6ICdTa2VpbjEwMjQtMTAwMCcsXG4gIDB4YjNkZTogJ1NrZWluMTAyNC0xMDA4JyxcbiAgMHhiM2RmOiAnU2tlaW4xMDI0LTEwMTYnLFxuICAweGIzZTA6ICdTa2VpbjEwMjQtMTAyNCdcbn0pXG5cbmV4cG9ydHMuZGVmYXVsdExlbmd0aHMgPSBPYmplY3QuZnJlZXplKHtcbiAgMHgxMTogMjAsXG4gIDB4MTI6IDMyLFxuICAweDEzOiA2NCxcbiAgMHgxNzogMjgsXG4gIDB4MTY6IDMyLFxuICAweDE1OiA0OCxcbiAgMHgxNDogNjQsXG4gIDB4MTg6IDMyLFxuICAweDE5OiA2NCxcbiAgMHgxQTogMjgsXG4gIDB4MUI6IDMyLFxuICAweDFDOiA0OCxcbiAgMHgxRDogNjQsXG4gIDB4MjI6IDMyLFxuXG4gIDB4YjIwMTogMHgwMSxcbiAgMHhiMjAyOiAweDAyLFxuICAweGIyMDM6IDB4MDMsXG4gIDB4YjIwNDogMHgwNCxcbiAgMHhiMjA1OiAweDA1LFxuICAweGIyMDY6IDB4MDYsXG4gIDB4YjIwNzogMHgwNyxcbiAgMHhiMjA4OiAweDA4LFxuICAweGIyMDk6IDB4MDksXG4gIDB4YjIwYTogMHgwYSxcbiAgMHhiMjBiOiAweDBiLFxuICAweGIyMGM6IDB4MGMsXG4gIDB4YjIwZDogMHgwZCxcbiAgMHhiMjBlOiAweDBlLFxuICAweGIyMGY6IDB4MGYsXG4gIDB4YjIxMDogMHgxMCxcbiAgMHhiMjExOiAweDExLFxuICAweGIyMTI6IDB4MTIsXG4gIDB4YjIxMzogMHgxMyxcbiAgMHhiMjE0OiAweDE0LFxuICAweGIyMTU6IDB4MTUsXG4gIDB4YjIxNjogMHgxNixcbiAgMHhiMjE3OiAweDE3LFxuICAweGIyMTg6IDB4MTgsXG4gIDB4YjIxOTogMHgxOSxcbiAgMHhiMjFhOiAweDFhLFxuICAweGIyMWI6IDB4MWIsXG4gIDB4YjIxYzogMHgxYyxcbiAgMHhiMjFkOiAweDFkLFxuICAweGIyMWU6IDB4MWUsXG4gIDB4YjIxZjogMHgxZixcbiAgMHhiMjIwOiAweDIwLFxuICAweGIyMjE6IDB4MjEsXG4gIDB4YjIyMjogMHgyMixcbiAgMHhiMjIzOiAweDIzLFxuICAweGIyMjQ6IDB4MjQsXG4gIDB4YjIyNTogMHgyNSxcbiAgMHhiMjI2OiAweDI2LFxuICAweGIyMjc6IDB4MjcsXG4gIDB4YjIyODogMHgyOCxcbiAgMHhiMjI5OiAweDI5LFxuICAweGIyMmE6IDB4MmEsXG4gIDB4YjIyYjogMHgyYixcbiAgMHhiMjJjOiAweDJjLFxuICAweGIyMmQ6IDB4MmQsXG4gIDB4YjIyZTogMHgyZSxcbiAgMHhiMjJmOiAweDJmLFxuICAweGIyMzA6IDB4MzAsXG4gIDB4YjIzMTogMHgzMSxcbiAgMHhiMjMyOiAweDMyLFxuICAweGIyMzM6IDB4MzMsXG4gIDB4YjIzNDogMHgzNCxcbiAgMHhiMjM1OiAweDM1LFxuICAweGIyMzY6IDB4MzYsXG4gIDB4YjIzNzogMHgzNyxcbiAgMHhiMjM4OiAweDM4LFxuICAweGIyMzk6IDB4MzksXG4gIDB4YjIzYTogMHgzYSxcbiAgMHhiMjNiOiAweDNiLFxuICAweGIyM2M6IDB4M2MsXG4gIDB4YjIzZDogMHgzZCxcbiAgMHhiMjNlOiAweDNlLFxuICAweGIyM2Y6IDB4M2YsXG4gIDB4YjI0MDogMHg0MCxcbiAgMHhiMjQxOiAweDAxLFxuICAweGIyNDI6IDB4MDIsXG4gIDB4YjI0MzogMHgwMyxcbiAgMHhiMjQ0OiAweDA0LFxuICAweGIyNDU6IDB4MDUsXG4gIDB4YjI0NjogMHgwNixcbiAgMHhiMjQ3OiAweDA3LFxuICAweGIyNDg6IDB4MDgsXG4gIDB4YjI0OTogMHgwOSxcbiAgMHhiMjRhOiAweDBhLFxuICAweGIyNGI6IDB4MGIsXG4gIDB4YjI0YzogMHgwYyxcbiAgMHhiMjRkOiAweDBkLFxuICAweGIyNGU6IDB4MGUsXG4gIDB4YjI0ZjogMHgwZixcbiAgMHhiMjUwOiAweDEwLFxuICAweGIyNTE6IDB4MTEsXG4gIDB4YjI1MjogMHgxMixcbiAgMHhiMjUzOiAweDEzLFxuICAweGIyNTQ6IDB4MTQsXG4gIDB4YjI1NTogMHgxNSxcbiAgMHhiMjU2OiAweDE2LFxuICAweGIyNTc6IDB4MTcsXG4gIDB4YjI1ODogMHgxOCxcbiAgMHhiMjU5OiAweDE5LFxuICAweGIyNWE6IDB4MWEsXG4gIDB4YjI1YjogMHgxYixcbiAgMHhiMjVjOiAweDFjLFxuICAweGIyNWQ6IDB4MWQsXG4gIDB4YjI1ZTogMHgxZSxcbiAgMHhiMjVmOiAweDFmLFxuICAweGIyNjA6IDB4MjAsXG4gIDB4YjMwMTogMHgwMSxcbiAgMHhiMzAyOiAweDAyLFxuICAweGIzMDM6IDB4MDMsXG4gIDB4YjMwNDogMHgwNCxcbiAgMHhiMzA1OiAweDA1LFxuICAweGIzMDY6IDB4MDYsXG4gIDB4YjMwNzogMHgwNyxcbiAgMHhiMzA4OiAweDA4LFxuICAweGIzMDk6IDB4MDksXG4gIDB4YjMwYTogMHgwYSxcbiAgMHhiMzBiOiAweDBiLFxuICAweGIzMGM6IDB4MGMsXG4gIDB4YjMwZDogMHgwZCxcbiAgMHhiMzBlOiAweDBlLFxuICAweGIzMGY6IDB4MGYsXG4gIDB4YjMxMDogMHgxMCxcbiAgMHhiMzExOiAweDExLFxuICAweGIzMTI6IDB4MTIsXG4gIDB4YjMxMzogMHgxMyxcbiAgMHhiMzE0OiAweDE0LFxuICAweGIzMTU6IDB4MTUsXG4gIDB4YjMxNjogMHgxNixcbiAgMHhiMzE3OiAweDE3LFxuICAweGIzMTg6IDB4MTgsXG4gIDB4YjMxOTogMHgxOSxcbiAgMHhiMzFhOiAweDFhLFxuICAweGIzMWI6IDB4MWIsXG4gIDB4YjMxYzogMHgxYyxcbiAgMHhiMzFkOiAweDFkLFxuICAweGIzMWU6IDB4MWUsXG4gIDB4YjMxZjogMHgxZixcbiAgMHhiMzIwOiAweDIwLFxuICAweGIzMjE6IDB4MDEsXG4gIDB4YjMyMjogMHgwMixcbiAgMHhiMzIzOiAweDAzLFxuICAweGIzMjQ6IDB4MDQsXG4gIDB4YjMyNTogMHgwNSxcbiAgMHhiMzI2OiAweDA2LFxuICAweGIzMjc6IDB4MDcsXG4gIDB4YjMyODogMHgwOCxcbiAgMHhiMzI5OiAweDA5LFxuICAweGIzMmE6IDB4MGEsXG4gIDB4YjMyYjogMHgwYixcbiAgMHhiMzJjOiAweDBjLFxuICAweGIzMmQ6IDB4MGQsXG4gIDB4YjMyZTogMHgwZSxcbiAgMHhiMzJmOiAweDBmLFxuICAweGIzMzA6IDB4MTAsXG4gIDB4YjMzMTogMHgxMSxcbiAgMHhiMzMyOiAweDEyLFxuICAweGIzMzM6IDB4MTMsXG4gIDB4YjMzNDogMHgxNCxcbiAgMHhiMzM1OiAweDE1LFxuICAweGIzMzY6IDB4MTYsXG4gIDB4YjMzNzogMHgxNyxcbiAgMHhiMzM4OiAweDE4LFxuICAweGIzMzk6IDB4MTksXG4gIDB4YjMzYTogMHgxYSxcbiAgMHhiMzNiOiAweDFiLFxuICAweGIzM2M6IDB4MWMsXG4gIDB4YjMzZDogMHgxZCxcbiAgMHhiMzNlOiAweDFlLFxuICAweGIzM2Y6IDB4MWYsXG4gIDB4YjM0MDogMHgyMCxcbiAgMHhiMzQxOiAweDIxLFxuICAweGIzNDI6IDB4MjIsXG4gIDB4YjM0MzogMHgyMyxcbiAgMHhiMzQ0OiAweDI0LFxuICAweGIzNDU6IDB4MjUsXG4gIDB4YjM0NjogMHgyNixcbiAgMHhiMzQ3OiAweDI3LFxuICAweGIzNDg6IDB4MjgsXG4gIDB4YjM0OTogMHgyOSxcbiAgMHhiMzRhOiAweDJhLFxuICAweGIzNGI6IDB4MmIsXG4gIDB4YjM0YzogMHgyYyxcbiAgMHhiMzRkOiAweDJkLFxuICAweGIzNGU6IDB4MmUsXG4gIDB4YjM0ZjogMHgyZixcbiAgMHhiMzUwOiAweDMwLFxuICAweGIzNTE6IDB4MzEsXG4gIDB4YjM1MjogMHgzMixcbiAgMHhiMzUzOiAweDMzLFxuICAweGIzNTQ6IDB4MzQsXG4gIDB4YjM1NTogMHgzNSxcbiAgMHhiMzU2OiAweDM2LFxuICAweGIzNTc6IDB4MzcsXG4gIDB4YjM1ODogMHgzOCxcbiAgMHhiMzU5OiAweDM5LFxuICAweGIzNWE6IDB4M2EsXG4gIDB4YjM1YjogMHgzYixcbiAgMHhiMzVjOiAweDNjLFxuICAweGIzNWQ6IDB4M2QsXG4gIDB4YjM1ZTogMHgzZSxcbiAgMHhiMzVmOiAweDNmLFxuICAweGIzNjA6IDB4NDAsXG4gIDB4YjM2MTogMHgwMSxcbiAgMHhiMzYyOiAweDAyLFxuICAweGIzNjM6IDB4MDMsXG4gIDB4YjM2NDogMHgwNCxcbiAgMHhiMzY1OiAweDA1LFxuICAweGIzNjY6IDB4MDYsXG4gIDB4YjM2NzogMHgwNyxcbiAgMHhiMzY4OiAweDA4LFxuICAweGIzNjk6IDB4MDksXG4gIDB4YjM2YTogMHgwYSxcbiAgMHhiMzZiOiAweDBiLFxuICAweGIzNmM6IDB4MGMsXG4gIDB4YjM2ZDogMHgwZCxcbiAgMHhiMzZlOiAweDBlLFxuICAweGIzNmY6IDB4MGYsXG4gIDB4YjM3MDogMHgxMCxcbiAgMHhiMzcxOiAweDExLFxuICAweGIzNzI6IDB4MTIsXG4gIDB4YjM3MzogMHgxMyxcbiAgMHhiMzc0OiAweDE0LFxuICAweGIzNzU6IDB4MTUsXG4gIDB4YjM3NjogMHgxNixcbiAgMHhiMzc3OiAweDE3LFxuICAweGIzNzg6IDB4MTgsXG4gIDB4YjM3OTogMHgxOSxcbiAgMHhiMzdhOiAweDFhLFxuICAweGIzN2I6IDB4MWIsXG4gIDB4YjM3YzogMHgxYyxcbiAgMHhiMzdkOiAweDFkLFxuICAweGIzN2U6IDB4MWUsXG4gIDB4YjM3ZjogMHgxZixcbiAgMHhiMzgwOiAweDIwLFxuICAweGIzODE6IDB4MjEsXG4gIDB4YjM4MjogMHgyMixcbiAgMHhiMzgzOiAweDIzLFxuICAweGIzODQ6IDB4MjQsXG4gIDB4YjM4NTogMHgyNSxcbiAgMHhiMzg2OiAweDI2LFxuICAweGIzODc6IDB4MjcsXG4gIDB4YjM4ODogMHgyOCxcbiAgMHhiMzg5OiAweDI5LFxuICAweGIzOGE6IDB4MmEsXG4gIDB4YjM4YjogMHgyYixcbiAgMHhiMzhjOiAweDJjLFxuICAweGIzOGQ6IDB4MmQsXG4gIDB4YjM4ZTogMHgyZSxcbiAgMHhiMzhmOiAweDJmLFxuICAweGIzOTA6IDB4MzAsXG4gIDB4YjM5MTogMHgzMSxcbiAgMHhiMzkyOiAweDMyLFxuICAweGIzOTM6IDB4MzMsXG4gIDB4YjM5NDogMHgzNCxcbiAgMHhiMzk1OiAweDM1LFxuICAweGIzOTY6IDB4MzYsXG4gIDB4YjM5NzogMHgzNyxcbiAgMHhiMzk4OiAweDM4LFxuICAweGIzOTk6IDB4MzksXG4gIDB4YjM5YTogMHgzYSxcbiAgMHhiMzliOiAweDNiLFxuICAweGIzOWM6IDB4M2MsXG4gIDB4YjM5ZDogMHgzZCxcbiAgMHhiMzllOiAweDNlLFxuICAweGIzOWY6IDB4M2YsXG4gIDB4YjNhMDogMHg0MCxcbiAgMHhiM2ExOiAweDQxLFxuICAweGIzYTI6IDB4NDIsXG4gIDB4YjNhMzogMHg0MyxcbiAgMHhiM2E0OiAweDQ0LFxuICAweGIzYTU6IDB4NDUsXG4gIDB4YjNhNjogMHg0NixcbiAgMHhiM2E3OiAweDQ3LFxuICAweGIzYTg6IDB4NDgsXG4gIDB4YjNhOTogMHg0OSxcbiAgMHhiM2FhOiAweDRhLFxuICAweGIzYWI6IDB4NGIsXG4gIDB4YjNhYzogMHg0YyxcbiAgMHhiM2FkOiAweDRkLFxuICAweGIzYWU6IDB4NGUsXG4gIDB4YjNhZjogMHg0ZixcbiAgMHhiM2IwOiAweDUwLFxuICAweGIzYjE6IDB4NTEsXG4gIDB4YjNiMjogMHg1MixcbiAgMHhiM2IzOiAweDUzLFxuICAweGIzYjQ6IDB4NTQsXG4gIDB4YjNiNTogMHg1NSxcbiAgMHhiM2I2OiAweDU2LFxuICAweGIzYjc6IDB4NTcsXG4gIDB4YjNiODogMHg1OCxcbiAgMHhiM2I5OiAweDU5LFxuICAweGIzYmE6IDB4NWEsXG4gIDB4YjNiYjogMHg1YixcbiAgMHhiM2JjOiAweDVjLFxuICAweGIzYmQ6IDB4NWQsXG4gIDB4YjNiZTogMHg1ZSxcbiAgMHhiM2JmOiAweDVmLFxuICAweGIzYzA6IDB4NjAsXG4gIDB4YjNjMTogMHg2MSxcbiAgMHhiM2MyOiAweDYyLFxuICAweGIzYzM6IDB4NjMsXG4gIDB4YjNjNDogMHg2NCxcbiAgMHhiM2M1OiAweDY1LFxuICAweGIzYzY6IDB4NjYsXG4gIDB4YjNjNzogMHg2NyxcbiAgMHhiM2M4OiAweDY4LFxuICAweGIzYzk6IDB4NjksXG4gIDB4YjNjYTogMHg2YSxcbiAgMHhiM2NiOiAweDZiLFxuICAweGIzY2M6IDB4NmMsXG4gIDB4YjNjZDogMHg2ZCxcbiAgMHhiM2NlOiAweDZlLFxuICAweGIzY2Y6IDB4NmYsXG4gIDB4YjNkMDogMHg3MCxcbiAgMHhiM2QxOiAweDcxLFxuICAweGIzZDI6IDB4NzIsXG4gIDB4YjNkMzogMHg3MyxcbiAgMHhiM2Q0OiAweDc0LFxuICAweGIzZDU6IDB4NzUsXG4gIDB4YjNkNjogMHg3NixcbiAgMHhiM2Q3OiAweDc3LFxuICAweGIzZDg6IDB4NzgsXG4gIDB4YjNkOTogMHg3OSxcbiAgMHhiM2RhOiAweDdhLFxuICAweGIzZGI6IDB4N2IsXG4gIDB4YjNkYzogMHg3YyxcbiAgMHhiM2RkOiAweDdkLFxuICAweGIzZGU6IDB4N2UsXG4gIDB4YjNkZjogMHg3ZixcbiAgMHhiM2UwOiAweDgwXG59KVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbXVsdGloYXNoZXMvc3JjL2NvbnN0YW50cy5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBlbmNvZGVcblxudmFyIE1TQiA9IDB4ODBcbiAgLCBSRVNUID0gMHg3RlxuICAsIE1TQkFMTCA9IH5SRVNUXG4gICwgSU5UID0gTWF0aC5wb3coMiwgMzEpXG5cbmZ1bmN0aW9uIGVuY29kZShudW0sIG91dCwgb2Zmc2V0KSB7XG4gIG91dCA9IG91dCB8fCBbXVxuICBvZmZzZXQgPSBvZmZzZXQgfHwgMFxuICB2YXIgb2xkT2Zmc2V0ID0gb2Zmc2V0XG5cbiAgd2hpbGUobnVtID49IElOVCkge1xuICAgIG91dFtvZmZzZXQrK10gPSAobnVtICYgMHhGRikgfCBNU0JcbiAgICBudW0gLz0gMTI4XG4gIH1cbiAgd2hpbGUobnVtICYgTVNCQUxMKSB7XG4gICAgb3V0W29mZnNldCsrXSA9IChudW0gJiAweEZGKSB8IE1TQlxuICAgIG51bSA+Pj49IDdcbiAgfVxuICBvdXRbb2Zmc2V0XSA9IG51bSB8IDBcbiAgXG4gIGVuY29kZS5ieXRlcyA9IG9mZnNldCAtIG9sZE9mZnNldCArIDFcbiAgXG4gIHJldHVybiBvdXRcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3ZhcmludC9lbmNvZGUuanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVhZFxuXG52YXIgTVNCID0gMHg4MFxuICAsIFJFU1QgPSAweDdGXG5cbmZ1bmN0aW9uIHJlYWQoYnVmLCBvZmZzZXQpIHtcbiAgdmFyIHJlcyAgICA9IDBcbiAgICAsIG9mZnNldCA9IG9mZnNldCB8fCAwXG4gICAgLCBzaGlmdCAgPSAwXG4gICAgLCBjb3VudGVyID0gb2Zmc2V0XG4gICAgLCBiXG4gICAgLCBsID0gYnVmLmxlbmd0aFxuXG4gIGRvIHtcbiAgICBpZiAoY291bnRlciA+PSBsKSB7XG4gICAgICByZWFkLmJ5dGVzID0gMFxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0NvdWxkIG5vdCBkZWNvZGUgdmFyaW50JylcbiAgICB9XG4gICAgYiA9IGJ1Zltjb3VudGVyKytdXG4gICAgcmVzICs9IHNoaWZ0IDwgMjhcbiAgICAgID8gKGIgJiBSRVNUKSA8PCBzaGlmdFxuICAgICAgOiAoYiAmIFJFU1QpICogTWF0aC5wb3coMiwgc2hpZnQpXG4gICAgc2hpZnQgKz0gN1xuICB9IHdoaWxlIChiID49IE1TQilcblxuICByZWFkLmJ5dGVzID0gY291bnRlciAtIG9mZnNldFxuXG4gIHJldHVybiByZXNcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3ZhcmludC9kZWNvZGUuanNcbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlxudmFyIE4xID0gTWF0aC5wb3coMiwgIDcpXG52YXIgTjIgPSBNYXRoLnBvdygyLCAxNClcbnZhciBOMyA9IE1hdGgucG93KDIsIDIxKVxudmFyIE40ID0gTWF0aC5wb3coMiwgMjgpXG52YXIgTjUgPSBNYXRoLnBvdygyLCAzNSlcbnZhciBONiA9IE1hdGgucG93KDIsIDQyKVxudmFyIE43ID0gTWF0aC5wb3coMiwgNDkpXG52YXIgTjggPSBNYXRoLnBvdygyLCA1NilcbnZhciBOOSA9IE1hdGgucG93KDIsIDYzKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gKFxuICAgIHZhbHVlIDwgTjEgPyAxXG4gIDogdmFsdWUgPCBOMiA/IDJcbiAgOiB2YWx1ZSA8IE4zID8gM1xuICA6IHZhbHVlIDwgTjQgPyA0XG4gIDogdmFsdWUgPCBONSA/IDVcbiAgOiB2YWx1ZSA8IE42ID8gNlxuICA6IHZhbHVlIDwgTjcgPyA3XG4gIDogdmFsdWUgPCBOOCA/IDhcbiAgOiB2YWx1ZSA8IE45ID8gOVxuICA6ICAgICAgICAgICAgICAxMFxuICApXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy92YXJpbnQvbGVuZ3RoLmpzXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBbbXVsdGliYXNlXShodHRwczovL2dpdGh1Yi5jb20vbXVsdGlmb3JtYXRzL211bHRpYmFzZSkgc3BlY2lmaWNhdGlvbi5cbiAqIEBtb2R1bGUgTXVsdGliYXNlXG4gKi9cbid1c2Ugc3RyaWN0J1xuXG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IG11bHRpYmFzZVxuZXhwb3J0cy5lbmNvZGUgPSBlbmNvZGVcbmV4cG9ydHMuZGVjb2RlID0gZGVjb2RlXG5leHBvcnRzLmlzRW5jb2RlZCA9IGlzRW5jb2RlZFxuXG5jb25zdCBlcnJOb3RTdXBwb3J0ZWQgPSBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGVuY29kaW5nJylcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgYnVmZmVyIHdpdGggdGhlIG11bHRpYmFzZSB2YXJpbnQrY29kZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IG5hbWVPckNvZGUgLSBUaGUgbXVsdGliYXNlIG5hbWUgb3IgY29kZSBudW1iZXIuXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmIC0gVGhlIGRhdGEgdG8gYmUgcHJlZml4ZWQgd2l0aCBtdWx0aWJhc2UuXG4gKiBAbWVtYmVyb2YgTXVsdGliYXNlXG4gKiBAcmV0dXJucyB7QnVmZmVyfVxuICovXG5mdW5jdGlvbiBtdWx0aWJhc2UgKG5hbWVPckNvZGUsIGJ1Zikge1xuICBpZiAoIWJ1Zikge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVxdWlyZXMgYW4gZW5jb2RlZCBidWZmZXInKVxuICB9XG4gIGNvbnN0IGJhc2UgPSBnZXRCYXNlKG5hbWVPckNvZGUpXG4gIGNvbnN0IGNvZGVCdWYgPSBuZXcgQnVmZmVyKGJhc2UuY29kZSlcblxuICBjb25zdCBuYW1lID0gYmFzZS5uYW1lXG4gIHZhbGlkRW5jb2RlKG5hbWUsIGJ1ZilcbiAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW2NvZGVCdWYsIGJ1Zl0pXG59XG5cbi8qKlxuICogRW5jb2RlIGRhdGEgd2l0aCB0aGUgc3BlY2lmaWVkIGJhc2UgYW5kIGFkZCB0aGUgbXVsdGliYXNlIHByZWZpeC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IG5hbWVPckNvZGUgLSBUaGUgbXVsdGliYXNlIG5hbWUgb3IgY29kZSBudW1iZXIuXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmIC0gVGhlIGRhdGEgdG8gYmUgZW5jb2RlZC5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9XG4gKiBAbWVtYmVyb2YgTXVsdGliYXNlXG4gKi9cbmZ1bmN0aW9uIGVuY29kZSAobmFtZU9yQ29kZSwgYnVmKSB7XG4gIGNvbnN0IGJhc2UgPSBnZXRCYXNlKG5hbWVPckNvZGUpXG4gIGNvbnN0IG5hbWUgPSBiYXNlLm5hbWVcblxuICByZXR1cm4gbXVsdGliYXNlKG5hbWUsIG5ldyBCdWZmZXIoYmFzZS5lbmNvZGUoYnVmKSkpXG59XG5cbi8qKlxuICpcbiAqIFRha2VzIGEgYnVmZmVyIG9yIHN0cmluZyBlbmNvZGVkIHdpdGggbXVsdGliYXNlIGhlYWRlclxuICogZGVjb2RlcyBpdCBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgZGVjb2RlZCBidWZmZXJcbiAqIGFuZCB0aGUgZW5jb2RlZCB0eXBlIHsgYmFzZTogPG5hbWU+LCBkYXRhOiA8YnVmZmVyPiB9XG4gKlxuICogZnJvbSBAdGhlb2JhdCA6IFRoaXMgaXMgbm90IHdoYXQgdGhlIG11bHRpYmFzZS5zcGVjLmpzIHRlc3QgaXMgd2FpdGluZyBmb3IsXG4gKiBoZW5jZSB0aGUgcmV0dXJuIGRlY29kZU9iamVjdC5kYXRhXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ8c3RyaW5nfSBidWZPclN0cmluZ1xuICogQHJldHVybnMge09iamVjdH0gcmVzdWx0XG4gKiBAcmV0dXJucyB7c3RyaW5nfSByZXN1bHQuYmFzZVxuICogQHJldHVybnMge0J1ZmZlcn0gcmVzdWx0LmRhdGFcbiAqIEBtZW1iZXJvZiBNdWx0aWJhc2VcbiAqXG4gKi9cbmZ1bmN0aW9uIGRlY29kZSAoYnVmT3JTdHJpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihidWZPclN0cmluZykpIHtcbiAgICBidWZPclN0cmluZyA9IGJ1Zk9yU3RyaW5nLnRvU3RyaW5nKClcbiAgfVxuXG4gIGNvbnN0IGNvZGUgPSBidWZPclN0cmluZy5zdWJzdHJpbmcoMCwgMSlcbiAgYnVmT3JTdHJpbmcgPSBidWZPclN0cmluZy5zdWJzdHJpbmcoMSwgYnVmT3JTdHJpbmcubGVuZ3RoKVxuXG4gIGlmICh0eXBlb2YgYnVmT3JTdHJpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmT3JTdHJpbmcgPSBuZXcgQnVmZmVyKGJ1Zk9yU3RyaW5nKVxuICB9XG5cbiAgY29uc3QgYmFzZSA9IGdldEJhc2UoY29kZSlcblxuICBjb25zdCBkZWNvZGVPYmplY3QgPSB7XG4gICAgYmFzZTogYmFzZS5uYW1lLFxuICAgIGRhdGE6IG5ldyBCdWZmZXIoYmFzZS5kZWNvZGUoYnVmT3JTdHJpbmcudG9TdHJpbmcoKSkpXG4gIH1cbiAgcmV0dXJuIGRlY29kZU9iamVjdC5kYXRhXG59XG5cbi8qKlxuICogSXMgdGhlIGdpdmVuIGRhdGEgbXVsdGliYXNlIGVuY29kZWQ/XG4gKlxuICogQHBhcmFtIHtCdWZmZXJ8c3RyaW5nfSBidWZPclN0cmluZ1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKiBAbWVtYmVyb2YgTXVsdGliYXNlXG4gKi9cbmZ1bmN0aW9uIGlzRW5jb2RlZCAoYnVmT3JTdHJpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihidWZPclN0cmluZykpIHtcbiAgICBidWZPclN0cmluZyA9IGJ1Zk9yU3RyaW5nLnRvU3RyaW5nKClcbiAgfVxuXG4gIGNvbnN0IGNvZGUgPSBidWZPclN0cmluZy5zdWJzdHJpbmcoMCwgMSlcbiAgdHJ5IHtcbiAgICBjb25zdCBiYXNlID0gZ2V0QmFzZShjb2RlKVxuICAgIHJldHVybiBiYXNlLm5hbWVcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZlxuICogQHByaXZhdGVcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHZhbGlkRW5jb2RlIChuYW1lLCBidWYpIHtcbiAgY29uc3QgYmFzZSA9IGdldEJhc2UobmFtZSlcbiAgYmFzZS5kZWNvZGUoYnVmLnRvU3RyaW5nKCkpXG59XG5cbmZ1bmN0aW9uIGdldEJhc2UgKG5hbWVPckNvZGUpIHtcbiAgbGV0IGJhc2VcblxuICBpZiAoY29uc3RhbnRzLm5hbWVzW25hbWVPckNvZGVdKSB7XG4gICAgYmFzZSA9IGNvbnN0YW50cy5uYW1lc1tuYW1lT3JDb2RlXVxuICB9IGVsc2UgaWYgKGNvbnN0YW50cy5jb2Rlc1tuYW1lT3JDb2RlXSkge1xuICAgIGJhc2UgPSBjb25zdGFudHMuY29kZXNbbmFtZU9yQ29kZV1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBlcnJOb3RTdXBwb3J0ZWRcbiAgfVxuXG4gIGlmICghYmFzZS5pc0ltcGxlbWVudGVkKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jhc2UgJyArIG5hbWVPckNvZGUgKyAnIGlzIG5vdCBpbXBsZW1lbnRlZCB5ZXQnKVxuICB9XG5cbiAgcmV0dXJuIGJhc2Vcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL211bHRpYmFzZS9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBCYXNlID0gcmVxdWlyZSgnLi9iYXNlLmpzJylcbmNvbnN0IGJhc2VYID0gcmVxdWlyZSgnYmFzZS14JylcbmNvbnN0IGJhc2UxNiA9IHJlcXVpcmUoJy4vYmFzZTE2JylcblxuLy8gbmFtZSwgY29kZSwgaW1wbGVtZW50YXRpb24sIGFscGhhYmV0XG5jb25zdCBjb25zdGFudHMgPSBbXG4gIFsnYmFzZTEnLCAnMScsICcnLCAnMSddLFxuICBbJ2Jhc2UyJywgJzAnLCBiYXNlWCwgJzAxJ10sXG4gIFsnYmFzZTgnLCAnNycsIGJhc2VYLCAnMDEyMzQ1NjcnXSxcbiAgWydiYXNlMTAnLCAnOScsIGJhc2VYLCAnMDEyMzQ1Njc4OSddLFxuICBbJ2Jhc2UxNicsICdmJywgYmFzZTE2LCAnMDEyMzQ1Njc4OWFiY2RlZiddLFxuICBbJ2Jhc2UzMmhleCcsICd2JywgYmFzZVgsICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1diddLFxuICBbJ2Jhc2UzMicsICdiJywgYmFzZVgsICdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejIzNDU2NyddLFxuICBbJ2Jhc2UzMnonLCAnaCcsIGJhc2VYLCAneWJuZHJmZzhlamttY3BxeG90MXV3aXN6YTM0NWg3NjknXSxcbiAgWydiYXNlNThmbGlja3InLCAnWicsIGJhc2VYLCAnMTIzNDU2Nzg5YWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5ekFCQ0RFRkdISktMTU5QUVJTVFVWV1hZWiddLFxuICBbJ2Jhc2U1OGJ0YycsICd6JywgYmFzZVgsICcxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6J10sXG4gIFsnYmFzZTY0JywgJ20nLCBiYXNlWCwgJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXSxcbiAgWydiYXNlNjR1cmwnLCAndScsIGJhc2VYLCAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODktXyddXG5dXG5cbmNvbnN0IG5hbWVzID0gY29uc3RhbnRzLnJlZHVjZSgocHJldiwgdHVwcGxlKSA9PiB7XG4gIHByZXZbdHVwcGxlWzBdXSA9IG5ldyBCYXNlKHR1cHBsZVswXSwgdHVwcGxlWzFdLCB0dXBwbGVbMl0sIHR1cHBsZVszXSlcbiAgcmV0dXJuIHByZXZcbn0sIHt9KVxuXG5jb25zdCBjb2RlcyA9IGNvbnN0YW50cy5yZWR1Y2UoKHByZXYsIHR1cHBsZSkgPT4ge1xuICBwcmV2W3R1cHBsZVsxXV0gPSBuYW1lc1t0dXBwbGVbMF1dXG4gIHJldHVybiBwcmV2XG59LCB7fSlcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWVzOiBuYW1lcyxcbiAgY29kZXM6IGNvZGVzXG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9tdWx0aWJhc2Uvc3JjL2NvbnN0YW50cy5qc1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmNsYXNzIEJhc2Uge1xuICBjb25zdHJ1Y3RvciAobmFtZSwgY29kZSwgaW1wbGVtZW50YXRpb24sIGFscGhhYmV0KSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuY29kZSA9IGNvZGVcbiAgICB0aGlzLmFscGhhYmV0ID0gYWxwaGFiZXRcbiAgICBpZiAoaW1wbGVtZW50YXRpb24gJiYgYWxwaGFiZXQpIHtcbiAgICAgIHRoaXMuZW5naW5lID0gaW1wbGVtZW50YXRpb24oYWxwaGFiZXQpXG4gICAgfVxuICB9XG5cbiAgZW5jb2RlIChzdHJpbmdPckJ1ZmZlcikge1xuICAgIHJldHVybiB0aGlzLmVuZ2luZS5lbmNvZGUoc3RyaW5nT3JCdWZmZXIpXG4gIH1cblxuICBkZWNvZGUgKHN0cmluZ09yQnVmZmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5naW5lLmRlY29kZShzdHJpbmdPckJ1ZmZlcilcbiAgfVxuXG4gIGlzSW1wbGVtZW50ZWQgKCkge1xuICAgIHJldHVybiB0aGlzLmVuZ2luZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbXVsdGliYXNlL3NyYy9iYXNlLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBiYXNlLXggZW5jb2Rpbmdcbi8vIEZvcmtlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jcnlwdG9jb2luanMvYnM1OFxuLy8gT3JpZ2luYWxseSB3cml0dGVuIGJ5IE1pa2UgSGVhcm4gZm9yIEJpdGNvaW5KXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTEgR29vZ2xlIEluY1xuLy8gUG9ydGVkIHRvIEphdmFTY3JpcHQgYnkgU3RlZmFuIFRob21hc1xuLy8gTWVyZ2VkIEJ1ZmZlciByZWZhY3RvcmluZ3MgZnJvbSBiYXNlNTgtbmF0aXZlIGJ5IFN0ZXBoZW4gUGFpclxuLy8gQ29weXJpZ2h0IChjKSAyMDEzIEJpdFBheSBJbmNcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiYXNlIChBTFBIQUJFVCkge1xuICB2YXIgQUxQSEFCRVRfTUFQID0ge31cbiAgdmFyIEJBU0UgPSBBTFBIQUJFVC5sZW5ndGhcbiAgdmFyIExFQURFUiA9IEFMUEhBQkVULmNoYXJBdCgwKVxuXG4gIC8vIHByZS1jb21wdXRlIGxvb2t1cCB0YWJsZVxuICBmb3IgKHZhciB6ID0gMDsgeiA8IEFMUEhBQkVULmxlbmd0aDsgeisrKSB7XG4gICAgdmFyIHggPSBBTFBIQUJFVC5jaGFyQXQoeilcblxuICAgIGlmIChBTFBIQUJFVF9NQVBbeF0gIT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFR5cGVFcnJvcih4ICsgJyBpcyBhbWJpZ3VvdXMnKVxuICAgIEFMUEhBQkVUX01BUFt4XSA9IHpcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuY29kZSAoc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuXG4gICAgdmFyIGRpZ2l0cyA9IFswXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgKytpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMCwgY2FycnkgPSBzb3VyY2VbaV07IGogPCBkaWdpdHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgY2FycnkgKz0gZGlnaXRzW2pdIDw8IDhcbiAgICAgICAgZGlnaXRzW2pdID0gY2FycnkgJSBCQVNFXG4gICAgICAgIGNhcnJ5ID0gKGNhcnJ5IC8gQkFTRSkgfCAwXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcbiAgICAgICAgZGlnaXRzLnB1c2goY2FycnkgJSBCQVNFKVxuICAgICAgICBjYXJyeSA9IChjYXJyeSAvIEJBU0UpIHwgMFxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzdHJpbmcgPSAnJ1xuXG4gICAgLy8gZGVhbCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICBmb3IgKHZhciBrID0gMDsgc291cmNlW2tdID09PSAwICYmIGsgPCBzb3VyY2UubGVuZ3RoIC0gMTsgKytrKSBzdHJpbmcgKz0gQUxQSEFCRVRbMF1cbiAgICAvLyBjb252ZXJ0IGRpZ2l0cyB0byBhIHN0cmluZ1xuICAgIGZvciAodmFyIHEgPSBkaWdpdHMubGVuZ3RoIC0gMTsgcSA+PSAwOyAtLXEpIHN0cmluZyArPSBBTFBIQUJFVFtkaWdpdHNbcV1dXG5cbiAgICByZXR1cm4gc3RyaW5nXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGVVbnNhZmUgKHN0cmluZykge1xuICAgIGlmIChzdHJpbmcubGVuZ3RoID09PSAwKSByZXR1cm4gQnVmZmVyLmFsbG9jVW5zYWZlKDApXG5cbiAgICB2YXIgYnl0ZXMgPSBbMF1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gQUxQSEFCRVRfTUFQW3N0cmluZ1tpXV1cbiAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cblxuICAgICAgZm9yICh2YXIgaiA9IDAsIGNhcnJ5ID0gdmFsdWU7IGogPCBieXRlcy5sZW5ndGg7ICsraikge1xuICAgICAgICBjYXJyeSArPSBieXRlc1tqXSAqIEJBU0VcbiAgICAgICAgYnl0ZXNbal0gPSBjYXJyeSAmIDB4ZmZcbiAgICAgICAgY2FycnkgPj49IDhcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKGNhcnJ5ID4gMCkge1xuICAgICAgICBieXRlcy5wdXNoKGNhcnJ5ICYgMHhmZilcbiAgICAgICAgY2FycnkgPj49IDhcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZWFsIHdpdGggbGVhZGluZyB6ZXJvc1xuICAgIGZvciAodmFyIGsgPSAwOyBzdHJpbmdba10gPT09IExFQURFUiAmJiBrIDwgc3RyaW5nLmxlbmd0aCAtIDE7ICsraykge1xuICAgICAgYnl0ZXMucHVzaCgwKVxuICAgIH1cblxuICAgIHJldHVybiBCdWZmZXIuZnJvbShieXRlcy5yZXZlcnNlKCkpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUgKHN0cmluZykge1xuICAgIHZhciBidWZmZXIgPSBkZWNvZGVVbnNhZmUoc3RyaW5nKVxuICAgIGlmIChidWZmZXIpIHJldHVybiBidWZmZXJcblxuICAgIHRocm93IG5ldyBFcnJvcignTm9uLWJhc2UnICsgQkFTRSArICcgY2hhcmFjdGVyJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZW5jb2RlOiBlbmNvZGUsXG4gICAgZGVjb2RlVW5zYWZlOiBkZWNvZGVVbnNhZmUsXG4gICAgZGVjb2RlOiBkZWNvZGVcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbXVsdGliYXNlL25vZGVfbW9kdWxlcy9iYXNlLXgvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDIzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJhc2UxNiAoYWxwaGFiZXQpIHtcbiAgcmV0dXJuIHtcbiAgICBlbmNvZGUgKGlucHV0KSB7XG4gICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihpbnB1dCkudG9TdHJpbmcoJ2hleCcpXG4gICAgICB9XG4gICAgICByZXR1cm4gaW5wdXQudG9TdHJpbmcoJ2hleCcpXG4gICAgfSxcbiAgICBkZWNvZGUgKGlucHV0KSB7XG4gICAgICBmb3IgKGxldCBjaGFyIG9mIGlucHV0KSB7XG4gICAgICAgIGlmIChhbHBoYWJldC5pbmRleE9mKGNoYXIpIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBiYXNlMTYgY2hhcmFjdGVyJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoaW5wdXQsICdoZXgnKVxuICAgIH1cbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbXVsdGliYXNlL3NyYy9iYXNlMTYuanNcbi8vIG1vZHVsZSBpZCA9IDI0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIG11bHRpY29kZWMgc3BlY2lmaWNhdGlvbi5cbiAqXG4gKiBAbW9kdWxlIG11bHRpY29kZWNcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBtdWx0aWNvZGVjID0gcmVxdWlyZSgnbXVsdGljb2RlYycpXG4gKlxuICogY29uc3QgcHJlZml4ZWRQcm90b2J1ZiA9IG11bHRpY29kZWMuYWRkUHJlZml4KCdwcm90b2J1ZicsIHByb3RvYnVmQnVmZmVyKVxuICogLy8gcHJlZml4ZWRQcm90b2J1ZiAweDUwLi4uXG4gKlxuICovXG4ndXNlIHN0cmljdCdcblxuY29uc3QgdmFyaW50ID0gcmVxdWlyZSgndmFyaW50JylcbmNvbnN0IGNvZGVjTmFtZVRvQ29kZVZhcmludCA9IHJlcXVpcmUoJy4vdmFyaW50LXRhYmxlJylcbmNvbnN0IGNvZGVUb0NvZGVjTmFtZSA9IHJlcXVpcmUoJy4vbmFtZS10YWJsZScpXG5jb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzXG5cbi8qKlxuICogUHJlZml4IGEgYnVmZmVyIHdpdGggYSBtdWx0aWNvZGVjLXBhY2tlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IG11bHRpY29kZWNTdHJPckNvZGVcbiAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhXG4gKiBAcmV0dXJucyB7QnVmZmVyfVxuICovXG5leHBvcnRzLmFkZFByZWZpeCA9IChtdWx0aWNvZGVjU3RyT3JDb2RlLCBkYXRhKSA9PiB7XG4gIGxldCBwcmVmaXhcblxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG11bHRpY29kZWNTdHJPckNvZGUpKSB7XG4gICAgcHJlZml4ID0gdXRpbC52YXJpbnRCdWZmZXJFbmNvZGUobXVsdGljb2RlY1N0ck9yQ29kZSlcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29kZWNOYW1lVG9Db2RlVmFyaW50W211bHRpY29kZWNTdHJPckNvZGVdKSB7XG4gICAgICBwcmVmaXggPSBjb2RlY05hbWVUb0NvZGVWYXJpbnRbbXVsdGljb2RlY1N0ck9yQ29kZV1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtdWx0aWNvZGVjIG5vdCByZWNvZ25pemVkJylcbiAgICB9XG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW3ByZWZpeCwgZGF0YV0pXG59XG5cbi8qKlxuICogRGVjYXBzdWxhdGUgdGhlIG11bHRpY29kZWMtcGFja2VkIHByZWZpeCBmcm9tIHRoZSBkYXRhLlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhXG4gKiBAcmV0dXJucyB7QnVmZmVyfVxuICovXG5leHBvcnRzLnJtUHJlZml4ID0gKGRhdGEpID0+IHtcbiAgdmFyaW50LmRlY29kZShkYXRhKVxuICByZXR1cm4gZGF0YS5zbGljZSh2YXJpbnQuZGVjb2RlLmJ5dGVzKVxufVxuXG4vKipcbiAqIEdldCB0aGUgY29kZWMgb2YgdGhlIHByZWZpeGVkIGRhdGEuXG4gKiBAcGFyYW0ge0J1ZmZlcn0gcHJlZml4ZWREYXRhXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnRzLmdldENvZGVjID0gKHByZWZpeGVkRGF0YSkgPT4ge1xuICBjb25zdCBjb2RlID0gdXRpbC52YXJpbnRCdWZmZXJEZWNvZGUocHJlZml4ZWREYXRhKVxuICBjb25zdCBjb2RlY05hbWUgPSBjb2RlVG9Db2RlY05hbWVbY29kZS50b1N0cmluZygnaGV4JyldXG4gIHJldHVybiBjb2RlY05hbWVcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL211bHRpY29kZWMvc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCdcbmNvbnN0IGJhc2VUYWJsZSA9IHJlcXVpcmUoJy4vYmFzZS10YWJsZScpXG5cbi8vIHRoaXMgY3JlYXRlcyBhIG1hcCBmb3IgY29kZSBhcyBoZXhTdHJpbmcgLT4gY29kZWNOYW1lXG5cbmNvbnN0IG5hbWVUYWJsZSA9IHt9XG5tb2R1bGUuZXhwb3J0cyA9IG5hbWVUYWJsZVxuXG5mb3IgKGxldCBlbmNvZGluZ05hbWUgaW4gYmFzZVRhYmxlKSB7XG4gIGxldCBjb2RlID0gYmFzZVRhYmxlW2VuY29kaW5nTmFtZV1cbiAgbmFtZVRhYmxlW2NvZGUudG9TdHJpbmcoJ2hleCcpXSA9IGVuY29kaW5nTmFtZVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbXVsdGljb2RlYy9zcmMvbmFtZS10YWJsZS5qc1xuLy8gbW9kdWxlIGlkID0gMjZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IENJRCA9IHJlcXVpcmUoJ2NpZHMnKVxuXG5jb25zdCBjaWRTeW1ib2wgPSBTeW1ib2wuZm9yKCdtZXJrbGluZyNjaWQnKVxuY29uc3Qgc3RhdHVzU3ltYm9sID0gU3ltYm9sLmZvcignbWVya2xpbmcjc3RhdHVzJylcblxuY29uc3QgSXBsZFByb3h5RXh0ZW5zaW9uID0ge1xuICBnZXQgKHRhcmdldCwga2V5KSB7XG4gICAgaWYgKGtleSA9PT0gY2lkU3ltYm9sKSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSB0YXJnZXRbc3RhdHVzU3ltYm9sXVxuICAgICAgaWYgKHN0YXR1cyA9PT0gJ1VOTE9BREVEJyB8fCBzdGF0dXMgPT09ICdTQVZFRCcpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFtjaWRTeW1ib2xdXG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0dXMgPT09ICdESVJUWScpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0NhblxcJ3QgcmVhZCBDSUQgb2YgdW5sb2FkZWQgaXBsZCBub2RlJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoa2V5ID09PSAnX2NpZCcpIHtcbiAgICAgIHJldHVybiB0YXJnZXRbY2lkU3ltYm9sXVxuICAgIH1cblxuICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJyB8fCBrZXkgPT09ICdpbnNwZWN0Jykge1xuICAgICAgcmV0dXJuIHRhcmdldFtrZXldXG4gICAgfVxuXG4gICAgaWYgKCF0YXJnZXRbc3RhdHVzU3ltYm9sXSkge1xuICAgICAgdGhyb3cgRXJyb3IoYElQTEQgbm9kZSA8JHt0YXJnZXRbY2lkU3ltYm9sXS50b0Jhc2VFbmNvZGVkU3RyaW5nfT4gbm90IGxvYWRlZCBzbyBhY2Nlc3MgJyR7a2V5LnRvU3RyaW5nKCl9JyBmYWlsZWRgKVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRba2V5XVxuICB9LFxuXG4gIHNldCAodGFyZ2V0LCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKGtleSA9PT0gc3RhdHVzU3ltYm9sIHx8IGtleSA9PT0gY2lkU3ltYm9sKSB7XG4gICAgICBSZWZsZWN0LnNldCguLi5hcmd1bWVudHMpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmICh0YXJnZXRbc3RhdHVzU3ltYm9sXSA9PT0gJ1NBVkVEJykge1xuICAgICAgdGFyZ2V0W2NpZFN5bWJvbF0gPSB1bmRlZmluZWRcbiAgICAgIHRhcmdldFtzdGF0dXNTeW1ib2xdID0gJ0RJUlRZJ1xuICAgICAgUmVmbGVjdC5zZXQoLi4uYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0W3N0YXR1c1N5bWJvbF0gPT09ICdVTkxPQURFRCcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFJlZmxlY3Quc2V0KC4uLmFyZ3VtZW50cylcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbmNsYXNzIElwbGRQcm94eSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLlVOTE9BREVEID0gJ1VOTE9BREVEJ1xuICAgIHRoaXMuU0FWRUQgPSAnU0FWRUQnXG4gICAgdGhpcy5ESVJUWSA9ICdESVJUWSdcbiAgICB0aGlzLlRFTVAgPSAnVEVNUCdcblxuICAgIHRoaXMuYWxsb3dlZFN0YXR1c2VzID0gW3RoaXMuVU5MT0FERUQsIHRoaXMuU0FWRUQsIHRoaXMuRElSVFldXG4gIH1cblxuICBpc0lwbGQgKG9iaikge1xuICAgIHJldHVybiB0aGlzLmFsbG93ZWRTdGF0dXNlcy5pbmNsdWRlcyhvYmpbc3RhdHVzU3ltYm9sXSlcbiAgfVxuXG4gIGlzUGVyc2lzdGVkIChvYmopIHtcbiAgICByZXR1cm4gb2JqW3N0YXR1c1N5bWJvbF0gPT09IHRoaXMuVU5MT0FERUQgfHwgb2JqW3N0YXR1c1N5bWJvbF0gPT09IHRoaXMuU0FWRURcbiAgfVxuXG4gIGNyZWF0ZSAoY2lkLCBzdGF0dXMsIG9iaikge1xuICAgIGlmICghdGhpcy5hbGxvd2VkU3RhdHVzZXMuaW5jbHVkZXMoc3RhdHVzKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1VucmVjb2duaXplZCBzdGF0dXMgJyArIHN0YXR1cylcbiAgICB9XG5cbiAgICBvYmpbY2lkU3ltYm9sXSA9IGNpZFxuICAgIG9ialtzdGF0dXNTeW1ib2xdID0gc3RhdHVzXG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIElwbGRQcm94eUV4dGVuc2lvbilcbiAgfVxuXG4gIGNyZWF0ZURpcnR5Tm9kZSAob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKG51bGwsIHRoaXMuRElSVFksIG9iailcbiAgfVxuXG4gIGNyZWF0ZVNhdmVkTm9kZSAoY2lkLCBvYmopIHtcbiAgICBjb25zdCBpZCA9IENJRC5pc0NJRChjaWQpID8gY2lkIDogbmV3IENJRChjaWQpXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKGlkLCB0aGlzLlNBVkVELCBvYmopXG4gIH1cblxuICBjcmVhdGVMaW5rTm9kZSAoY2lkKSB7XG4gICAgY29uc3QgaWQgPSBDSUQuaXNDSUQoY2lkKSA/IGNpZCA6IG5ldyBDSUQoY2lkKVxuXG4gICAgY29uc3QgbGlua09iaiA9IHtcbiAgICAgICcvJzogaWQudG9CYXNlRW5jb2RlZFN0cmluZygpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKGlkLCB0aGlzLlVOTE9BREVELCBsaW5rT2JqKVxuICB9XG5cbiAgcmVhZENJRCAob2JqKSB7XG4gICAgcmV0dXJuIG9ialtjaWRTeW1ib2xdXG4gIH1cblxuICB0cmFuc2l0aW9uIChub2RlLCBvcHRpb25zKSB7XG4gICAgY29uc3QgeyB0cmFuc2l0aW9uIH0gPSBvcHRpb25zXG4gICAgc3dpdGNoICh0cmFuc2l0aW9uKSB7XG4gICAgICBjYXNlICdsb2FkJzpcbiAgICAgICAgaWYgKG5vZGVbc3RhdHVzU3ltYm9sXSAhPT0gdGhpcy5VTkxPQURFRCkge1xuICAgICAgICAgIHRocm93IEVycm9yKGBUcmFuc2l0aW9uIG5vdCBhbGxvd2VkICR7dHJhbnNpdGlvbn0gaW4gc3RhdGUgJHtub2RlW3N0YXR1c1N5bWJvbF19YClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRMaW5rKG5vZGUsIG9wdGlvbnMpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzYXZlJzpcbiAgICAgICAgaWYgKG5vZGVbc3RhdHVzU3ltYm9sXSAhPT0gdGhpcy5ESVJUWSkge1xuICAgICAgICAgIHRocm93IEVycm9yKGBUcmFuc2l0aW9uIG5vdCBhbGxvd2VkICR7dHJhbnNpdGlvbn0gaW4gc3RhdGUgJHtub2RlW3N0YXR1c1N5bWJvbF19YClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NhdmVEaXJ0eShub2RlLCBvcHRpb25zKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua293biB0cmFuc2l0aW9uICcgKyB0cmFuc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGV4dHJhY3QgKG9iaikge1xuICAgIGlmICghdGhpcy5pc0lwbGQob2JqKSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG9iailcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc3RhdHVzID0gb2JqW3N0YXR1c1N5bWJvbF1cbiAgICAgIG9ialtzdGF0dXNTeW1ib2xdID0gdGhpcy5URU1QXG4gICAgICBjb25zdCBvYmpDb3B5ID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqKVxuICAgICAgZGVsZXRlIG9iakNvcHlbc3RhdHVzU3ltYm9sXVxuICAgICAgZGVsZXRlIG9iakNvcHlbY2lkU3ltYm9sXVxuICAgICAgb2JqW3N0YXR1c1N5bWJvbF0gPSBzdGF0dXNcbiAgICAgIHJldHVybiBvYmpDb3B5XG4gICAgfVxuICB9XG5cbiAgX2xvYWRMaW5rIChub2RlLCB7IG9iamVjdCB9KSB7XG4gICAgbm9kZVtzdGF0dXNTeW1ib2xdID0gbnVsbFxuICAgIGRlbGV0ZSBub2RlWycvJ11cbiAgICBPYmplY3QuYXNzaWduKG5vZGUsIG9iamVjdClcbiAgICBub2RlW3N0YXR1c1N5bWJvbF0gPSB0aGlzLlNBVkVEXG4gIH1cblxuICBfc2F2ZURpcnR5IChub2RlLCB7IGNpZCB9KSB7XG4gICAgbm9kZVtzdGF0dXNTeW1ib2xdID0gdGhpcy5TQVZFRFxuICAgIG5vZGVbY2lkU3ltYm9sXSA9IGNpZFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBJcGxkUHJveHk6IElwbGRQcm94eVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaXBsZC5qc1xuLy8gbW9kdWxlIGlkID0gMjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==