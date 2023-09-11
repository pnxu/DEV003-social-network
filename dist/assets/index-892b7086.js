(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const style = "";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const stringToByteArray$1 = function(str) {
  const out = [];
  let p2 = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      out[p2++] = c;
    } else if (c < 2048) {
      out[p2++] = c >> 6 | 192;
      out[p2++] = c & 63 | 128;
    } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      out[p2++] = c >> 18 | 240;
      out[p2++] = c >> 12 & 63 | 128;
      out[p2++] = c >> 6 & 63 | 128;
      out[p2++] = c & 63 | 128;
    } else {
      out[p2++] = c >> 12 | 224;
      out[p2++] = c >> 6 & 63 | 128;
      out[p2++] = c & 63 | 128;
    }
  }
  return out;
};
const byteArrayToString = function(bytes) {
  const out = [];
  let pos = 0, c = 0;
  while (pos < bytes.length) {
    const c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else if (c1 > 239 && c1 < 365) {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
      out[c++] = String.fromCharCode(55296 + (u >> 10));
      out[c++] = String.fromCharCode(56320 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join("");
};
const base64 = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob === "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(input, webSafe) {
    if (!Array.isArray(input)) {
      throw Error("encodeByteArray takes an array as a parameter");
    }
    this.init_();
    const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
    const output = [];
    for (let i = 0; i < input.length; i += 3) {
      const byte1 = input[i];
      const haveByte2 = i + 1 < input.length;
      const byte2 = haveByte2 ? input[i + 1] : 0;
      const haveByte3 = i + 2 < input.length;
      const byte3 = haveByte3 ? input[i + 2] : 0;
      const outByte1 = byte1 >> 2;
      const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
      let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
      let outByte4 = byte3 & 63;
      if (!haveByte3) {
        outByte4 = 64;
        if (!haveByte2) {
          outByte3 = 64;
        }
      }
      output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
    }
    return output.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return btoa(input);
    }
    return this.encodeByteArray(stringToByteArray$1(input), webSafe);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(input, webSafe) {
    if (this.HAS_NATIVE_SUPPORT && !webSafe) {
      return atob(input);
    }
    return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(input, webSafe) {
    this.init_();
    const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
    const output = [];
    for (let i = 0; i < input.length; ) {
      const byte1 = charToByteMap[input.charAt(i++)];
      const haveByte2 = i < input.length;
      const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
      ++i;
      const haveByte3 = i < input.length;
      const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      const haveByte4 = i < input.length;
      const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
      ++i;
      if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
        throw new DecodeBase64StringError();
      }
      const outByte1 = byte1 << 2 | byte2 >> 4;
      output.push(outByte1);
      if (byte3 !== 64) {
        const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
        output.push(outByte2);
        if (byte4 !== 64) {
          const outByte3 = byte3 << 6 & 192 | byte4;
          output.push(outByte3);
        }
      }
    }
    return output;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {};
      this.charToByteMap_ = {};
      this.byteToCharMapWebSafe_ = {};
      this.charToByteMapWebSafe_ = {};
      for (let i = 0; i < this.ENCODED_VALS.length; i++) {
        this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
        this.charToByteMap_[this.byteToCharMap_[i]] = i;
        this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
        this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
        if (i >= this.ENCODED_VALS_BASE.length) {
          this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
          this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
        }
      }
    }
  }
};
class DecodeBase64StringError extends Error {
  constructor() {
    super(...arguments);
    this.name = "DecodeBase64StringError";
  }
}
const base64Encode = function(str) {
  const utf8Bytes = stringToByteArray$1(str);
  return base64.encodeByteArray(utf8Bytes, true);
};
const base64urlEncodeWithoutPadding = function(str) {
  return base64Encode(str).replace(/\./g, "");
};
const base64Decode = function(str) {
  try {
    return base64.decodeString(str, true);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getGlobal() {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("Unable to locate global object.");
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
const getDefaultsFromEnvVariable = () => {
  if (typeof process === "undefined" || typeof process.env === "undefined") {
    return;
  }
  const defaultsJsonString = {}.__FIREBASE_DEFAULTS__;
  if (defaultsJsonString) {
    return JSON.parse(defaultsJsonString);
  }
};
const getDefaultsFromCookie = () => {
  if (typeof document === "undefined") {
    return;
  }
  let match;
  try {
    match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch (e) {
    return;
  }
  const decoded = match && base64Decode(match[1]);
  return decoded && JSON.parse(decoded);
};
const getDefaults = () => {
  try {
    return getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
  } catch (e) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
    return;
  }
};
const getDefaultEmulatorHost = (productName) => {
  var _a, _b;
  return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName];
};
const getDefaultEmulatorHostnameAndPort = (productName) => {
  const host = getDefaultEmulatorHost(productName);
  if (!host) {
    return void 0;
  }
  const separatorIndex = host.lastIndexOf(":");
  if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
    throw new Error(`Invalid host ${host} with no separate hostname and port!`);
  }
  const port = parseInt(host.substring(separatorIndex + 1), 10);
  if (host[0] === "[") {
    return [host.substring(1, separatorIndex - 1), port];
  } else {
    return [host.substring(0, separatorIndex), port];
  }
};
const getDefaultAppConfig = () => {
  var _a;
  return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
};
const getExperimentalSetting = (name2) => {
  var _a;
  return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a[`_${name2}`];
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Deferred {
  constructor() {
    this.reject = () => {
    };
    this.resolve = () => {
    };
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  /**
   * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(callback) {
    return (error, value) => {
      if (error) {
        this.reject(error);
      } else {
        this.resolve(value);
      }
      if (typeof callback === "function") {
        this.promise.catch(() => {
        });
        if (callback.length === 1) {
          callback(error);
        } else {
          callback(error, value);
        }
      }
    };
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function createMockUserToken(token, projectId) {
  if (token.uid) {
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  }
  const header = {
    alg: "none",
    type: "JWT"
  };
  const project = projectId || "demo-project";
  const iat = token.iat || 0;
  const sub = token.sub || token.user_id;
  if (!sub) {
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  }
  const payload = Object.assign({
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${project}`,
    aud: project,
    iat,
    exp: iat + 3600,
    auth_time: iat,
    sub,
    user_id: sub,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    }
  }, token);
  const signature = "";
  return [
    base64urlEncodeWithoutPadding(JSON.stringify(header)),
    base64urlEncodeWithoutPadding(JSON.stringify(payload)),
    signature
  ].join(".");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getUA() {
  if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") {
    return navigator["userAgent"];
  } else {
    return "";
  }
}
function isMobileCordova() {
  return typeof window !== "undefined" && // @ts-ignore Setting up an broadly applicable index signature for Window
  // just to deal with this case would probably be a bad idea.
  !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
function isBrowserExtension() {
  const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : void 0;
  return typeof runtime === "object" && runtime.id !== void 0;
}
function isReactNative() {
  return typeof navigator === "object" && navigator["product"] === "ReactNative";
}
function isIE() {
  const ua2 = getUA();
  return ua2.indexOf("MSIE ") >= 0 || ua2.indexOf("Trident/") >= 0;
}
function isIndexedDBAvailable() {
  try {
    return typeof indexedDB === "object";
  } catch (e) {
    return false;
  }
}
function validateIndexedDBOpenable() {
  return new Promise((resolve, reject) => {
    try {
      let preExist = true;
      const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
      const request = self.indexedDB.open(DB_CHECK_NAME);
      request.onsuccess = () => {
        request.result.close();
        if (!preExist) {
          self.indexedDB.deleteDatabase(DB_CHECK_NAME);
        }
        resolve(true);
      };
      request.onupgradeneeded = () => {
        preExist = false;
      };
      request.onerror = () => {
        var _a;
        reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || "");
      };
    } catch (error) {
      reject(error);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERROR_NAME = "FirebaseError";
class FirebaseError extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
}
class ErrorFactory {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template = this.errors[code];
    const message = template ? replaceTemplate(template, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error = new FirebaseError(fullCode, fullMessage, customData);
    return error;
  }
}
function replaceTemplate(template, data) {
  return template.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
const PATTERN = /\{\$([^}]+)}/g;
function isEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}
function deepEqual(a, b2) {
  if (a === b2) {
    return true;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b2);
  for (const k2 of aKeys) {
    if (!bKeys.includes(k2)) {
      return false;
    }
    const aProp = a[k2];
    const bProp = b2[k2];
    if (isObject(aProp) && isObject(bProp)) {
      if (!deepEqual(aProp, bProp)) {
        return false;
      }
    } else if (aProp !== bProp) {
      return false;
    }
  }
  for (const k2 of bKeys) {
    if (!aKeys.includes(k2)) {
      return false;
    }
  }
  return true;
}
function isObject(thing) {
  return thing !== null && typeof thing === "object";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function querystring(querystringParams) {
  const params = [];
  for (const [key, value] of Object.entries(querystringParams)) {
    if (Array.isArray(value)) {
      value.forEach((arrayVal) => {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(arrayVal));
      });
    } else {
      params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  }
  return params.length ? "&" + params.join("&") : "";
}
function querystringDecode(querystring2) {
  const obj = {};
  const tokens = querystring2.replace(/^\?/, "").split("&");
  tokens.forEach((token) => {
    if (token) {
      const [key, value] = token.split("=");
      obj[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return obj;
}
function extractQuerystring(url) {
  const queryStart = url.indexOf("?");
  if (!queryStart) {
    return "";
  }
  const fragmentStart = url.indexOf("#", queryStart);
  return url.substring(queryStart, fragmentStart > 0 ? fragmentStart : void 0);
}
function createSubscribe(executor, onNoObservers) {
  const proxy = new ObserverProxy(executor, onNoObservers);
  return proxy.subscribe.bind(proxy);
}
class ObserverProxy {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(executor, onNoObservers) {
    this.observers = [];
    this.unsubscribes = [];
    this.observerCount = 0;
    this.task = Promise.resolve();
    this.finalized = false;
    this.onNoObservers = onNoObservers;
    this.task.then(() => {
      executor(this);
    }).catch((e) => {
      this.error(e);
    });
  }
  next(value) {
    this.forEachObserver((observer2) => {
      observer2.next(value);
    });
  }
  error(error) {
    this.forEachObserver((observer2) => {
      observer2.error(error);
    });
    this.close(error);
  }
  complete() {
    this.forEachObserver((observer2) => {
      observer2.complete();
    });
    this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber sychronously to their
   *   call to subscribe().
   */
  subscribe(nextOrObserver, error, complete) {
    let observer2;
    if (nextOrObserver === void 0 && error === void 0 && complete === void 0) {
      throw new Error("Missing Observer.");
    }
    if (implementsAnyMethods(nextOrObserver, [
      "next",
      "error",
      "complete"
    ])) {
      observer2 = nextOrObserver;
    } else {
      observer2 = {
        next: nextOrObserver,
        error,
        complete
      };
    }
    if (observer2.next === void 0) {
      observer2.next = noop;
    }
    if (observer2.error === void 0) {
      observer2.error = noop;
    }
    if (observer2.complete === void 0) {
      observer2.complete = noop;
    }
    const unsub = this.unsubscribeOne.bind(this, this.observers.length);
    if (this.finalized) {
      this.task.then(() => {
        try {
          if (this.finalError) {
            observer2.error(this.finalError);
          } else {
            observer2.complete();
          }
        } catch (e) {
        }
        return;
      });
    }
    this.observers.push(observer2);
    return unsub;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(i) {
    if (this.observers === void 0 || this.observers[i] === void 0) {
      return;
    }
    delete this.observers[i];
    this.observerCount -= 1;
    if (this.observerCount === 0 && this.onNoObservers !== void 0) {
      this.onNoObservers(this);
    }
  }
  forEachObserver(fn2) {
    if (this.finalized) {
      return;
    }
    for (let i = 0; i < this.observers.length; i++) {
      this.sendOne(i, fn2);
    }
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(i, fn2) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[i] !== void 0) {
        try {
          fn2(this.observers[i]);
        } catch (e) {
          if (typeof console !== "undefined" && console.error) {
            console.error(e);
          }
        }
      }
    });
  }
  close(err) {
    if (this.finalized) {
      return;
    }
    this.finalized = true;
    if (err !== void 0) {
      this.finalError = err;
    }
    this.task.then(() => {
      this.observers = void 0;
      this.onNoObservers = void 0;
    });
  }
}
function implementsAnyMethods(obj, methods) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  for (const method of methods) {
    if (method in obj && typeof obj[method] === "function") {
      return true;
    }
  }
  return false;
}
function noop() {
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}
class Component {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(name2, instanceFactory, type) {
    this.name = name2;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Provider {
  constructor(name2, container) {
    this.name = name2;
    this.container = container;
    this.component = null;
    this.instances = /* @__PURE__ */ new Map();
    this.instancesDeferred = /* @__PURE__ */ new Map();
    this.instancesOptions = /* @__PURE__ */ new Map();
    this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide mulitple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    if (!this.instancesDeferred.has(normalizedIdentifier)) {
      const deferred = new Deferred();
      this.instancesDeferred.set(normalizedIdentifier, deferred);
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          if (instance) {
            deferred.resolve(instance);
          }
        } catch (e) {
        }
      }
    }
    return this.instancesDeferred.get(normalizedIdentifier).promise;
  }
  getImmediate(options) {
    var _a;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
    const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
    if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
      try {
        return this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
      } catch (e) {
        if (optional) {
          return null;
        } else {
          throw e;
        }
      }
    } else {
      if (optional) {
        return null;
      } else {
        throw Error(`Service ${this.name} is not available`);
      }
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(component) {
    if (component.name !== this.name) {
      throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
    }
    if (this.component) {
      throw Error(`Component for ${this.name} has already been provided`);
    }
    this.component = component;
    if (!this.shouldAutoInitialize()) {
      return;
    }
    if (isComponentEager(component)) {
      try {
        this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
      } catch (e) {
      }
    }
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      try {
        const instance = this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
        instanceDeferred.resolve(instance);
      } catch (e) {
      }
    }
  }
  clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
    this.instancesDeferred.delete(identifier);
    this.instancesOptions.delete(identifier);
    this.instances.delete(identifier);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const services = Array.from(this.instances.values());
    await Promise.all([
      ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
      ...services.filter((service) => "_delete" in service).map((service) => service._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
    return this.instances.has(identifier);
  }
  getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
    return this.instancesOptions.get(identifier) || {};
  }
  initialize(opts = {}) {
    const { options = {} } = opts;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
    if (this.isInitialized(normalizedIdentifier)) {
      throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
    }
    if (!this.isComponentSet()) {
      throw Error(`Component ${this.name} has not been registered yet`);
    }
    const instance = this.getOrInitializeService({
      instanceIdentifier: normalizedIdentifier,
      options
    });
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      if (normalizedIdentifier === normalizedDeferredIdentifier) {
        instanceDeferred.resolve(instance);
      }
    }
    return instance;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(callback, identifier) {
    var _a;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : /* @__PURE__ */ new Set();
    existingCallbacks.add(callback);
    this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
    const existingInstance = this.instances.get(normalizedIdentifier);
    if (existingInstance) {
      callback(existingInstance, normalizedIdentifier);
    }
    return () => {
      existingCallbacks.delete(callback);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(instance, identifier) {
    const callbacks = this.onInitCallbacks.get(identifier);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      try {
        callback(instance, identifier);
      } catch (_a) {
      }
    }
  }
  getOrInitializeService({ instanceIdentifier, options = {} }) {
    let instance = this.instances.get(instanceIdentifier);
    if (!instance && this.component) {
      instance = this.component.instanceFactory(this.container, {
        instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
        options
      });
      this.instances.set(instanceIdentifier, instance);
      this.instancesOptions.set(instanceIdentifier, options);
      this.invokeOnInitCallbacks(instance, instanceIdentifier);
      if (this.component.onInstanceCreated) {
        try {
          this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
        } catch (_a) {
        }
      }
    }
    return instance || null;
  }
  normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
    if (this.component) {
      return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
    } else {
      return identifier;
    }
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function normalizeIdentifierForFactory(identifier) {
  return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
}
function isComponentEager(component) {
  return component.instantiationMode === "EAGER";
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ComponentContainer {
  constructor(name2) {
    this.name = name2;
    this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(component) {
    const provider2 = this.getProvider(component.name);
    if (provider2.isComponentSet()) {
      throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
    }
    provider2.setComponent(component);
  }
  addOrOverwriteComponent(component) {
    const provider2 = this.getProvider(component.name);
    if (provider2.isComponentSet()) {
      this.providers.delete(component.name);
    }
    this.addComponent(component);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(name2) {
    if (this.providers.has(name2)) {
      return this.providers.get(name2);
    }
    const provider2 = new Provider(name2, this);
    this.providers.set(name2, provider2);
    return provider2;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
const levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
const defaultLogLevel = LogLevel.INFO;
const ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
const defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
class Logger {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(name2) {
    this.name = name2;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
}
const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
function getIdbProxyableTypes() {
  return idbProxyableTypes || (idbProxyableTypes = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function getCursorAdvanceMethods() {
  return cursorAdvanceMethods || (cursorAdvanceMethods = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const cursorRequestMap = /* @__PURE__ */ new WeakMap();
const transactionDoneMap = /* @__PURE__ */ new WeakMap();
const transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
const transformCache = /* @__PURE__ */ new WeakMap();
const reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
  const promise = new Promise((resolve, reject) => {
    const unlisten = () => {
      request.removeEventListener("success", success);
      request.removeEventListener("error", error);
    };
    const success = () => {
      resolve(wrap(request.result));
      unlisten();
    };
    const error = () => {
      reject(request.error);
      unlisten();
    };
    request.addEventListener("success", success);
    request.addEventListener("error", error);
  });
  promise.then((value) => {
    if (value instanceof IDBCursor) {
      cursorRequestMap.set(value, request);
    }
  }).catch(() => {
  });
  reverseTransformCache.set(promise, request);
  return promise;
}
function cacheDonePromiseForTransaction(tx) {
  if (transactionDoneMap.has(tx))
    return;
  const done = new Promise((resolve, reject) => {
    const unlisten = () => {
      tx.removeEventListener("complete", complete);
      tx.removeEventListener("error", error);
      tx.removeEventListener("abort", error);
    };
    const complete = () => {
      resolve();
      unlisten();
    };
    const error = () => {
      reject(tx.error || new DOMException("AbortError", "AbortError"));
      unlisten();
    };
    tx.addEventListener("complete", complete);
    tx.addEventListener("error", error);
    tx.addEventListener("abort", error);
  });
  transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
  get(target, prop, receiver) {
    if (target instanceof IDBTransaction) {
      if (prop === "done")
        return transactionDoneMap.get(target);
      if (prop === "objectStoreNames") {
        return target.objectStoreNames || transactionStoreNamesMap.get(target);
      }
      if (prop === "store") {
        return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
      }
    }
    return wrap(target[prop]);
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
  has(target, prop) {
    if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
      return true;
    }
    return prop in target;
  }
};
function replaceTraps(callback) {
  idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
  if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) {
    return function(storeNames, ...args) {
      const tx = func.call(unwrap(this), storeNames, ...args);
      transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
      return wrap(tx);
    };
  }
  if (getCursorAdvanceMethods().includes(func)) {
    return function(...args) {
      func.apply(unwrap(this), args);
      return wrap(cursorRequestMap.get(this));
    };
  }
  return function(...args) {
    return wrap(func.apply(unwrap(this), args));
  };
}
function transformCachableValue(value) {
  if (typeof value === "function")
    return wrapFunction(value);
  if (value instanceof IDBTransaction)
    cacheDonePromiseForTransaction(value);
  if (instanceOfAny(value, getIdbProxyableTypes()))
    return new Proxy(value, idbProxyTraps);
  return value;
}
function wrap(value) {
  if (value instanceof IDBRequest)
    return promisifyRequest(value);
  if (transformCache.has(value))
    return transformCache.get(value);
  const newValue = transformCachableValue(value);
  if (newValue !== value) {
    transformCache.set(value, newValue);
    reverseTransformCache.set(newValue, value);
  }
  return newValue;
}
const unwrap = (value) => reverseTransformCache.get(value);
function openDB(name2, version2, { blocked, upgrade, blocking, terminated } = {}) {
  const request = indexedDB.open(name2, version2);
  const openPromise = wrap(request);
  if (upgrade) {
    request.addEventListener("upgradeneeded", (event) => {
      upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
    });
  }
  if (blocked) {
    request.addEventListener("blocked", (event) => blocked(
      // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
      event.oldVersion,
      event.newVersion,
      event
    ));
  }
  openPromise.then((db2) => {
    if (terminated)
      db2.addEventListener("close", () => terminated());
    if (blocking) {
      db2.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
    }
  }).catch(() => {
  });
  return openPromise;
}
const readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
const writeMethods = ["put", "add", "delete", "clear"];
const cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
  if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
    return;
  }
  if (cachedMethods.get(prop))
    return cachedMethods.get(prop);
  const targetFuncName = prop.replace(/FromIndex$/, "");
  const useIndex = prop !== targetFuncName;
  const isWrite = writeMethods.includes(targetFuncName);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
  ) {
    return;
  }
  const method = async function(storeName, ...args) {
    const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
    let target2 = tx.store;
    if (useIndex)
      target2 = target2.index(args.shift());
    return (await Promise.all([
      target2[targetFuncName](...args),
      isWrite && tx.done
    ]))[0];
  };
  cachedMethods.set(prop, method);
  return method;
}
replaceTraps((oldTraps) => ({
  ...oldTraps,
  get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
  has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class PlatformLoggerServiceImpl {
  constructor(container) {
    this.container = container;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    const providers = this.container.getProviders();
    return providers.map((provider2) => {
      if (isVersionServiceProvider(provider2)) {
        const service = provider2.getImmediate();
        return `${service.library}/${service.version}`;
      } else {
        return null;
      }
    }).filter((logString) => logString).join(" ");
  }
}
function isVersionServiceProvider(provider2) {
  const component = provider2.getComponent();
  return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
}
const name$o = "@firebase/app";
const version$1$1 = "0.9.13";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logger = new Logger("@firebase/app");
const name$n = "@firebase/app-compat";
const name$m = "@firebase/analytics-compat";
const name$l = "@firebase/analytics";
const name$k = "@firebase/app-check-compat";
const name$j = "@firebase/app-check";
const name$i = "@firebase/auth";
const name$h = "@firebase/auth-compat";
const name$g = "@firebase/database";
const name$f = "@firebase/database-compat";
const name$e = "@firebase/functions";
const name$d = "@firebase/functions-compat";
const name$c = "@firebase/installations";
const name$b = "@firebase/installations-compat";
const name$a = "@firebase/messaging";
const name$9 = "@firebase/messaging-compat";
const name$8 = "@firebase/performance";
const name$7 = "@firebase/performance-compat";
const name$6 = "@firebase/remote-config";
const name$5 = "@firebase/remote-config-compat";
const name$4 = "@firebase/storage";
const name$3 = "@firebase/storage-compat";
const name$2 = "@firebase/firestore";
const name$1$1 = "@firebase/firestore-compat";
const name$p = "firebase";
const version$2 = "9.23.0";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ENTRY_NAME = "[DEFAULT]";
const PLATFORM_LOG_STRING = {
  [name$o]: "fire-core",
  [name$n]: "fire-core-compat",
  [name$l]: "fire-analytics",
  [name$m]: "fire-analytics-compat",
  [name$j]: "fire-app-check",
  [name$k]: "fire-app-check-compat",
  [name$i]: "fire-auth",
  [name$h]: "fire-auth-compat",
  [name$g]: "fire-rtdb",
  [name$f]: "fire-rtdb-compat",
  [name$e]: "fire-fn",
  [name$d]: "fire-fn-compat",
  [name$c]: "fire-iid",
  [name$b]: "fire-iid-compat",
  [name$a]: "fire-fcm",
  [name$9]: "fire-fcm-compat",
  [name$8]: "fire-perf",
  [name$7]: "fire-perf-compat",
  [name$6]: "fire-rc",
  [name$5]: "fire-rc-compat",
  [name$4]: "fire-gcs",
  [name$3]: "fire-gcs-compat",
  [name$2]: "fire-fst",
  [name$1$1]: "fire-fst-compat",
  "fire-js": "fire-js",
  [name$p]: "fire-js-all"
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _apps = /* @__PURE__ */ new Map();
const _components = /* @__PURE__ */ new Map();
function _addComponent(app2, component) {
  try {
    app2.container.addComponent(component);
  } catch (e) {
    logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app2.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app2 of _apps.values()) {
    _addComponent(app2, component);
  }
  return true;
}
function _getProvider(app2, name2) {
  const heartbeatController = app2.container.getProvider("heartbeat").getImmediate({ optional: true });
  if (heartbeatController) {
    void heartbeatController.triggerHeartbeat();
  }
  return app2.container.getProvider(name2);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ERRORS = {
  [
    "no-app"
    /* AppError.NO_APP */
  ]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
  [
    "bad-app-name"
    /* AppError.BAD_APP_NAME */
  ]: "Illegal App name: '{$appName}",
  [
    "duplicate-app"
    /* AppError.DUPLICATE_APP */
  ]: "Firebase App named '{$appName}' already exists with different options or config",
  [
    "app-deleted"
    /* AppError.APP_DELETED */
  ]: "Firebase App named '{$appName}' already deleted",
  [
    "no-options"
    /* AppError.NO_OPTIONS */
  ]: "Need to provide options, when not being deployed to hosting via source.",
  [
    "invalid-app-argument"
    /* AppError.INVALID_APP_ARGUMENT */
  ]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  [
    "invalid-log-argument"
    /* AppError.INVALID_LOG_ARGUMENT */
  ]: "First argument to `onLog` must be null or a function.",
  [
    "idb-open"
    /* AppError.IDB_OPEN */
  ]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-get"
    /* AppError.IDB_GET */
  ]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-set"
    /* AppError.IDB_WRITE */
  ]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  [
    "idb-delete"
    /* AppError.IDB_DELETE */
  ]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."
};
const ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FirebaseAppImpl {
  constructor(options, config, container) {
    this._isDeleted = false;
    this._options = Object.assign({}, options);
    this._config = Object.assign({}, config);
    this._name = config.name;
    this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
    this._container = container;
    this.container.addComponent(new Component(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    this.checkDestroyed();
    return this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(val) {
    this.checkDestroyed();
    this._automaticDataCollectionEnabled = val;
  }
  get name() {
    this.checkDestroyed();
    return this._name;
  }
  get options() {
    this.checkDestroyed();
    return this._options;
  }
  get config() {
    this.checkDestroyed();
    return this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(val) {
    this._isDeleted = val;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted) {
      throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
    }
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const SDK_VERSION = version$2;
function initializeApp(_options, rawConfig = {}) {
  let options = _options;
  if (typeof rawConfig !== "object") {
    const name3 = rawConfig;
    rawConfig = { name: name3 };
  }
  const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
  const name2 = config.name;
  if (typeof name2 !== "string" || !name2) {
    throw ERROR_FACTORY.create("bad-app-name", {
      appName: String(name2)
    });
  }
  options || (options = getDefaultAppConfig());
  if (!options) {
    throw ERROR_FACTORY.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  }
  const existingApp = _apps.get(name2);
  if (existingApp) {
    if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) {
      return existingApp;
    } else {
      throw ERROR_FACTORY.create("duplicate-app", { appName: name2 });
    }
  }
  const container = new ComponentContainer(name2);
  for (const component of _components.values()) {
    container.addComponent(component);
  }
  const newApp = new FirebaseAppImpl(options, config, container);
  _apps.set(name2, newApp);
  return newApp;
}
function getApp(name2 = DEFAULT_ENTRY_NAME) {
  const app2 = _apps.get(name2);
  if (!app2 && name2 === DEFAULT_ENTRY_NAME && getDefaultAppConfig()) {
    return initializeApp();
  }
  if (!app2) {
    throw ERROR_FACTORY.create("no-app", { appName: name2 });
  }
  return app2;
}
function registerVersion(libraryKeyOrName, version2, variant) {
  var _a;
  let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version2.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version2}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version2}" contains illegal characters (whitespace or "/")`);
    }
    logger.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(
    `${library}-version`,
    () => ({ library, version: version2 }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DB_NAME$1 = "firebase-heartbeat-database";
const DB_VERSION$1 = 1;
const STORE_NAME = "firebase-heartbeat-store";
let dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME$1, DB_VERSION$1, {
      upgrade: (db2, oldVersion) => {
        switch (oldVersion) {
          case 0:
            db2.createObjectStore(STORE_NAME);
        }
      }
    }).catch((e) => {
      throw ERROR_FACTORY.create("idb-open", {
        originalErrorMessage: e.message
      });
    });
  }
  return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app2) {
  try {
    const db2 = await getDbPromise();
    const result = await db2.transaction(STORE_NAME).objectStore(STORE_NAME).get(computeKey(app2));
    return result;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-get", {
        originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
async function writeHeartbeatsToIndexedDB(app2, heartbeatObject) {
  try {
    const db2 = await getDbPromise();
    const tx = db2.transaction(STORE_NAME, "readwrite");
    const objectStore = tx.objectStore(STORE_NAME);
    await objectStore.put(heartbeatObject, computeKey(app2));
    await tx.done;
  } catch (e) {
    if (e instanceof FirebaseError) {
      logger.warn(e.message);
    } else {
      const idbGetError = ERROR_FACTORY.create("idb-set", {
        originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
      });
      logger.warn(idbGetError.message);
    }
  }
}
function computeKey(app2) {
  return `${app2.name}!${app2.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const MAX_HEADER_BYTES = 1024;
const STORED_HEARTBEAT_RETENTION_MAX_MILLIS = 30 * 24 * 60 * 60 * 1e3;
class HeartbeatServiceImpl {
  constructor(container) {
    this.container = container;
    this._heartbeatsCache = null;
    const app2 = this.container.getProvider("app").getImmediate();
    this._storage = new HeartbeatStorageImpl(app2);
    this._heartbeatsCachePromise = this._storage.read().then((result) => {
      this._heartbeatsCache = result;
      return result;
    });
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    const platformLogger = this.container.getProvider("platform-logger").getImmediate();
    const agent = platformLogger.getPlatformInfoString();
    const date = getUTCDateString();
    if (this._heartbeatsCache === null) {
      this._heartbeatsCache = await this._heartbeatsCachePromise;
    }
    if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) {
      return;
    } else {
      this._heartbeatsCache.heartbeats.push({ date, agent });
    }
    this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((singleDateHeartbeat) => {
      const hbTimestamp = new Date(singleDateHeartbeat.date).valueOf();
      const now = Date.now();
      return now - hbTimestamp <= STORED_HEARTBEAT_RETENTION_MAX_MILLIS;
    });
    return this._storage.overwrite(this._heartbeatsCache);
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    if (this._heartbeatsCache === null) {
      await this._heartbeatsCachePromise;
    }
    if (this._heartbeatsCache === null || this._heartbeatsCache.heartbeats.length === 0) {
      return "";
    }
    const date = getUTCDateString();
    const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
    const headerString = base64urlEncodeWithoutPadding(JSON.stringify({ version: 2, heartbeats: heartbeatsToSend }));
    this._heartbeatsCache.lastSentHeartbeatDate = date;
    if (unsentEntries.length > 0) {
      this._heartbeatsCache.heartbeats = unsentEntries;
      await this._storage.overwrite(this._heartbeatsCache);
    } else {
      this._heartbeatsCache.heartbeats = [];
      void this._storage.overwrite(this._heartbeatsCache);
    }
    return headerString;
  }
}
function getUTCDateString() {
  const today = /* @__PURE__ */ new Date();
  return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
  const heartbeatsToSend = [];
  let unsentEntries = heartbeatsCache.slice();
  for (const singleDateHeartbeat of heartbeatsCache) {
    const heartbeatEntry = heartbeatsToSend.find((hb2) => hb2.agent === singleDateHeartbeat.agent);
    if (!heartbeatEntry) {
      heartbeatsToSend.push({
        agent: singleDateHeartbeat.agent,
        dates: [singleDateHeartbeat.date]
      });
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatsToSend.pop();
        break;
      }
    } else {
      heartbeatEntry.dates.push(singleDateHeartbeat.date);
      if (countBytes(heartbeatsToSend) > maxSize) {
        heartbeatEntry.dates.pop();
        break;
      }
    }
    unsentEntries = unsentEntries.slice(1);
  }
  return {
    heartbeatsToSend,
    unsentEntries
  };
}
class HeartbeatStorageImpl {
  constructor(app2) {
    this.app = app2;
    this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    if (!isIndexedDBAvailable()) {
      return false;
    } else {
      return validateIndexedDBOpenable().then(() => true).catch(() => false);
    }
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return { heartbeats: [] };
    } else {
      const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
      return idbHeartbeatObject || { heartbeats: [] };
    }
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(heartbeatsObject) {
    var _a;
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: heartbeatsObject.heartbeats
      });
    }
  }
  // add heartbeats
  async add(heartbeatsObject) {
    var _a;
    const canUseIndexedDB = await this._canUseIndexedDBPromise;
    if (!canUseIndexedDB) {
      return;
    } else {
      const existingHeartbeatsObject = await this.read();
      return writeHeartbeatsToIndexedDB(this.app, {
        lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
        heartbeats: [
          ...existingHeartbeatsObject.heartbeats,
          ...heartbeatsObject.heartbeats
        ]
      });
    }
  }
}
function countBytes(heartbeatsCache) {
  return base64urlEncodeWithoutPadding(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: heartbeatsCache })
  ).length;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function registerCoreComponents(variant) {
  _registerComponent(new Component(
    "platform-logger",
    (container) => new PlatformLoggerServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  _registerComponent(new Component(
    "heartbeat",
    (container) => new HeartbeatServiceImpl(container),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name$o, version$1$1, variant);
  registerVersion(name$o, version$1$1, "esm2017");
  registerVersion("fire-js", "");
}
registerCoreComponents("");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var k$1, goog = goog || {}, l = commonjsGlobal || self;
function aa$1(a) {
  var b2 = typeof a;
  b2 = "object" != b2 ? b2 : a ? Array.isArray(a) ? "array" : b2 : "null";
  return "array" == b2 || "object" == b2 && "number" == typeof a.length;
}
function p(a) {
  var b2 = typeof a;
  return "object" == b2 && null != a || "function" == b2;
}
function ba(a) {
  return Object.prototype.hasOwnProperty.call(a, ca$1) && a[ca$1] || (a[ca$1] = ++da);
}
var ca$1 = "closure_uid_" + (1e9 * Math.random() >>> 0), da = 0;
function ea$1(a, b2, c) {
  return a.call.apply(a.bind, arguments);
}
function fa(a, b2, c) {
  if (!a)
    throw Error();
  if (2 < arguments.length) {
    var d = Array.prototype.slice.call(arguments, 2);
    return function() {
      var e = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(e, d);
      return a.apply(b2, e);
    };
  }
  return function() {
    return a.apply(b2, arguments);
  };
}
function q$1(a, b2, c) {
  Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? q$1 = ea$1 : q$1 = fa;
  return q$1.apply(null, arguments);
}
function ha(a, b2) {
  var c = Array.prototype.slice.call(arguments, 1);
  return function() {
    var d = c.slice();
    d.push.apply(d, arguments);
    return a.apply(this, d);
  };
}
function r(a, b2) {
  function c() {
  }
  c.prototype = b2.prototype;
  a.$ = b2.prototype;
  a.prototype = new c();
  a.prototype.constructor = a;
  a.ac = function(d, e, f) {
    for (var h = Array(arguments.length - 2), n = 2; n < arguments.length; n++)
      h[n - 2] = arguments[n];
    return b2.prototype[e].apply(d, h);
  };
}
function v() {
  this.s = this.s;
  this.o = this.o;
}
var ia$1 = 0;
v.prototype.s = false;
v.prototype.sa = function() {
  if (!this.s && (this.s = true, this.N(), 0 != ia$1)) {
    ba(this);
  }
};
v.prototype.N = function() {
  if (this.o)
    for (; this.o.length; )
      this.o.shift()();
};
const ka$1 = Array.prototype.indexOf ? function(a, b2) {
  return Array.prototype.indexOf.call(a, b2, void 0);
} : function(a, b2) {
  if ("string" === typeof a)
    return "string" !== typeof b2 || 1 != b2.length ? -1 : a.indexOf(b2, 0);
  for (let c = 0; c < a.length; c++)
    if (c in a && a[c] === b2)
      return c;
  return -1;
};
function ma(a) {
  const b2 = a.length;
  if (0 < b2) {
    const c = Array(b2);
    for (let d = 0; d < b2; d++)
      c[d] = a[d];
    return c;
  }
  return [];
}
function na$1(a, b2) {
  for (let c = 1; c < arguments.length; c++) {
    const d = arguments[c];
    if (aa$1(d)) {
      const e = a.length || 0, f = d.length || 0;
      a.length = e + f;
      for (let h = 0; h < f; h++)
        a[e + h] = d[h];
    } else
      a.push(d);
  }
}
function w(a, b2) {
  this.type = a;
  this.g = this.target = b2;
  this.defaultPrevented = false;
}
w.prototype.h = function() {
  this.defaultPrevented = true;
};
var oa$1 = function() {
  if (!l.addEventListener || !Object.defineProperty)
    return false;
  var a = false, b2 = Object.defineProperty({}, "passive", { get: function() {
    a = true;
  } });
  try {
    l.addEventListener("test", () => {
    }, b2), l.removeEventListener("test", () => {
    }, b2);
  } catch (c) {
  }
  return a;
}();
function x(a) {
  return /^[\s\xa0]*$/.test(a);
}
function pa$1() {
  var a = l.navigator;
  return a && (a = a.userAgent) ? a : "";
}
function y(a) {
  return -1 != pa$1().indexOf(a);
}
function qa$1(a) {
  qa$1[" "](a);
  return a;
}
qa$1[" "] = function() {
};
function ra$1(a, b2) {
  var c = sa$1;
  return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : c[a] = b2(a);
}
var ta$1 = y("Opera"), z$1 = y("Trident") || y("MSIE"), ua$1 = y("Edge"), va = ua$1 || z$1, wa = y("Gecko") && !(-1 != pa$1().toLowerCase().indexOf("webkit") && !y("Edge")) && !(y("Trident") || y("MSIE")) && !y("Edge"), xa$1 = -1 != pa$1().toLowerCase().indexOf("webkit") && !y("Edge");
function ya() {
  var a = l.document;
  return a ? a.documentMode : void 0;
}
var za$1;
a: {
  var Aa = "", Ba = function() {
    var a = pa$1();
    if (wa)
      return /rv:([^\);]+)(\)|;)/.exec(a);
    if (ua$1)
      return /Edge\/([\d\.]+)/.exec(a);
    if (z$1)
      return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
    if (xa$1)
      return /WebKit\/(\S+)/.exec(a);
    if (ta$1)
      return /(?:Version)[ \/]?(\S+)/.exec(a);
  }();
  Ba && (Aa = Ba ? Ba[1] : "");
  if (z$1) {
    var Ca = ya();
    if (null != Ca && Ca > parseFloat(Aa)) {
      za$1 = String(Ca);
      break a;
    }
  }
  za$1 = Aa;
}
var Da;
if (l.document && z$1) {
  var Ea$1 = ya();
  Da = Ea$1 ? Ea$1 : parseInt(za$1, 10) || void 0;
} else
  Da = void 0;
var Fa = Da;
function A(a, b2) {
  w.call(this, a ? a.type : "");
  this.relatedTarget = this.g = this.target = null;
  this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
  this.key = "";
  this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = false;
  this.state = null;
  this.pointerId = 0;
  this.pointerType = "";
  this.i = null;
  if (a) {
    var c = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
    this.target = a.target || a.srcElement;
    this.g = b2;
    if (b2 = a.relatedTarget) {
      if (wa) {
        a: {
          try {
            qa$1(b2.nodeName);
            var e = true;
            break a;
          } catch (f) {
          }
          e = false;
        }
        e || (b2 = null);
      }
    } else
      "mouseover" == c ? b2 = a.fromElement : "mouseout" == c && (b2 = a.toElement);
    this.relatedTarget = b2;
    d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX, this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0);
    this.button = a.button;
    this.key = a.key || "";
    this.ctrlKey = a.ctrlKey;
    this.altKey = a.altKey;
    this.shiftKey = a.shiftKey;
    this.metaKey = a.metaKey;
    this.pointerId = a.pointerId || 0;
    this.pointerType = "string" === typeof a.pointerType ? a.pointerType : Ga[a.pointerType] || "";
    this.state = a.state;
    this.i = a;
    a.defaultPrevented && A.$.h.call(this);
  }
}
r(A, w);
var Ga = { 2: "touch", 3: "pen", 4: "mouse" };
A.prototype.h = function() {
  A.$.h.call(this);
  var a = this.i;
  a.preventDefault ? a.preventDefault() : a.returnValue = false;
};
var Ha = "closure_listenable_" + (1e6 * Math.random() | 0);
var Ia$1 = 0;
function Ja(a, b2, c, d, e) {
  this.listener = a;
  this.proxy = null;
  this.src = b2;
  this.type = c;
  this.capture = !!d;
  this.la = e;
  this.key = ++Ia$1;
  this.fa = this.ia = false;
}
function Ka$1(a) {
  a.fa = true;
  a.listener = null;
  a.proxy = null;
  a.src = null;
  a.la = null;
}
function Na$1(a, b2, c) {
  for (const d in a)
    b2.call(c, a[d], d, a);
}
function Oa$1(a, b2) {
  for (const c in a)
    b2.call(void 0, a[c], c, a);
}
function Pa$1(a) {
  const b2 = {};
  for (const c in a)
    b2[c] = a[c];
  return b2;
}
const Qa = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function Ra(a, b2) {
  let c, d;
  for (let e = 1; e < arguments.length; e++) {
    d = arguments[e];
    for (c in d)
      a[c] = d[c];
    for (let f = 0; f < Qa.length; f++)
      c = Qa[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
  }
}
function Sa(a) {
  this.src = a;
  this.g = {};
  this.h = 0;
}
Sa.prototype.add = function(a, b2, c, d, e) {
  var f = a.toString();
  a = this.g[f];
  a || (a = this.g[f] = [], this.h++);
  var h = Ta(a, b2, d, e);
  -1 < h ? (b2 = a[h], c || (b2.ia = false)) : (b2 = new Ja(b2, this.src, f, !!d, e), b2.ia = c, a.push(b2));
  return b2;
};
function Ua(a, b2) {
  var c = b2.type;
  if (c in a.g) {
    var d = a.g[c], e = ka$1(d, b2), f;
    (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
    f && (Ka$1(b2), 0 == a.g[c].length && (delete a.g[c], a.h--));
  }
}
function Ta(a, b2, c, d) {
  for (var e = 0; e < a.length; ++e) {
    var f = a[e];
    if (!f.fa && f.listener == b2 && f.capture == !!c && f.la == d)
      return e;
  }
  return -1;
}
var Va$1 = "closure_lm_" + (1e6 * Math.random() | 0), Wa = {};
function Ya(a, b2, c, d, e) {
  if (d && d.once)
    return Za(a, b2, c, d, e);
  if (Array.isArray(b2)) {
    for (var f = 0; f < b2.length; f++)
      Ya(a, b2[f], c, d, e);
    return null;
  }
  c = $a$1(c);
  return a && a[Ha] ? a.O(b2, c, p(d) ? !!d.capture : !!d, e) : ab(a, b2, c, false, d, e);
}
function ab(a, b2, c, d, e, f) {
  if (!b2)
    throw Error("Invalid event type");
  var h = p(e) ? !!e.capture : !!e, n = bb(a);
  n || (a[Va$1] = n = new Sa(a));
  c = n.add(b2, c, d, h, f);
  if (c.proxy)
    return c;
  d = cb();
  c.proxy = d;
  d.src = a;
  d.listener = c;
  if (a.addEventListener)
    oa$1 || (e = h), void 0 === e && (e = false), a.addEventListener(b2.toString(), d, e);
  else if (a.attachEvent)
    a.attachEvent(db$1(b2.toString()), d);
  else if (a.addListener && a.removeListener)
    a.addListener(d);
  else
    throw Error("addEventListener and attachEvent are unavailable.");
  return c;
}
function cb() {
  function a(c) {
    return b2.call(a.src, a.listener, c);
  }
  const b2 = eb;
  return a;
}
function Za(a, b2, c, d, e) {
  if (Array.isArray(b2)) {
    for (var f = 0; f < b2.length; f++)
      Za(a, b2[f], c, d, e);
    return null;
  }
  c = $a$1(c);
  return a && a[Ha] ? a.P(b2, c, p(d) ? !!d.capture : !!d, e) : ab(a, b2, c, true, d, e);
}
function fb(a, b2, c, d, e) {
  if (Array.isArray(b2))
    for (var f = 0; f < b2.length; f++)
      fb(a, b2[f], c, d, e);
  else
    (d = p(d) ? !!d.capture : !!d, c = $a$1(c), a && a[Ha]) ? (a = a.i, b2 = String(b2).toString(), b2 in a.g && (f = a.g[b2], c = Ta(f, c, d, e), -1 < c && (Ka$1(f[c]), Array.prototype.splice.call(f, c, 1), 0 == f.length && (delete a.g[b2], a.h--)))) : a && (a = bb(a)) && (b2 = a.g[b2.toString()], a = -1, b2 && (a = Ta(b2, c, d, e)), (c = -1 < a ? b2[a] : null) && gb(c));
}
function gb(a) {
  if ("number" !== typeof a && a && !a.fa) {
    var b2 = a.src;
    if (b2 && b2[Ha])
      Ua(b2.i, a);
    else {
      var c = a.type, d = a.proxy;
      b2.removeEventListener ? b2.removeEventListener(c, d, a.capture) : b2.detachEvent ? b2.detachEvent(db$1(c), d) : b2.addListener && b2.removeListener && b2.removeListener(d);
      (c = bb(b2)) ? (Ua(c, a), 0 == c.h && (c.src = null, b2[Va$1] = null)) : Ka$1(a);
    }
  }
}
function db$1(a) {
  return a in Wa ? Wa[a] : Wa[a] = "on" + a;
}
function eb(a, b2) {
  if (a.fa)
    a = true;
  else {
    b2 = new A(b2, this);
    var c = a.listener, d = a.la || a.src;
    a.ia && gb(a);
    a = c.call(d, b2);
  }
  return a;
}
function bb(a) {
  a = a[Va$1];
  return a instanceof Sa ? a : null;
}
var hb = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
function $a$1(a) {
  if ("function" === typeof a)
    return a;
  a[hb] || (a[hb] = function(b2) {
    return a.handleEvent(b2);
  });
  return a[hb];
}
function B() {
  v.call(this);
  this.i = new Sa(this);
  this.S = this;
  this.J = null;
}
r(B, v);
B.prototype[Ha] = true;
B.prototype.removeEventListener = function(a, b2, c, d) {
  fb(this, a, b2, c, d);
};
function C$1(a, b2) {
  var c, d = a.J;
  if (d)
    for (c = []; d; d = d.J)
      c.push(d);
  a = a.S;
  d = b2.type || b2;
  if ("string" === typeof b2)
    b2 = new w(b2, a);
  else if (b2 instanceof w)
    b2.target = b2.target || a;
  else {
    var e = b2;
    b2 = new w(d, a);
    Ra(b2, e);
  }
  e = true;
  if (c)
    for (var f = c.length - 1; 0 <= f; f--) {
      var h = b2.g = c[f];
      e = ib(h, d, true, b2) && e;
    }
  h = b2.g = a;
  e = ib(h, d, true, b2) && e;
  e = ib(h, d, false, b2) && e;
  if (c)
    for (f = 0; f < c.length; f++)
      h = b2.g = c[f], e = ib(h, d, false, b2) && e;
}
B.prototype.N = function() {
  B.$.N.call(this);
  if (this.i) {
    var a = this.i, c;
    for (c in a.g) {
      for (var d = a.g[c], e = 0; e < d.length; e++)
        Ka$1(d[e]);
      delete a.g[c];
      a.h--;
    }
  }
  this.J = null;
};
B.prototype.O = function(a, b2, c, d) {
  return this.i.add(String(a), b2, false, c, d);
};
B.prototype.P = function(a, b2, c, d) {
  return this.i.add(String(a), b2, true, c, d);
};
function ib(a, b2, c, d) {
  b2 = a.i.g[String(b2)];
  if (!b2)
    return true;
  b2 = b2.concat();
  for (var e = true, f = 0; f < b2.length; ++f) {
    var h = b2[f];
    if (h && !h.fa && h.capture == c) {
      var n = h.listener, t = h.la || h.src;
      h.ia && Ua(a.i, h);
      e = false !== n.call(t, d) && e;
    }
  }
  return e && !d.defaultPrevented;
}
var jb = l.JSON.stringify;
class kb {
  constructor(a, b2) {
    this.i = a;
    this.j = b2;
    this.h = 0;
    this.g = null;
  }
  get() {
    let a;
    0 < this.h ? (this.h--, a = this.g, this.g = a.next, a.next = null) : a = this.i();
    return a;
  }
}
function lb() {
  var a = mb;
  let b2 = null;
  a.g && (b2 = a.g, a.g = a.g.next, a.g || (a.h = null), b2.next = null);
  return b2;
}
class nb {
  constructor() {
    this.h = this.g = null;
  }
  add(a, b2) {
    const c = ob.get();
    c.set(a, b2);
    this.h ? this.h.next = c : this.g = c;
    this.h = c;
  }
}
var ob = new kb(() => new pb(), (a) => a.reset());
class pb {
  constructor() {
    this.next = this.g = this.h = null;
  }
  set(a, b2) {
    this.h = a;
    this.g = b2;
    this.next = null;
  }
  reset() {
    this.next = this.g = this.h = null;
  }
}
function qb(a) {
  var b2 = 1;
  a = a.split(":");
  const c = [];
  for (; 0 < b2 && a.length; )
    c.push(a.shift()), b2--;
  a.length && c.push(a.join(":"));
  return c;
}
function rb(a) {
  l.setTimeout(() => {
    throw a;
  }, 0);
}
let sb, tb = false, mb = new nb(), vb = () => {
  const a = l.Promise.resolve(void 0);
  sb = () => {
    a.then(ub);
  };
};
var ub = () => {
  for (var a; a = lb(); ) {
    try {
      a.h.call(a.g);
    } catch (c) {
      rb(c);
    }
    var b2 = ob;
    b2.j(a);
    100 > b2.h && (b2.h++, a.next = b2.g, b2.g = a);
  }
  tb = false;
};
function wb(a, b2) {
  B.call(this);
  this.h = a || 1;
  this.g = b2 || l;
  this.j = q$1(this.qb, this);
  this.l = Date.now();
}
r(wb, B);
k$1 = wb.prototype;
k$1.ga = false;
k$1.T = null;
k$1.qb = function() {
  if (this.ga) {
    var a = Date.now() - this.l;
    0 < a && a < 0.8 * this.h ? this.T = this.g.setTimeout(this.j, this.h - a) : (this.T && (this.g.clearTimeout(this.T), this.T = null), C$1(this, "tick"), this.ga && (xb(this), this.start()));
  }
};
k$1.start = function() {
  this.ga = true;
  this.T || (this.T = this.g.setTimeout(this.j, this.h), this.l = Date.now());
};
function xb(a) {
  a.ga = false;
  a.T && (a.g.clearTimeout(a.T), a.T = null);
}
k$1.N = function() {
  wb.$.N.call(this);
  xb(this);
  delete this.g;
};
function yb(a, b2, c) {
  if ("function" === typeof a)
    c && (a = q$1(a, c));
  else if (a && "function" == typeof a.handleEvent)
    a = q$1(a.handleEvent, a);
  else
    throw Error("Invalid listener argument");
  return 2147483647 < Number(b2) ? -1 : l.setTimeout(a, b2 || 0);
}
function zb(a) {
  a.g = yb(() => {
    a.g = null;
    a.i && (a.i = false, zb(a));
  }, a.j);
  const b2 = a.h;
  a.h = null;
  a.m.apply(null, b2);
}
class Ab extends v {
  constructor(a, b2) {
    super();
    this.m = a;
    this.j = b2;
    this.h = null;
    this.i = false;
    this.g = null;
  }
  l(a) {
    this.h = arguments;
    this.g ? this.i = true : zb(this);
  }
  N() {
    super.N();
    this.g && (l.clearTimeout(this.g), this.g = null, this.i = false, this.h = null);
  }
}
function Bb(a) {
  v.call(this);
  this.h = a;
  this.g = {};
}
r(Bb, v);
var Cb = [];
function Db(a, b2, c, d) {
  Array.isArray(c) || (c && (Cb[0] = c.toString()), c = Cb);
  for (var e = 0; e < c.length; e++) {
    var f = Ya(b2, c[e], d || a.handleEvent, false, a.h || a);
    if (!f)
      break;
    a.g[f.key] = f;
  }
}
function Fb(a) {
  Na$1(a.g, function(b2, c) {
    this.g.hasOwnProperty(c) && gb(b2);
  }, a);
  a.g = {};
}
Bb.prototype.N = function() {
  Bb.$.N.call(this);
  Fb(this);
};
Bb.prototype.handleEvent = function() {
  throw Error("EventHandler.handleEvent not implemented");
};
function Gb() {
  this.g = true;
}
Gb.prototype.Ea = function() {
  this.g = false;
};
function Hb(a, b2, c, d, e, f) {
  a.info(function() {
    if (a.g)
      if (f) {
        var h = "";
        for (var n = f.split("&"), t = 0; t < n.length; t++) {
          var m = n[t].split("=");
          if (1 < m.length) {
            var u = m[0];
            m = m[1];
            var L2 = u.split("_");
            h = 2 <= L2.length && "type" == L2[1] ? h + (u + "=" + m + "&") : h + (u + "=redacted&");
          }
        }
      } else
        h = null;
    else
      h = f;
    return "XMLHTTP REQ (" + d + ") [attempt " + e + "]: " + b2 + "\n" + c + "\n" + h;
  });
}
function Ib(a, b2, c, d, e, f, h) {
  a.info(function() {
    return "XMLHTTP RESP (" + d + ") [ attempt " + e + "]: " + b2 + "\n" + c + "\n" + f + " " + h;
  });
}
function D$1(a, b2, c, d) {
  a.info(function() {
    return "XMLHTTP TEXT (" + b2 + "): " + Jb(a, c) + (d ? " " + d : "");
  });
}
function Kb(a, b2) {
  a.info(function() {
    return "TIMEOUT: " + b2;
  });
}
Gb.prototype.info = function() {
};
function Jb(a, b2) {
  if (!a.g)
    return b2;
  if (!b2)
    return null;
  try {
    var c = JSON.parse(b2);
    if (c) {
      for (a = 0; a < c.length; a++)
        if (Array.isArray(c[a])) {
          var d = c[a];
          if (!(2 > d.length)) {
            var e = d[1];
            if (Array.isArray(e) && !(1 > e.length)) {
              var f = e[0];
              if ("noop" != f && "stop" != f && "close" != f)
                for (var h = 1; h < e.length; h++)
                  e[h] = "";
            }
          }
        }
    }
    return jb(c);
  } catch (n) {
    return b2;
  }
}
var E = {}, Lb = null;
function Mb() {
  return Lb = Lb || new B();
}
E.Ta = "serverreachability";
function Nb(a) {
  w.call(this, E.Ta, a);
}
r(Nb, w);
function Ob(a) {
  const b2 = Mb();
  C$1(b2, new Nb(b2));
}
E.STAT_EVENT = "statevent";
function Pb(a, b2) {
  w.call(this, E.STAT_EVENT, a);
  this.stat = b2;
}
r(Pb, w);
function F$1(a) {
  const b2 = Mb();
  C$1(b2, new Pb(b2, a));
}
E.Ua = "timingevent";
function Qb(a, b2) {
  w.call(this, E.Ua, a);
  this.size = b2;
}
r(Qb, w);
function Rb(a, b2) {
  if ("function" !== typeof a)
    throw Error("Fn must not be null and must be a function");
  return l.setTimeout(function() {
    a();
  }, b2);
}
var Sb = { NO_ERROR: 0, rb: 1, Eb: 2, Db: 3, yb: 4, Cb: 5, Fb: 6, Qa: 7, TIMEOUT: 8, Ib: 9 };
var Tb = { wb: "complete", Sb: "success", Ra: "error", Qa: "abort", Kb: "ready", Lb: "readystatechange", TIMEOUT: "timeout", Gb: "incrementaldata", Jb: "progress", zb: "downloadprogress", $b: "uploadprogress" };
function Ub() {
}
Ub.prototype.h = null;
function Vb(a) {
  return a.h || (a.h = a.i());
}
function Wb() {
}
var Xb = { OPEN: "a", vb: "b", Ra: "c", Hb: "d" };
function Yb() {
  w.call(this, "d");
}
r(Yb, w);
function Zb() {
  w.call(this, "c");
}
r(Zb, w);
var $b;
function ac$1() {
}
r(ac$1, Ub);
ac$1.prototype.g = function() {
  return new XMLHttpRequest();
};
ac$1.prototype.i = function() {
  return {};
};
$b = new ac$1();
function bc$1(a, b2, c, d) {
  this.l = a;
  this.j = b2;
  this.m = c;
  this.W = d || 1;
  this.U = new Bb(this);
  this.P = cc$1;
  a = va ? 125 : void 0;
  this.V = new wb(a);
  this.I = null;
  this.i = false;
  this.s = this.A = this.v = this.L = this.G = this.Y = this.B = null;
  this.F = [];
  this.g = null;
  this.C = 0;
  this.o = this.u = null;
  this.ca = -1;
  this.J = false;
  this.O = 0;
  this.M = null;
  this.ba = this.K = this.aa = this.S = false;
  this.h = new dc$1();
}
function dc$1() {
  this.i = null;
  this.g = "";
  this.h = false;
}
var cc$1 = 45e3, ec$1 = {}, fc$1 = {};
k$1 = bc$1.prototype;
k$1.setTimeout = function(a) {
  this.P = a;
};
function gc$1(a, b2, c) {
  a.L = 1;
  a.v = hc$1(G$1(b2));
  a.s = c;
  a.S = true;
  ic$1(a, null);
}
function ic$1(a, b2) {
  a.G = Date.now();
  jc$1(a);
  a.A = G$1(a.v);
  var c = a.A, d = a.W;
  Array.isArray(d) || (d = [String(d)]);
  kc(c.i, "t", d);
  a.C = 0;
  c = a.l.J;
  a.h = new dc$1();
  a.g = lc$1(a.l, c ? b2 : null, !a.s);
  0 < a.O && (a.M = new Ab(q$1(a.Pa, a, a.g), a.O));
  Db(a.U, a.g, "readystatechange", a.nb);
  b2 = a.I ? Pa$1(a.I) : {};
  a.s ? (a.u || (a.u = "POST"), b2["Content-Type"] = "application/x-www-form-urlencoded", a.g.ha(a.A, a.u, a.s, b2)) : (a.u = "GET", a.g.ha(a.A, a.u, null, b2));
  Ob();
  Hb(a.j, a.u, a.A, a.m, a.W, a.s);
}
k$1.nb = function(a) {
  a = a.target;
  const b2 = this.M;
  b2 && 3 == H$1(a) ? b2.l() : this.Pa(a);
};
k$1.Pa = function(a) {
  try {
    if (a == this.g)
      a: {
        const u = H$1(this.g);
        var b2 = this.g.Ia();
        const L2 = this.g.da();
        if (!(3 > u) && (3 != u || va || this.g && (this.h.h || this.g.ja() || mc$1(this.g)))) {
          this.J || 4 != u || 7 == b2 || (8 == b2 || 0 >= L2 ? Ob(3) : Ob(2));
          nc$1(this);
          var c = this.g.da();
          this.ca = c;
          b:
            if (oc$1(this)) {
              var d = mc$1(this.g);
              a = "";
              var e = d.length, f = 4 == H$1(this.g);
              if (!this.h.i) {
                if ("undefined" === typeof TextDecoder) {
                  I(this);
                  pc$1(this);
                  var h = "";
                  break b;
                }
                this.h.i = new l.TextDecoder();
              }
              for (b2 = 0; b2 < e; b2++)
                this.h.h = true, a += this.h.i.decode(d[b2], { stream: f && b2 == e - 1 });
              d.splice(
                0,
                e
              );
              this.h.g += a;
              this.C = 0;
              h = this.h.g;
            } else
              h = this.g.ja();
          this.i = 200 == c;
          Ib(this.j, this.u, this.A, this.m, this.W, u, c);
          if (this.i) {
            if (this.aa && !this.K) {
              b: {
                if (this.g) {
                  var n, t = this.g;
                  if ((n = t.g ? t.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !x(n)) {
                    var m = n;
                    break b;
                  }
                }
                m = null;
              }
              if (c = m)
                D$1(this.j, this.m, c, "Initial handshake response via X-HTTP-Initial-Response"), this.K = true, qc$1(this, c);
              else {
                this.i = false;
                this.o = 3;
                F$1(12);
                I(this);
                pc$1(this);
                break a;
              }
            }
            this.S ? (rc$1(this, u, h), va && this.i && 3 == u && (Db(this.U, this.V, "tick", this.mb), this.V.start())) : (D$1(this.j, this.m, h, null), qc$1(this, h));
            4 == u && I(this);
            this.i && !this.J && (4 == u ? sc$1(this.l, this) : (this.i = false, jc$1(this)));
          } else
            tc$1(this.g), 400 == c && 0 < h.indexOf("Unknown SID") ? (this.o = 3, F$1(12)) : (this.o = 0, F$1(13)), I(this), pc$1(this);
        }
      }
  } catch (u) {
  } finally {
  }
};
function oc$1(a) {
  return a.g ? "GET" == a.u && 2 != a.L && a.l.Ha : false;
}
function rc$1(a, b2, c) {
  let d = true, e;
  for (; !a.J && a.C < c.length; )
    if (e = uc$1(a, c), e == fc$1) {
      4 == b2 && (a.o = 4, F$1(14), d = false);
      D$1(a.j, a.m, null, "[Incomplete Response]");
      break;
    } else if (e == ec$1) {
      a.o = 4;
      F$1(15);
      D$1(a.j, a.m, c, "[Invalid Chunk]");
      d = false;
      break;
    } else
      D$1(a.j, a.m, e, null), qc$1(a, e);
  oc$1(a) && e != fc$1 && e != ec$1 && (a.h.g = "", a.C = 0);
  4 != b2 || 0 != c.length || a.h.h || (a.o = 1, F$1(16), d = false);
  a.i = a.i && d;
  d ? 0 < c.length && !a.ba && (a.ba = true, b2 = a.l, b2.g == a && b2.ca && !b2.M && (b2.l.info("Great, no buffering proxy detected. Bytes received: " + c.length), vc$1(b2), b2.M = true, F$1(11))) : (D$1(
    a.j,
    a.m,
    c,
    "[Invalid Chunked Response]"
  ), I(a), pc$1(a));
}
k$1.mb = function() {
  if (this.g) {
    var a = H$1(this.g), b2 = this.g.ja();
    this.C < b2.length && (nc$1(this), rc$1(this, a, b2), this.i && 4 != a && jc$1(this));
  }
};
function uc$1(a, b2) {
  var c = a.C, d = b2.indexOf("\n", c);
  if (-1 == d)
    return fc$1;
  c = Number(b2.substring(c, d));
  if (isNaN(c))
    return ec$1;
  d += 1;
  if (d + c > b2.length)
    return fc$1;
  b2 = b2.slice(d, d + c);
  a.C = d + c;
  return b2;
}
k$1.cancel = function() {
  this.J = true;
  I(this);
};
function jc$1(a) {
  a.Y = Date.now() + a.P;
  wc$1(a, a.P);
}
function wc$1(a, b2) {
  if (null != a.B)
    throw Error("WatchDog timer not null");
  a.B = Rb(q$1(a.lb, a), b2);
}
function nc$1(a) {
  a.B && (l.clearTimeout(a.B), a.B = null);
}
k$1.lb = function() {
  this.B = null;
  const a = Date.now();
  0 <= a - this.Y ? (Kb(this.j, this.A), 2 != this.L && (Ob(), F$1(17)), I(this), this.o = 2, pc$1(this)) : wc$1(this, this.Y - a);
};
function pc$1(a) {
  0 == a.l.H || a.J || sc$1(a.l, a);
}
function I(a) {
  nc$1(a);
  var b2 = a.M;
  b2 && "function" == typeof b2.sa && b2.sa();
  a.M = null;
  xb(a.V);
  Fb(a.U);
  a.g && (b2 = a.g, a.g = null, b2.abort(), b2.sa());
}
function qc$1(a, b2) {
  try {
    var c = a.l;
    if (0 != c.H && (c.g == a || xc$1(c.i, a))) {
      if (!a.K && xc$1(c.i, a) && 3 == c.H) {
        try {
          var d = c.Ja.g.parse(b2);
        } catch (m) {
          d = null;
        }
        if (Array.isArray(d) && 3 == d.length) {
          var e = d;
          if (0 == e[0])
            a: {
              if (!c.u) {
                if (c.g)
                  if (c.g.G + 3e3 < a.G)
                    yc$1(c), zc$1(c);
                  else
                    break a;
                Ac$1(c);
                F$1(18);
              }
            }
          else
            c.Fa = e[1], 0 < c.Fa - c.V && 37500 > e[2] && c.G && 0 == c.A && !c.v && (c.v = Rb(q$1(c.ib, c), 6e3));
          if (1 >= Bc$1(c.i) && c.oa) {
            try {
              c.oa();
            } catch (m) {
            }
            c.oa = void 0;
          }
        } else
          J$1(c, 11);
      } else if ((a.K || c.g == a) && yc$1(c), !x(b2))
        for (e = c.Ja.g.parse(b2), b2 = 0; b2 < e.length; b2++) {
          let m = e[b2];
          c.V = m[0];
          m = m[1];
          if (2 == c.H)
            if ("c" == m[0]) {
              c.K = m[1];
              c.pa = m[2];
              const u = m[3];
              null != u && (c.ra = u, c.l.info("VER=" + c.ra));
              const L2 = m[4];
              null != L2 && (c.Ga = L2, c.l.info("SVER=" + c.Ga));
              const La = m[5];
              null != La && "number" === typeof La && 0 < La && (d = 1.5 * La, c.L = d, c.l.info("backChannelRequestTimeoutMs_=" + d));
              d = c;
              const la = a.g;
              if (la) {
                const Ma2 = la.g ? la.g.getResponseHeader("X-Client-Wire-Protocol") : null;
                if (Ma2) {
                  var f = d.i;
                  f.g || -1 == Ma2.indexOf("spdy") && -1 == Ma2.indexOf("quic") && -1 == Ma2.indexOf("h2") || (f.j = f.l, f.g = /* @__PURE__ */ new Set(), f.h && (Cc$1(f, f.h), f.h = null));
                }
                if (d.F) {
                  const Eb = la.g ? la.g.getResponseHeader("X-HTTP-Session-Id") : null;
                  Eb && (d.Da = Eb, K$1(d.I, d.F, Eb));
                }
              }
              c.H = 3;
              c.h && c.h.Ba();
              c.ca && (c.S = Date.now() - a.G, c.l.info("Handshake RTT: " + c.S + "ms"));
              d = c;
              var h = a;
              d.wa = Dc$1(d, d.J ? d.pa : null, d.Y);
              if (h.K) {
                Ec$1(d.i, h);
                var n = h, t = d.L;
                t && n.setTimeout(t);
                n.B && (nc$1(n), jc$1(n));
                d.g = h;
              } else
                Fc$1(d);
              0 < c.j.length && Gc$1(c);
            } else
              "stop" != m[0] && "close" != m[0] || J$1(c, 7);
          else
            3 == c.H && ("stop" == m[0] || "close" == m[0] ? "stop" == m[0] ? J$1(c, 7) : Hc$1(c) : "noop" != m[0] && c.h && c.h.Aa(m), c.A = 0);
        }
    }
    Ob(4);
  } catch (m) {
  }
}
function Ic$1(a) {
  if (a.Z && "function" == typeof a.Z)
    return a.Z();
  if ("undefined" !== typeof Map && a instanceof Map || "undefined" !== typeof Set && a instanceof Set)
    return Array.from(a.values());
  if ("string" === typeof a)
    return a.split("");
  if (aa$1(a)) {
    for (var b2 = [], c = a.length, d = 0; d < c; d++)
      b2.push(a[d]);
    return b2;
  }
  b2 = [];
  c = 0;
  for (d in a)
    b2[c++] = a[d];
  return b2;
}
function Jc$1(a) {
  if (a.ta && "function" == typeof a.ta)
    return a.ta();
  if (!a.Z || "function" != typeof a.Z) {
    if ("undefined" !== typeof Map && a instanceof Map)
      return Array.from(a.keys());
    if (!("undefined" !== typeof Set && a instanceof Set)) {
      if (aa$1(a) || "string" === typeof a) {
        var b2 = [];
        a = a.length;
        for (var c = 0; c < a; c++)
          b2.push(c);
        return b2;
      }
      b2 = [];
      c = 0;
      for (const d in a)
        b2[c++] = d;
      return b2;
    }
  }
}
function Kc$1(a, b2) {
  if (a.forEach && "function" == typeof a.forEach)
    a.forEach(b2, void 0);
  else if (aa$1(a) || "string" === typeof a)
    Array.prototype.forEach.call(a, b2, void 0);
  else
    for (var c = Jc$1(a), d = Ic$1(a), e = d.length, f = 0; f < e; f++)
      b2.call(void 0, d[f], c && c[f], a);
}
var Lc$1 = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
function Mc(a, b2) {
  if (a) {
    a = a.split("&");
    for (var c = 0; c < a.length; c++) {
      var d = a[c].indexOf("="), e = null;
      if (0 <= d) {
        var f = a[c].substring(0, d);
        e = a[c].substring(d + 1);
      } else
        f = a[c];
      b2(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
    }
  }
}
function M$1(a) {
  this.g = this.s = this.j = "";
  this.m = null;
  this.o = this.l = "";
  this.h = false;
  if (a instanceof M$1) {
    this.h = a.h;
    Nc$1(this, a.j);
    this.s = a.s;
    this.g = a.g;
    Oc(this, a.m);
    this.l = a.l;
    var b2 = a.i;
    var c = new Pc$1();
    c.i = b2.i;
    b2.g && (c.g = new Map(b2.g), c.h = b2.h);
    Qc$1(this, c);
    this.o = a.o;
  } else
    a && (b2 = String(a).match(Lc$1)) ? (this.h = false, Nc$1(this, b2[1] || "", true), this.s = Rc$1(b2[2] || ""), this.g = Rc$1(b2[3] || "", true), Oc(this, b2[4]), this.l = Rc$1(b2[5] || "", true), Qc$1(this, b2[6] || "", true), this.o = Rc$1(b2[7] || "")) : (this.h = false, this.i = new Pc$1(null, this.h));
}
M$1.prototype.toString = function() {
  var a = [], b2 = this.j;
  b2 && a.push(Sc$1(b2, Tc$1, true), ":");
  var c = this.g;
  if (c || "file" == b2)
    a.push("//"), (b2 = this.s) && a.push(Sc$1(b2, Tc$1, true), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.m, null != c && a.push(":", String(c));
  if (c = this.l)
    this.g && "/" != c.charAt(0) && a.push("/"), a.push(Sc$1(c, "/" == c.charAt(0) ? Uc$1 : Vc$1, true));
  (c = this.i.toString()) && a.push("?", c);
  (c = this.o) && a.push("#", Sc$1(c, Wc$1));
  return a.join("");
};
function G$1(a) {
  return new M$1(a);
}
function Nc$1(a, b2, c) {
  a.j = c ? Rc$1(b2, true) : b2;
  a.j && (a.j = a.j.replace(/:$/, ""));
}
function Oc(a, b2) {
  if (b2) {
    b2 = Number(b2);
    if (isNaN(b2) || 0 > b2)
      throw Error("Bad port number " + b2);
    a.m = b2;
  } else
    a.m = null;
}
function Qc$1(a, b2, c) {
  b2 instanceof Pc$1 ? (a.i = b2, Xc$1(a.i, a.h)) : (c || (b2 = Sc$1(b2, Yc$1)), a.i = new Pc$1(b2, a.h));
}
function K$1(a, b2, c) {
  a.i.set(b2, c);
}
function hc$1(a) {
  K$1(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36));
  return a;
}
function Rc$1(a, b2) {
  return a ? b2 ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : "";
}
function Sc$1(a, b2, c) {
  return "string" === typeof a ? (a = encodeURI(a).replace(b2, Zc), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
}
function Zc(a) {
  a = a.charCodeAt(0);
  return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
}
var Tc$1 = /[#\/\?@]/g, Vc$1 = /[#\?:]/g, Uc$1 = /[#\?]/g, Yc$1 = /[#\?@]/g, Wc$1 = /#/g;
function Pc$1(a, b2) {
  this.h = this.g = null;
  this.i = a || null;
  this.j = !!b2;
}
function N$1(a) {
  a.g || (a.g = /* @__PURE__ */ new Map(), a.h = 0, a.i && Mc(a.i, function(b2, c) {
    a.add(decodeURIComponent(b2.replace(/\+/g, " ")), c);
  }));
}
k$1 = Pc$1.prototype;
k$1.add = function(a, b2) {
  N$1(this);
  this.i = null;
  a = O$1(this, a);
  var c = this.g.get(a);
  c || this.g.set(a, c = []);
  c.push(b2);
  this.h += 1;
  return this;
};
function $c(a, b2) {
  N$1(a);
  b2 = O$1(a, b2);
  a.g.has(b2) && (a.i = null, a.h -= a.g.get(b2).length, a.g.delete(b2));
}
function ad(a, b2) {
  N$1(a);
  b2 = O$1(a, b2);
  return a.g.has(b2);
}
k$1.forEach = function(a, b2) {
  N$1(this);
  this.g.forEach(function(c, d) {
    c.forEach(function(e) {
      a.call(b2, e, d, this);
    }, this);
  }, this);
};
k$1.ta = function() {
  N$1(this);
  const a = Array.from(this.g.values()), b2 = Array.from(this.g.keys()), c = [];
  for (let d = 0; d < b2.length; d++) {
    const e = a[d];
    for (let f = 0; f < e.length; f++)
      c.push(b2[d]);
  }
  return c;
};
k$1.Z = function(a) {
  N$1(this);
  let b2 = [];
  if ("string" === typeof a)
    ad(this, a) && (b2 = b2.concat(this.g.get(O$1(this, a))));
  else {
    a = Array.from(this.g.values());
    for (let c = 0; c < a.length; c++)
      b2 = b2.concat(a[c]);
  }
  return b2;
};
k$1.set = function(a, b2) {
  N$1(this);
  this.i = null;
  a = O$1(this, a);
  ad(this, a) && (this.h -= this.g.get(a).length);
  this.g.set(a, [b2]);
  this.h += 1;
  return this;
};
k$1.get = function(a, b2) {
  if (!a)
    return b2;
  a = this.Z(a);
  return 0 < a.length ? String(a[0]) : b2;
};
function kc(a, b2, c) {
  $c(a, b2);
  0 < c.length && (a.i = null, a.g.set(O$1(a, b2), ma(c)), a.h += c.length);
}
k$1.toString = function() {
  if (this.i)
    return this.i;
  if (!this.g)
    return "";
  const a = [], b2 = Array.from(this.g.keys());
  for (var c = 0; c < b2.length; c++) {
    var d = b2[c];
    const f = encodeURIComponent(String(d)), h = this.Z(d);
    for (d = 0; d < h.length; d++) {
      var e = f;
      "" !== h[d] && (e += "=" + encodeURIComponent(String(h[d])));
      a.push(e);
    }
  }
  return this.i = a.join("&");
};
function O$1(a, b2) {
  b2 = String(b2);
  a.j && (b2 = b2.toLowerCase());
  return b2;
}
function Xc$1(a, b2) {
  b2 && !a.j && (N$1(a), a.i = null, a.g.forEach(function(c, d) {
    var e = d.toLowerCase();
    d != e && ($c(this, d), kc(this, e, c));
  }, a));
  a.j = b2;
}
var bd = class {
  constructor(a, b2) {
    this.g = a;
    this.map = b2;
  }
};
function cd(a) {
  this.l = a || dd;
  l.PerformanceNavigationTiming ? (a = l.performance.getEntriesByType("navigation"), a = 0 < a.length && ("hq" == a[0].nextHopProtocol || "h2" == a[0].nextHopProtocol)) : a = !!(l.g && l.g.Ka && l.g.Ka() && l.g.Ka().ec);
  this.j = a ? this.l : 1;
  this.g = null;
  1 < this.j && (this.g = /* @__PURE__ */ new Set());
  this.h = null;
  this.i = [];
}
var dd = 10;
function ed(a) {
  return a.h ? true : a.g ? a.g.size >= a.j : false;
}
function Bc$1(a) {
  return a.h ? 1 : a.g ? a.g.size : 0;
}
function xc$1(a, b2) {
  return a.h ? a.h == b2 : a.g ? a.g.has(b2) : false;
}
function Cc$1(a, b2) {
  a.g ? a.g.add(b2) : a.h = b2;
}
function Ec$1(a, b2) {
  a.h && a.h == b2 ? a.h = null : a.g && a.g.has(b2) && a.g.delete(b2);
}
cd.prototype.cancel = function() {
  this.i = fd(this);
  if (this.h)
    this.h.cancel(), this.h = null;
  else if (this.g && 0 !== this.g.size) {
    for (const a of this.g.values())
      a.cancel();
    this.g.clear();
  }
};
function fd(a) {
  if (null != a.h)
    return a.i.concat(a.h.F);
  if (null != a.g && 0 !== a.g.size) {
    let b2 = a.i;
    for (const c of a.g.values())
      b2 = b2.concat(c.F);
    return b2;
  }
  return ma(a.i);
}
var gd = class {
  stringify(a) {
    return l.JSON.stringify(a, void 0);
  }
  parse(a) {
    return l.JSON.parse(a, void 0);
  }
};
function hd() {
  this.g = new gd();
}
function id(a, b2, c) {
  const d = c || "";
  try {
    Kc$1(a, function(e, f) {
      let h = e;
      p(e) && (h = jb(e));
      b2.push(d + f + "=" + encodeURIComponent(h));
    });
  } catch (e) {
    throw b2.push(d + "type=" + encodeURIComponent("_badmap")), e;
  }
}
function jd(a, b2) {
  const c = new Gb();
  if (l.Image) {
    const d = new Image();
    d.onload = ha(kd, c, d, "TestLoadImage: loaded", true, b2);
    d.onerror = ha(kd, c, d, "TestLoadImage: error", false, b2);
    d.onabort = ha(kd, c, d, "TestLoadImage: abort", false, b2);
    d.ontimeout = ha(kd, c, d, "TestLoadImage: timeout", false, b2);
    l.setTimeout(function() {
      if (d.ontimeout)
        d.ontimeout();
    }, 1e4);
    d.src = a;
  } else
    b2(false);
}
function kd(a, b2, c, d, e) {
  try {
    b2.onload = null, b2.onerror = null, b2.onabort = null, b2.ontimeout = null, e(d);
  } catch (f) {
  }
}
function ld(a) {
  this.l = a.fc || null;
  this.j = a.ob || false;
}
r(ld, Ub);
ld.prototype.g = function() {
  return new md(this.l, this.j);
};
ld.prototype.i = function(a) {
  return function() {
    return a;
  };
}({});
function md(a, b2) {
  B.call(this);
  this.F = a;
  this.u = b2;
  this.m = void 0;
  this.readyState = nd;
  this.status = 0;
  this.responseType = this.responseText = this.response = this.statusText = "";
  this.onreadystatechange = null;
  this.v = new Headers();
  this.h = null;
  this.C = "GET";
  this.B = "";
  this.g = false;
  this.A = this.j = this.l = null;
}
r(md, B);
var nd = 0;
k$1 = md.prototype;
k$1.open = function(a, b2) {
  if (this.readyState != nd)
    throw this.abort(), Error("Error reopening a connection");
  this.C = a;
  this.B = b2;
  this.readyState = 1;
  od(this);
};
k$1.send = function(a) {
  if (1 != this.readyState)
    throw this.abort(), Error("need to call open() first. ");
  this.g = true;
  const b2 = { headers: this.v, method: this.C, credentials: this.m, cache: void 0 };
  a && (b2.body = a);
  (this.F || l).fetch(new Request(this.B, b2)).then(this.$a.bind(this), this.ka.bind(this));
};
k$1.abort = function() {
  this.response = this.responseText = "";
  this.v = new Headers();
  this.status = 0;
  this.j && this.j.cancel("Request was aborted.").catch(() => {
  });
  1 <= this.readyState && this.g && 4 != this.readyState && (this.g = false, pd(this));
  this.readyState = nd;
};
k$1.$a = function(a) {
  if (this.g && (this.l = a, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a.headers, this.readyState = 2, od(this)), this.g && (this.readyState = 3, od(this), this.g)))
    if ("arraybuffer" === this.responseType)
      a.arrayBuffer().then(this.Ya.bind(this), this.ka.bind(this));
    else if ("undefined" !== typeof l.ReadableStream && "body" in a) {
      this.j = a.body.getReader();
      if (this.u) {
        if (this.responseType)
          throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else
        this.response = this.responseText = "", this.A = new TextDecoder();
      qd(this);
    } else
      a.text().then(this.Za.bind(this), this.ka.bind(this));
};
function qd(a) {
  a.j.read().then(a.Xa.bind(a)).catch(a.ka.bind(a));
}
k$1.Xa = function(a) {
  if (this.g) {
    if (this.u && a.value)
      this.response.push(a.value);
    else if (!this.u) {
      var b2 = a.value ? a.value : new Uint8Array(0);
      if (b2 = this.A.decode(b2, { stream: !a.done }))
        this.response = this.responseText += b2;
    }
    a.done ? pd(this) : od(this);
    3 == this.readyState && qd(this);
  }
};
k$1.Za = function(a) {
  this.g && (this.response = this.responseText = a, pd(this));
};
k$1.Ya = function(a) {
  this.g && (this.response = a, pd(this));
};
k$1.ka = function() {
  this.g && pd(this);
};
function pd(a) {
  a.readyState = 4;
  a.l = null;
  a.j = null;
  a.A = null;
  od(a);
}
k$1.setRequestHeader = function(a, b2) {
  this.v.append(a, b2);
};
k$1.getResponseHeader = function(a) {
  return this.h ? this.h.get(a.toLowerCase()) || "" : "";
};
k$1.getAllResponseHeaders = function() {
  if (!this.h)
    return "";
  const a = [], b2 = this.h.entries();
  for (var c = b2.next(); !c.done; )
    c = c.value, a.push(c[0] + ": " + c[1]), c = b2.next();
  return a.join("\r\n");
};
function od(a) {
  a.onreadystatechange && a.onreadystatechange.call(a);
}
Object.defineProperty(md.prototype, "withCredentials", { get: function() {
  return "include" === this.m;
}, set: function(a) {
  this.m = a ? "include" : "same-origin";
} });
var rd = l.JSON.parse;
function P(a) {
  B.call(this);
  this.headers = /* @__PURE__ */ new Map();
  this.u = a || null;
  this.h = false;
  this.C = this.g = null;
  this.I = "";
  this.m = 0;
  this.j = "";
  this.l = this.G = this.v = this.F = false;
  this.B = 0;
  this.A = null;
  this.K = sd;
  this.L = this.M = false;
}
r(P, B);
var sd = "", td = /^https?$/i, ud = ["POST", "PUT"];
k$1 = P.prototype;
k$1.Oa = function(a) {
  this.M = a;
};
k$1.ha = function(a, b2, c, d) {
  if (this.g)
    throw Error("[goog.net.XhrIo] Object is active with another request=" + this.I + "; newUri=" + a);
  b2 = b2 ? b2.toUpperCase() : "GET";
  this.I = a;
  this.j = "";
  this.m = 0;
  this.F = false;
  this.h = true;
  this.g = this.u ? this.u.g() : $b.g();
  this.C = this.u ? Vb(this.u) : Vb($b);
  this.g.onreadystatechange = q$1(this.La, this);
  try {
    this.G = true, this.g.open(b2, String(a), true), this.G = false;
  } catch (f) {
    vd(this, f);
    return;
  }
  a = c || "";
  c = new Map(this.headers);
  if (d)
    if (Object.getPrototypeOf(d) === Object.prototype)
      for (var e in d)
        c.set(e, d[e]);
    else if ("function" === typeof d.keys && "function" === typeof d.get)
      for (const f of d.keys())
        c.set(f, d.get(f));
    else
      throw Error("Unknown input type for opt_headers: " + String(d));
  d = Array.from(c.keys()).find((f) => "content-type" == f.toLowerCase());
  e = l.FormData && a instanceof l.FormData;
  !(0 <= ka$1(ud, b2)) || d || e || c.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
  for (const [f, h] of c)
    this.g.setRequestHeader(f, h);
  this.K && (this.g.responseType = this.K);
  "withCredentials" in this.g && this.g.withCredentials !== this.M && (this.g.withCredentials = this.M);
  try {
    wd(this), 0 < this.B && ((this.L = xd(this.g)) ? (this.g.timeout = this.B, this.g.ontimeout = q$1(this.ua, this)) : this.A = yb(this.ua, this.B, this)), this.v = true, this.g.send(a), this.v = false;
  } catch (f) {
    vd(this, f);
  }
};
function xd(a) {
  return z$1 && "number" === typeof a.timeout && void 0 !== a.ontimeout;
}
k$1.ua = function() {
  "undefined" != typeof goog && this.g && (this.j = "Timed out after " + this.B + "ms, aborting", this.m = 8, C$1(this, "timeout"), this.abort(8));
};
function vd(a, b2) {
  a.h = false;
  a.g && (a.l = true, a.g.abort(), a.l = false);
  a.j = b2;
  a.m = 5;
  yd(a);
  zd(a);
}
function yd(a) {
  a.F || (a.F = true, C$1(a, "complete"), C$1(a, "error"));
}
k$1.abort = function(a) {
  this.g && this.h && (this.h = false, this.l = true, this.g.abort(), this.l = false, this.m = a || 7, C$1(this, "complete"), C$1(this, "abort"), zd(this));
};
k$1.N = function() {
  this.g && (this.h && (this.h = false, this.l = true, this.g.abort(), this.l = false), zd(this, true));
  P.$.N.call(this);
};
k$1.La = function() {
  this.s || (this.G || this.v || this.l ? Ad(this) : this.kb());
};
k$1.kb = function() {
  Ad(this);
};
function Ad(a) {
  if (a.h && "undefined" != typeof goog && (!a.C[1] || 4 != H$1(a) || 2 != a.da())) {
    if (a.v && 4 == H$1(a))
      yb(a.La, 0, a);
    else if (C$1(a, "readystatechange"), 4 == H$1(a)) {
      a.h = false;
      try {
        const h = a.da();
        a:
          switch (h) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var b2 = true;
              break a;
            default:
              b2 = false;
          }
        var c;
        if (!(c = b2)) {
          var d;
          if (d = 0 === h) {
            var e = String(a.I).match(Lc$1)[1] || null;
            !e && l.self && l.self.location && (e = l.self.location.protocol.slice(0, -1));
            d = !td.test(e ? e.toLowerCase() : "");
          }
          c = d;
        }
        if (c)
          C$1(a, "complete"), C$1(a, "success");
        else {
          a.m = 6;
          try {
            var f = 2 < H$1(a) ? a.g.statusText : "";
          } catch (n) {
            f = "";
          }
          a.j = f + " [" + a.da() + "]";
          yd(a);
        }
      } finally {
        zd(a);
      }
    }
  }
}
function zd(a, b2) {
  if (a.g) {
    wd(a);
    const c = a.g, d = a.C[0] ? () => {
    } : null;
    a.g = null;
    a.C = null;
    b2 || C$1(a, "ready");
    try {
      c.onreadystatechange = d;
    } catch (e) {
    }
  }
}
function wd(a) {
  a.g && a.L && (a.g.ontimeout = null);
  a.A && (l.clearTimeout(a.A), a.A = null);
}
k$1.isActive = function() {
  return !!this.g;
};
function H$1(a) {
  return a.g ? a.g.readyState : 0;
}
k$1.da = function() {
  try {
    return 2 < H$1(this) ? this.g.status : -1;
  } catch (a) {
    return -1;
  }
};
k$1.ja = function() {
  try {
    return this.g ? this.g.responseText : "";
  } catch (a) {
    return "";
  }
};
k$1.Wa = function(a) {
  if (this.g) {
    var b2 = this.g.responseText;
    a && 0 == b2.indexOf(a) && (b2 = b2.substring(a.length));
    return rd(b2);
  }
};
function mc$1(a) {
  try {
    if (!a.g)
      return null;
    if ("response" in a.g)
      return a.g.response;
    switch (a.K) {
      case sd:
      case "text":
        return a.g.responseText;
      case "arraybuffer":
        if ("mozResponseArrayBuffer" in a.g)
          return a.g.mozResponseArrayBuffer;
    }
    return null;
  } catch (b2) {
    return null;
  }
}
function tc$1(a) {
  const b2 = {};
  a = (a.g && 2 <= H$1(a) ? a.g.getAllResponseHeaders() || "" : "").split("\r\n");
  for (let d = 0; d < a.length; d++) {
    if (x(a[d]))
      continue;
    var c = qb(a[d]);
    const e = c[0];
    c = c[1];
    if ("string" !== typeof c)
      continue;
    c = c.trim();
    const f = b2[e] || [];
    b2[e] = f;
    f.push(c);
  }
  Oa$1(b2, function(d) {
    return d.join(", ");
  });
}
k$1.Ia = function() {
  return this.m;
};
k$1.Sa = function() {
  return "string" === typeof this.j ? this.j : String(this.j);
};
function Bd(a) {
  let b2 = "";
  Na$1(a, function(c, d) {
    b2 += d;
    b2 += ":";
    b2 += c;
    b2 += "\r\n";
  });
  return b2;
}
function Cd(a, b2, c) {
  a: {
    for (d in c) {
      var d = false;
      break a;
    }
    d = true;
  }
  d || (c = Bd(c), "string" === typeof a ? null != c && encodeURIComponent(String(c)) : K$1(a, b2, c));
}
function Dd(a, b2, c) {
  return c && c.internalChannelParams ? c.internalChannelParams[a] || b2 : b2;
}
function Ed(a) {
  this.Ga = 0;
  this.j = [];
  this.l = new Gb();
  this.pa = this.wa = this.I = this.Y = this.g = this.Da = this.F = this.na = this.o = this.U = this.s = null;
  this.fb = this.W = 0;
  this.cb = Dd("failFast", false, a);
  this.G = this.v = this.u = this.m = this.h = null;
  this.aa = true;
  this.Fa = this.V = -1;
  this.ba = this.A = this.C = 0;
  this.ab = Dd("baseRetryDelayMs", 5e3, a);
  this.hb = Dd("retryDelaySeedMs", 1e4, a);
  this.eb = Dd("forwardChannelMaxRetries", 2, a);
  this.xa = Dd("forwardChannelRequestTimeoutMs", 2e4, a);
  this.va = a && a.xmlHttpFactory || void 0;
  this.Ha = a && a.dc || false;
  this.L = void 0;
  this.J = a && a.supportsCrossDomainXhr || false;
  this.K = "";
  this.i = new cd(a && a.concurrentRequestLimit);
  this.Ja = new hd();
  this.P = a && a.fastHandshake || false;
  this.O = a && a.encodeInitMessageHeaders || false;
  this.P && this.O && (this.O = false);
  this.bb = a && a.bc || false;
  a && a.Ea && this.l.Ea();
  a && a.forceLongPolling && (this.aa = false);
  this.ca = !this.P && this.aa && a && a.detectBufferingProxy || false;
  this.qa = void 0;
  a && a.longPollingTimeout && 0 < a.longPollingTimeout && (this.qa = a.longPollingTimeout);
  this.oa = void 0;
  this.S = 0;
  this.M = false;
  this.ma = this.B = null;
}
k$1 = Ed.prototype;
k$1.ra = 8;
k$1.H = 1;
function Hc$1(a) {
  Fd(a);
  if (3 == a.H) {
    var b2 = a.W++, c = G$1(a.I);
    K$1(c, "SID", a.K);
    K$1(c, "RID", b2);
    K$1(c, "TYPE", "terminate");
    Gd(a, c);
    b2 = new bc$1(a, a.l, b2);
    b2.L = 2;
    b2.v = hc$1(G$1(c));
    c = false;
    if (l.navigator && l.navigator.sendBeacon)
      try {
        c = l.navigator.sendBeacon(b2.v.toString(), "");
      } catch (d) {
      }
    !c && l.Image && (new Image().src = b2.v, c = true);
    c || (b2.g = lc$1(b2.l, null), b2.g.ha(b2.v));
    b2.G = Date.now();
    jc$1(b2);
  }
  Hd(a);
}
function zc$1(a) {
  a.g && (vc$1(a), a.g.cancel(), a.g = null);
}
function Fd(a) {
  zc$1(a);
  a.u && (l.clearTimeout(a.u), a.u = null);
  yc$1(a);
  a.i.cancel();
  a.m && ("number" === typeof a.m && l.clearTimeout(a.m), a.m = null);
}
function Gc$1(a) {
  if (!ed(a.i) && !a.m) {
    a.m = true;
    var b2 = a.Na;
    sb || vb();
    tb || (sb(), tb = true);
    mb.add(b2, a);
    a.C = 0;
  }
}
function Id(a, b2) {
  if (Bc$1(a.i) >= a.i.j - (a.m ? 1 : 0))
    return false;
  if (a.m)
    return a.j = b2.F.concat(a.j), true;
  if (1 == a.H || 2 == a.H || a.C >= (a.cb ? 0 : a.eb))
    return false;
  a.m = Rb(q$1(a.Na, a, b2), Jd(a, a.C));
  a.C++;
  return true;
}
k$1.Na = function(a) {
  if (this.m)
    if (this.m = null, 1 == this.H) {
      if (!a) {
        this.W = Math.floor(1e5 * Math.random());
        a = this.W++;
        const e = new bc$1(this, this.l, a);
        let f = this.s;
        this.U && (f ? (f = Pa$1(f), Ra(f, this.U)) : f = this.U);
        null !== this.o || this.O || (e.I = f, f = null);
        if (this.P)
          a: {
            var b2 = 0;
            for (var c = 0; c < this.j.length; c++) {
              b: {
                var d = this.j[c];
                if ("__data__" in d.map && (d = d.map.__data__, "string" === typeof d)) {
                  d = d.length;
                  break b;
                }
                d = void 0;
              }
              if (void 0 === d)
                break;
              b2 += d;
              if (4096 < b2) {
                b2 = c;
                break a;
              }
              if (4096 === b2 || c === this.j.length - 1) {
                b2 = c + 1;
                break a;
              }
            }
            b2 = 1e3;
          }
        else
          b2 = 1e3;
        b2 = Kd(this, e, b2);
        c = G$1(this.I);
        K$1(c, "RID", a);
        K$1(c, "CVER", 22);
        this.F && K$1(c, "X-HTTP-Session-Id", this.F);
        Gd(this, c);
        f && (this.O ? b2 = "headers=" + encodeURIComponent(String(Bd(f))) + "&" + b2 : this.o && Cd(c, this.o, f));
        Cc$1(this.i, e);
        this.bb && K$1(c, "TYPE", "init");
        this.P ? (K$1(c, "$req", b2), K$1(c, "SID", "null"), e.aa = true, gc$1(e, c, null)) : gc$1(e, c, b2);
        this.H = 2;
      }
    } else
      3 == this.H && (a ? Ld(this, a) : 0 == this.j.length || ed(this.i) || Ld(this));
};
function Ld(a, b2) {
  var c;
  b2 ? c = b2.m : c = a.W++;
  const d = G$1(a.I);
  K$1(d, "SID", a.K);
  K$1(d, "RID", c);
  K$1(d, "AID", a.V);
  Gd(a, d);
  a.o && a.s && Cd(d, a.o, a.s);
  c = new bc$1(a, a.l, c, a.C + 1);
  null === a.o && (c.I = a.s);
  b2 && (a.j = b2.F.concat(a.j));
  b2 = Kd(a, c, 1e3);
  c.setTimeout(Math.round(0.5 * a.xa) + Math.round(0.5 * a.xa * Math.random()));
  Cc$1(a.i, c);
  gc$1(c, d, b2);
}
function Gd(a, b2) {
  a.na && Na$1(a.na, function(c, d) {
    K$1(b2, d, c);
  });
  a.h && Kc$1({}, function(c, d) {
    K$1(b2, d, c);
  });
}
function Kd(a, b2, c) {
  c = Math.min(a.j.length, c);
  var d = a.h ? q$1(a.h.Va, a.h, a) : null;
  a: {
    var e = a.j;
    let f = -1;
    for (; ; ) {
      const h = ["count=" + c];
      -1 == f ? 0 < c ? (f = e[0].g, h.push("ofs=" + f)) : f = 0 : h.push("ofs=" + f);
      let n = true;
      for (let t = 0; t < c; t++) {
        let m = e[t].g;
        const u = e[t].map;
        m -= f;
        if (0 > m)
          f = Math.max(0, e[t].g - 100), n = false;
        else
          try {
            id(u, h, "req" + m + "_");
          } catch (L2) {
            d && d(u);
          }
      }
      if (n) {
        d = h.join("&");
        break a;
      }
    }
  }
  a = a.j.splice(0, c);
  b2.F = a;
  return d;
}
function Fc$1(a) {
  if (!a.g && !a.u) {
    a.ba = 1;
    var b2 = a.Ma;
    sb || vb();
    tb || (sb(), tb = true);
    mb.add(b2, a);
    a.A = 0;
  }
}
function Ac$1(a) {
  if (a.g || a.u || 3 <= a.A)
    return false;
  a.ba++;
  a.u = Rb(q$1(a.Ma, a), Jd(a, a.A));
  a.A++;
  return true;
}
k$1.Ma = function() {
  this.u = null;
  Md(this);
  if (this.ca && !(this.M || null == this.g || 0 >= this.S)) {
    var a = 2 * this.S;
    this.l.info("BP detection timer enabled: " + a);
    this.B = Rb(q$1(this.jb, this), a);
  }
};
k$1.jb = function() {
  this.B && (this.B = null, this.l.info("BP detection timeout reached."), this.l.info("Buffering proxy detected and switch to long-polling!"), this.G = false, this.M = true, F$1(10), zc$1(this), Md(this));
};
function vc$1(a) {
  null != a.B && (l.clearTimeout(a.B), a.B = null);
}
function Md(a) {
  a.g = new bc$1(a, a.l, "rpc", a.ba);
  null === a.o && (a.g.I = a.s);
  a.g.O = 0;
  var b2 = G$1(a.wa);
  K$1(b2, "RID", "rpc");
  K$1(b2, "SID", a.K);
  K$1(b2, "AID", a.V);
  K$1(b2, "CI", a.G ? "0" : "1");
  !a.G && a.qa && K$1(b2, "TO", a.qa);
  K$1(b2, "TYPE", "xmlhttp");
  Gd(a, b2);
  a.o && a.s && Cd(b2, a.o, a.s);
  a.L && a.g.setTimeout(a.L);
  var c = a.g;
  a = a.pa;
  c.L = 1;
  c.v = hc$1(G$1(b2));
  c.s = null;
  c.S = true;
  ic$1(c, a);
}
k$1.ib = function() {
  null != this.v && (this.v = null, zc$1(this), Ac$1(this), F$1(19));
};
function yc$1(a) {
  null != a.v && (l.clearTimeout(a.v), a.v = null);
}
function sc$1(a, b2) {
  var c = null;
  if (a.g == b2) {
    yc$1(a);
    vc$1(a);
    a.g = null;
    var d = 2;
  } else if (xc$1(a.i, b2))
    c = b2.F, Ec$1(a.i, b2), d = 1;
  else
    return;
  if (0 != a.H) {
    if (b2.i)
      if (1 == d) {
        c = b2.s ? b2.s.length : 0;
        b2 = Date.now() - b2.G;
        var e = a.C;
        d = Mb();
        C$1(d, new Qb(d, c));
        Gc$1(a);
      } else
        Fc$1(a);
    else if (e = b2.o, 3 == e || 0 == e && 0 < b2.ca || !(1 == d && Id(a, b2) || 2 == d && Ac$1(a)))
      switch (c && 0 < c.length && (b2 = a.i, b2.i = b2.i.concat(c)), e) {
        case 1:
          J$1(a, 5);
          break;
        case 4:
          J$1(a, 10);
          break;
        case 3:
          J$1(a, 6);
          break;
        default:
          J$1(a, 2);
      }
  }
}
function Jd(a, b2) {
  let c = a.ab + Math.floor(Math.random() * a.hb);
  a.isActive() || (c *= 2);
  return c * b2;
}
function J$1(a, b2) {
  a.l.info("Error code " + b2);
  if (2 == b2) {
    var c = null;
    a.h && (c = null);
    var d = q$1(a.pb, a);
    c || (c = new M$1("//www.google.com/images/cleardot.gif"), l.location && "http" == l.location.protocol || Nc$1(c, "https"), hc$1(c));
    jd(c.toString(), d);
  } else
    F$1(2);
  a.H = 0;
  a.h && a.h.za(b2);
  Hd(a);
  Fd(a);
}
k$1.pb = function(a) {
  a ? (this.l.info("Successfully pinged google.com"), F$1(2)) : (this.l.info("Failed to ping google.com"), F$1(1));
};
function Hd(a) {
  a.H = 0;
  a.ma = [];
  if (a.h) {
    const b2 = fd(a.i);
    if (0 != b2.length || 0 != a.j.length)
      na$1(a.ma, b2), na$1(a.ma, a.j), a.i.i.length = 0, ma(a.j), a.j.length = 0;
    a.h.ya();
  }
}
function Dc$1(a, b2, c) {
  var d = c instanceof M$1 ? G$1(c) : new M$1(c);
  if ("" != d.g)
    b2 && (d.g = b2 + "." + d.g), Oc(d, d.m);
  else {
    var e = l.location;
    d = e.protocol;
    b2 = b2 ? b2 + "." + e.hostname : e.hostname;
    e = +e.port;
    var f = new M$1(null);
    d && Nc$1(f, d);
    b2 && (f.g = b2);
    e && Oc(f, e);
    c && (f.l = c);
    d = f;
  }
  c = a.F;
  b2 = a.Da;
  c && b2 && K$1(d, c, b2);
  K$1(d, "VER", a.ra);
  Gd(a, d);
  return d;
}
function lc$1(a, b2, c) {
  if (b2 && !a.J)
    throw Error("Can't create secondary domain capable XhrIo object.");
  b2 = c && a.Ha && !a.va ? new P(new ld({ ob: true })) : new P(a.va);
  b2.Oa(a.J);
  return b2;
}
k$1.isActive = function() {
  return !!this.h && this.h.isActive(this);
};
function Nd() {
}
k$1 = Nd.prototype;
k$1.Ba = function() {
};
k$1.Aa = function() {
};
k$1.za = function() {
};
k$1.ya = function() {
};
k$1.isActive = function() {
  return true;
};
k$1.Va = function() {
};
function Od() {
  if (z$1 && !(10 <= Number(Fa)))
    throw Error("Environmental error: no available transport.");
}
Od.prototype.g = function(a, b2) {
  return new Q$1(a, b2);
};
function Q$1(a, b2) {
  B.call(this);
  this.g = new Ed(b2);
  this.l = a;
  this.h = b2 && b2.messageUrlParams || null;
  a = b2 && b2.messageHeaders || null;
  b2 && b2.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" });
  this.g.s = a;
  a = b2 && b2.initMessageHeaders || null;
  b2 && b2.messageContentType && (a ? a["X-WebChannel-Content-Type"] = b2.messageContentType : a = { "X-WebChannel-Content-Type": b2.messageContentType });
  b2 && b2.Ca && (a ? a["X-WebChannel-Client-Profile"] = b2.Ca : a = { "X-WebChannel-Client-Profile": b2.Ca });
  this.g.U = a;
  (a = b2 && b2.cc) && !x(a) && (this.g.o = a);
  this.A = b2 && b2.supportsCrossDomainXhr || false;
  this.v = b2 && b2.sendRawJson || false;
  (b2 = b2 && b2.httpSessionIdParam) && !x(b2) && (this.g.F = b2, a = this.h, null !== a && b2 in a && (a = this.h, b2 in a && delete a[b2]));
  this.j = new R(this);
}
r(Q$1, B);
Q$1.prototype.m = function() {
  this.g.h = this.j;
  this.A && (this.g.J = true);
  var a = this.g, b2 = this.l, c = this.h || void 0;
  F$1(0);
  a.Y = b2;
  a.na = c || {};
  a.G = a.aa;
  a.I = Dc$1(a, null, a.Y);
  Gc$1(a);
};
Q$1.prototype.close = function() {
  Hc$1(this.g);
};
Q$1.prototype.u = function(a) {
  var b2 = this.g;
  if ("string" === typeof a) {
    var c = {};
    c.__data__ = a;
    a = c;
  } else
    this.v && (c = {}, c.__data__ = jb(a), a = c);
  b2.j.push(new bd(b2.fb++, a));
  3 == b2.H && Gc$1(b2);
};
Q$1.prototype.N = function() {
  this.g.h = null;
  delete this.j;
  Hc$1(this.g);
  delete this.g;
  Q$1.$.N.call(this);
};
function Pd(a) {
  Yb.call(this);
  a.__headers__ && (this.headers = a.__headers__, this.statusCode = a.__status__, delete a.__headers__, delete a.__status__);
  var b2 = a.__sm__;
  if (b2) {
    a: {
      for (const c in b2) {
        a = c;
        break a;
      }
      a = void 0;
    }
    if (this.i = a)
      a = this.i, b2 = null !== b2 && a in b2 ? b2[a] : void 0;
    this.data = b2;
  } else
    this.data = a;
}
r(Pd, Yb);
function Qd() {
  Zb.call(this);
  this.status = 1;
}
r(Qd, Zb);
function R(a) {
  this.g = a;
}
r(R, Nd);
R.prototype.Ba = function() {
  C$1(this.g, "a");
};
R.prototype.Aa = function(a) {
  C$1(this.g, new Pd(a));
};
R.prototype.za = function(a) {
  C$1(this.g, new Qd());
};
R.prototype.ya = function() {
  C$1(this.g, "b");
};
function Rd() {
  this.blockSize = -1;
}
function S$1() {
  this.blockSize = -1;
  this.blockSize = 64;
  this.g = Array(4);
  this.m = Array(this.blockSize);
  this.i = this.h = 0;
  this.reset();
}
r(S$1, Rd);
S$1.prototype.reset = function() {
  this.g[0] = 1732584193;
  this.g[1] = 4023233417;
  this.g[2] = 2562383102;
  this.g[3] = 271733878;
  this.i = this.h = 0;
};
function Sd(a, b2, c) {
  c || (c = 0);
  var d = Array(16);
  if ("string" === typeof b2)
    for (var e = 0; 16 > e; ++e)
      d[e] = b2.charCodeAt(c++) | b2.charCodeAt(c++) << 8 | b2.charCodeAt(c++) << 16 | b2.charCodeAt(c++) << 24;
  else
    for (e = 0; 16 > e; ++e)
      d[e] = b2[c++] | b2[c++] << 8 | b2[c++] << 16 | b2[c++] << 24;
  b2 = a.g[0];
  c = a.g[1];
  e = a.g[2];
  var f = a.g[3];
  var h = b2 + (f ^ c & (e ^ f)) + d[0] + 3614090360 & 4294967295;
  b2 = c + (h << 7 & 4294967295 | h >>> 25);
  h = f + (e ^ b2 & (c ^ e)) + d[1] + 3905402710 & 4294967295;
  f = b2 + (h << 12 & 4294967295 | h >>> 20);
  h = e + (c ^ f & (b2 ^ c)) + d[2] + 606105819 & 4294967295;
  e = f + (h << 17 & 4294967295 | h >>> 15);
  h = c + (b2 ^ e & (f ^ b2)) + d[3] + 3250441966 & 4294967295;
  c = e + (h << 22 & 4294967295 | h >>> 10);
  h = b2 + (f ^ c & (e ^ f)) + d[4] + 4118548399 & 4294967295;
  b2 = c + (h << 7 & 4294967295 | h >>> 25);
  h = f + (e ^ b2 & (c ^ e)) + d[5] + 1200080426 & 4294967295;
  f = b2 + (h << 12 & 4294967295 | h >>> 20);
  h = e + (c ^ f & (b2 ^ c)) + d[6] + 2821735955 & 4294967295;
  e = f + (h << 17 & 4294967295 | h >>> 15);
  h = c + (b2 ^ e & (f ^ b2)) + d[7] + 4249261313 & 4294967295;
  c = e + (h << 22 & 4294967295 | h >>> 10);
  h = b2 + (f ^ c & (e ^ f)) + d[8] + 1770035416 & 4294967295;
  b2 = c + (h << 7 & 4294967295 | h >>> 25);
  h = f + (e ^ b2 & (c ^ e)) + d[9] + 2336552879 & 4294967295;
  f = b2 + (h << 12 & 4294967295 | h >>> 20);
  h = e + (c ^ f & (b2 ^ c)) + d[10] + 4294925233 & 4294967295;
  e = f + (h << 17 & 4294967295 | h >>> 15);
  h = c + (b2 ^ e & (f ^ b2)) + d[11] + 2304563134 & 4294967295;
  c = e + (h << 22 & 4294967295 | h >>> 10);
  h = b2 + (f ^ c & (e ^ f)) + d[12] + 1804603682 & 4294967295;
  b2 = c + (h << 7 & 4294967295 | h >>> 25);
  h = f + (e ^ b2 & (c ^ e)) + d[13] + 4254626195 & 4294967295;
  f = b2 + (h << 12 & 4294967295 | h >>> 20);
  h = e + (c ^ f & (b2 ^ c)) + d[14] + 2792965006 & 4294967295;
  e = f + (h << 17 & 4294967295 | h >>> 15);
  h = c + (b2 ^ e & (f ^ b2)) + d[15] + 1236535329 & 4294967295;
  c = e + (h << 22 & 4294967295 | h >>> 10);
  h = b2 + (e ^ f & (c ^ e)) + d[1] + 4129170786 & 4294967295;
  b2 = c + (h << 5 & 4294967295 | h >>> 27);
  h = f + (c ^ e & (b2 ^ c)) + d[6] + 3225465664 & 4294967295;
  f = b2 + (h << 9 & 4294967295 | h >>> 23);
  h = e + (b2 ^ c & (f ^ b2)) + d[11] + 643717713 & 4294967295;
  e = f + (h << 14 & 4294967295 | h >>> 18);
  h = c + (f ^ b2 & (e ^ f)) + d[0] + 3921069994 & 4294967295;
  c = e + (h << 20 & 4294967295 | h >>> 12);
  h = b2 + (e ^ f & (c ^ e)) + d[5] + 3593408605 & 4294967295;
  b2 = c + (h << 5 & 4294967295 | h >>> 27);
  h = f + (c ^ e & (b2 ^ c)) + d[10] + 38016083 & 4294967295;
  f = b2 + (h << 9 & 4294967295 | h >>> 23);
  h = e + (b2 ^ c & (f ^ b2)) + d[15] + 3634488961 & 4294967295;
  e = f + (h << 14 & 4294967295 | h >>> 18);
  h = c + (f ^ b2 & (e ^ f)) + d[4] + 3889429448 & 4294967295;
  c = e + (h << 20 & 4294967295 | h >>> 12);
  h = b2 + (e ^ f & (c ^ e)) + d[9] + 568446438 & 4294967295;
  b2 = c + (h << 5 & 4294967295 | h >>> 27);
  h = f + (c ^ e & (b2 ^ c)) + d[14] + 3275163606 & 4294967295;
  f = b2 + (h << 9 & 4294967295 | h >>> 23);
  h = e + (b2 ^ c & (f ^ b2)) + d[3] + 4107603335 & 4294967295;
  e = f + (h << 14 & 4294967295 | h >>> 18);
  h = c + (f ^ b2 & (e ^ f)) + d[8] + 1163531501 & 4294967295;
  c = e + (h << 20 & 4294967295 | h >>> 12);
  h = b2 + (e ^ f & (c ^ e)) + d[13] + 2850285829 & 4294967295;
  b2 = c + (h << 5 & 4294967295 | h >>> 27);
  h = f + (c ^ e & (b2 ^ c)) + d[2] + 4243563512 & 4294967295;
  f = b2 + (h << 9 & 4294967295 | h >>> 23);
  h = e + (b2 ^ c & (f ^ b2)) + d[7] + 1735328473 & 4294967295;
  e = f + (h << 14 & 4294967295 | h >>> 18);
  h = c + (f ^ b2 & (e ^ f)) + d[12] + 2368359562 & 4294967295;
  c = e + (h << 20 & 4294967295 | h >>> 12);
  h = b2 + (c ^ e ^ f) + d[5] + 4294588738 & 4294967295;
  b2 = c + (h << 4 & 4294967295 | h >>> 28);
  h = f + (b2 ^ c ^ e) + d[8] + 2272392833 & 4294967295;
  f = b2 + (h << 11 & 4294967295 | h >>> 21);
  h = e + (f ^ b2 ^ c) + d[11] + 1839030562 & 4294967295;
  e = f + (h << 16 & 4294967295 | h >>> 16);
  h = c + (e ^ f ^ b2) + d[14] + 4259657740 & 4294967295;
  c = e + (h << 23 & 4294967295 | h >>> 9);
  h = b2 + (c ^ e ^ f) + d[1] + 2763975236 & 4294967295;
  b2 = c + (h << 4 & 4294967295 | h >>> 28);
  h = f + (b2 ^ c ^ e) + d[4] + 1272893353 & 4294967295;
  f = b2 + (h << 11 & 4294967295 | h >>> 21);
  h = e + (f ^ b2 ^ c) + d[7] + 4139469664 & 4294967295;
  e = f + (h << 16 & 4294967295 | h >>> 16);
  h = c + (e ^ f ^ b2) + d[10] + 3200236656 & 4294967295;
  c = e + (h << 23 & 4294967295 | h >>> 9);
  h = b2 + (c ^ e ^ f) + d[13] + 681279174 & 4294967295;
  b2 = c + (h << 4 & 4294967295 | h >>> 28);
  h = f + (b2 ^ c ^ e) + d[0] + 3936430074 & 4294967295;
  f = b2 + (h << 11 & 4294967295 | h >>> 21);
  h = e + (f ^ b2 ^ c) + d[3] + 3572445317 & 4294967295;
  e = f + (h << 16 & 4294967295 | h >>> 16);
  h = c + (e ^ f ^ b2) + d[6] + 76029189 & 4294967295;
  c = e + (h << 23 & 4294967295 | h >>> 9);
  h = b2 + (c ^ e ^ f) + d[9] + 3654602809 & 4294967295;
  b2 = c + (h << 4 & 4294967295 | h >>> 28);
  h = f + (b2 ^ c ^ e) + d[12] + 3873151461 & 4294967295;
  f = b2 + (h << 11 & 4294967295 | h >>> 21);
  h = e + (f ^ b2 ^ c) + d[15] + 530742520 & 4294967295;
  e = f + (h << 16 & 4294967295 | h >>> 16);
  h = c + (e ^ f ^ b2) + d[2] + 3299628645 & 4294967295;
  c = e + (h << 23 & 4294967295 | h >>> 9);
  h = b2 + (e ^ (c | ~f)) + d[0] + 4096336452 & 4294967295;
  b2 = c + (h << 6 & 4294967295 | h >>> 26);
  h = f + (c ^ (b2 | ~e)) + d[7] + 1126891415 & 4294967295;
  f = b2 + (h << 10 & 4294967295 | h >>> 22);
  h = e + (b2 ^ (f | ~c)) + d[14] + 2878612391 & 4294967295;
  e = f + (h << 15 & 4294967295 | h >>> 17);
  h = c + (f ^ (e | ~b2)) + d[5] + 4237533241 & 4294967295;
  c = e + (h << 21 & 4294967295 | h >>> 11);
  h = b2 + (e ^ (c | ~f)) + d[12] + 1700485571 & 4294967295;
  b2 = c + (h << 6 & 4294967295 | h >>> 26);
  h = f + (c ^ (b2 | ~e)) + d[3] + 2399980690 & 4294967295;
  f = b2 + (h << 10 & 4294967295 | h >>> 22);
  h = e + (b2 ^ (f | ~c)) + d[10] + 4293915773 & 4294967295;
  e = f + (h << 15 & 4294967295 | h >>> 17);
  h = c + (f ^ (e | ~b2)) + d[1] + 2240044497 & 4294967295;
  c = e + (h << 21 & 4294967295 | h >>> 11);
  h = b2 + (e ^ (c | ~f)) + d[8] + 1873313359 & 4294967295;
  b2 = c + (h << 6 & 4294967295 | h >>> 26);
  h = f + (c ^ (b2 | ~e)) + d[15] + 4264355552 & 4294967295;
  f = b2 + (h << 10 & 4294967295 | h >>> 22);
  h = e + (b2 ^ (f | ~c)) + d[6] + 2734768916 & 4294967295;
  e = f + (h << 15 & 4294967295 | h >>> 17);
  h = c + (f ^ (e | ~b2)) + d[13] + 1309151649 & 4294967295;
  c = e + (h << 21 & 4294967295 | h >>> 11);
  h = b2 + (e ^ (c | ~f)) + d[4] + 4149444226 & 4294967295;
  b2 = c + (h << 6 & 4294967295 | h >>> 26);
  h = f + (c ^ (b2 | ~e)) + d[11] + 3174756917 & 4294967295;
  f = b2 + (h << 10 & 4294967295 | h >>> 22);
  h = e + (b2 ^ (f | ~c)) + d[2] + 718787259 & 4294967295;
  e = f + (h << 15 & 4294967295 | h >>> 17);
  h = c + (f ^ (e | ~b2)) + d[9] + 3951481745 & 4294967295;
  a.g[0] = a.g[0] + b2 & 4294967295;
  a.g[1] = a.g[1] + (e + (h << 21 & 4294967295 | h >>> 11)) & 4294967295;
  a.g[2] = a.g[2] + e & 4294967295;
  a.g[3] = a.g[3] + f & 4294967295;
}
S$1.prototype.j = function(a, b2) {
  void 0 === b2 && (b2 = a.length);
  for (var c = b2 - this.blockSize, d = this.m, e = this.h, f = 0; f < b2; ) {
    if (0 == e)
      for (; f <= c; )
        Sd(this, a, f), f += this.blockSize;
    if ("string" === typeof a)
      for (; f < b2; ) {
        if (d[e++] = a.charCodeAt(f++), e == this.blockSize) {
          Sd(this, d);
          e = 0;
          break;
        }
      }
    else
      for (; f < b2; )
        if (d[e++] = a[f++], e == this.blockSize) {
          Sd(this, d);
          e = 0;
          break;
        }
  }
  this.h = e;
  this.i += b2;
};
S$1.prototype.l = function() {
  var a = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
  a[0] = 128;
  for (var b2 = 1; b2 < a.length - 8; ++b2)
    a[b2] = 0;
  var c = 8 * this.i;
  for (b2 = a.length - 8; b2 < a.length; ++b2)
    a[b2] = c & 255, c /= 256;
  this.j(a);
  a = Array(16);
  for (b2 = c = 0; 4 > b2; ++b2)
    for (var d = 0; 32 > d; d += 8)
      a[c++] = this.g[b2] >>> d & 255;
  return a;
};
function T(a, b2) {
  this.h = b2;
  for (var c = [], d = true, e = a.length - 1; 0 <= e; e--) {
    var f = a[e] | 0;
    d && f == b2 || (c[e] = f, d = false);
  }
  this.g = c;
}
var sa$1 = {};
function Td(a) {
  return -128 <= a && 128 > a ? ra$1(a, function(b2) {
    return new T([b2 | 0], 0 > b2 ? -1 : 0);
  }) : new T([a | 0], 0 > a ? -1 : 0);
}
function U$1(a) {
  if (isNaN(a) || !isFinite(a))
    return V$1;
  if (0 > a)
    return W$1(U$1(-a));
  for (var b2 = [], c = 1, d = 0; a >= c; d++)
    b2[d] = a / c | 0, c *= Ud;
  return new T(b2, 0);
}
function Vd(a, b2) {
  if (0 == a.length)
    throw Error("number format error: empty string");
  b2 = b2 || 10;
  if (2 > b2 || 36 < b2)
    throw Error("radix out of range: " + b2);
  if ("-" == a.charAt(0))
    return W$1(Vd(a.substring(1), b2));
  if (0 <= a.indexOf("-"))
    throw Error('number format error: interior "-" character');
  for (var c = U$1(Math.pow(b2, 8)), d = V$1, e = 0; e < a.length; e += 8) {
    var f = Math.min(8, a.length - e), h = parseInt(a.substring(e, e + f), b2);
    8 > f ? (f = U$1(Math.pow(b2, f)), d = d.R(f).add(U$1(h))) : (d = d.R(c), d = d.add(U$1(h)));
  }
  return d;
}
var Ud = 4294967296, V$1 = Td(0), Wd = Td(1), Xd = Td(16777216);
k$1 = T.prototype;
k$1.ea = function() {
  if (X(this))
    return -W$1(this).ea();
  for (var a = 0, b2 = 1, c = 0; c < this.g.length; c++) {
    var d = this.D(c);
    a += (0 <= d ? d : Ud + d) * b2;
    b2 *= Ud;
  }
  return a;
};
k$1.toString = function(a) {
  a = a || 10;
  if (2 > a || 36 < a)
    throw Error("radix out of range: " + a);
  if (Y$1(this))
    return "0";
  if (X(this))
    return "-" + W$1(this).toString(a);
  for (var b2 = U$1(Math.pow(a, 6)), c = this, d = ""; ; ) {
    var e = Yd(c, b2).g;
    c = Zd(c, e.R(b2));
    var f = ((0 < c.g.length ? c.g[0] : c.h) >>> 0).toString(a);
    c = e;
    if (Y$1(c))
      return f + d;
    for (; 6 > f.length; )
      f = "0" + f;
    d = f + d;
  }
};
k$1.D = function(a) {
  return 0 > a ? 0 : a < this.g.length ? this.g[a] : this.h;
};
function Y$1(a) {
  if (0 != a.h)
    return false;
  for (var b2 = 0; b2 < a.g.length; b2++)
    if (0 != a.g[b2])
      return false;
  return true;
}
function X(a) {
  return -1 == a.h;
}
k$1.X = function(a) {
  a = Zd(this, a);
  return X(a) ? -1 : Y$1(a) ? 0 : 1;
};
function W$1(a) {
  for (var b2 = a.g.length, c = [], d = 0; d < b2; d++)
    c[d] = ~a.g[d];
  return new T(c, ~a.h).add(Wd);
}
k$1.abs = function() {
  return X(this) ? W$1(this) : this;
};
k$1.add = function(a) {
  for (var b2 = Math.max(this.g.length, a.g.length), c = [], d = 0, e = 0; e <= b2; e++) {
    var f = d + (this.D(e) & 65535) + (a.D(e) & 65535), h = (f >>> 16) + (this.D(e) >>> 16) + (a.D(e) >>> 16);
    d = h >>> 16;
    f &= 65535;
    h &= 65535;
    c[e] = h << 16 | f;
  }
  return new T(c, c[c.length - 1] & -2147483648 ? -1 : 0);
};
function Zd(a, b2) {
  return a.add(W$1(b2));
}
k$1.R = function(a) {
  if (Y$1(this) || Y$1(a))
    return V$1;
  if (X(this))
    return X(a) ? W$1(this).R(W$1(a)) : W$1(W$1(this).R(a));
  if (X(a))
    return W$1(this.R(W$1(a)));
  if (0 > this.X(Xd) && 0 > a.X(Xd))
    return U$1(this.ea() * a.ea());
  for (var b2 = this.g.length + a.g.length, c = [], d = 0; d < 2 * b2; d++)
    c[d] = 0;
  for (d = 0; d < this.g.length; d++)
    for (var e = 0; e < a.g.length; e++) {
      var f = this.D(d) >>> 16, h = this.D(d) & 65535, n = a.D(e) >>> 16, t = a.D(e) & 65535;
      c[2 * d + 2 * e] += h * t;
      $d(c, 2 * d + 2 * e);
      c[2 * d + 2 * e + 1] += f * t;
      $d(c, 2 * d + 2 * e + 1);
      c[2 * d + 2 * e + 1] += h * n;
      $d(c, 2 * d + 2 * e + 1);
      c[2 * d + 2 * e + 2] += f * n;
      $d(c, 2 * d + 2 * e + 2);
    }
  for (d = 0; d < b2; d++)
    c[d] = c[2 * d + 1] << 16 | c[2 * d];
  for (d = b2; d < 2 * b2; d++)
    c[d] = 0;
  return new T(c, 0);
};
function $d(a, b2) {
  for (; (a[b2] & 65535) != a[b2]; )
    a[b2 + 1] += a[b2] >>> 16, a[b2] &= 65535, b2++;
}
function ae(a, b2) {
  this.g = a;
  this.h = b2;
}
function Yd(a, b2) {
  if (Y$1(b2))
    throw Error("division by zero");
  if (Y$1(a))
    return new ae(V$1, V$1);
  if (X(a))
    return b2 = Yd(W$1(a), b2), new ae(W$1(b2.g), W$1(b2.h));
  if (X(b2))
    return b2 = Yd(a, W$1(b2)), new ae(W$1(b2.g), b2.h);
  if (30 < a.g.length) {
    if (X(a) || X(b2))
      throw Error("slowDivide_ only works with positive integers.");
    for (var c = Wd, d = b2; 0 >= d.X(a); )
      c = be(c), d = be(d);
    var e = Z$1(c, 1), f = Z$1(d, 1);
    d = Z$1(d, 2);
    for (c = Z$1(c, 2); !Y$1(d); ) {
      var h = f.add(d);
      0 >= h.X(a) && (e = e.add(c), f = h);
      d = Z$1(d, 1);
      c = Z$1(c, 1);
    }
    b2 = Zd(a, e.R(b2));
    return new ae(e, b2);
  }
  for (e = V$1; 0 <= a.X(b2); ) {
    c = Math.max(1, Math.floor(a.ea() / b2.ea()));
    d = Math.ceil(Math.log(c) / Math.LN2);
    d = 48 >= d ? 1 : Math.pow(2, d - 48);
    f = U$1(c);
    for (h = f.R(b2); X(h) || 0 < h.X(a); )
      c -= d, f = U$1(c), h = f.R(b2);
    Y$1(f) && (f = Wd);
    e = e.add(f);
    a = Zd(a, h);
  }
  return new ae(e, a);
}
k$1.gb = function(a) {
  return Yd(this, a).h;
};
k$1.and = function(a) {
  for (var b2 = Math.max(this.g.length, a.g.length), c = [], d = 0; d < b2; d++)
    c[d] = this.D(d) & a.D(d);
  return new T(c, this.h & a.h);
};
k$1.or = function(a) {
  for (var b2 = Math.max(this.g.length, a.g.length), c = [], d = 0; d < b2; d++)
    c[d] = this.D(d) | a.D(d);
  return new T(c, this.h | a.h);
};
k$1.xor = function(a) {
  for (var b2 = Math.max(this.g.length, a.g.length), c = [], d = 0; d < b2; d++)
    c[d] = this.D(d) ^ a.D(d);
  return new T(c, this.h ^ a.h);
};
function be(a) {
  for (var b2 = a.g.length + 1, c = [], d = 0; d < b2; d++)
    c[d] = a.D(d) << 1 | a.D(d - 1) >>> 31;
  return new T(c, a.h);
}
function Z$1(a, b2) {
  var c = b2 >> 5;
  b2 %= 32;
  for (var d = a.g.length - c, e = [], f = 0; f < d; f++)
    e[f] = 0 < b2 ? a.D(f + c) >>> b2 | a.D(f + c + 1) << 32 - b2 : a.D(f + c);
  return new T(e, a.h);
}
Od.prototype.createWebChannel = Od.prototype.g;
Q$1.prototype.send = Q$1.prototype.u;
Q$1.prototype.open = Q$1.prototype.m;
Q$1.prototype.close = Q$1.prototype.close;
Sb.NO_ERROR = 0;
Sb.TIMEOUT = 8;
Sb.HTTP_ERROR = 6;
Tb.COMPLETE = "complete";
Wb.EventType = Xb;
Xb.OPEN = "a";
Xb.CLOSE = "b";
Xb.ERROR = "c";
Xb.MESSAGE = "d";
B.prototype.listen = B.prototype.O;
P.prototype.listenOnce = P.prototype.P;
P.prototype.getLastError = P.prototype.Sa;
P.prototype.getLastErrorCode = P.prototype.Ia;
P.prototype.getStatus = P.prototype.da;
P.prototype.getResponseJson = P.prototype.Wa;
P.prototype.getResponseText = P.prototype.ja;
P.prototype.send = P.prototype.ha;
P.prototype.setWithCredentials = P.prototype.Oa;
S$1.prototype.digest = S$1.prototype.l;
S$1.prototype.reset = S$1.prototype.reset;
S$1.prototype.update = S$1.prototype.j;
T.prototype.add = T.prototype.add;
T.prototype.multiply = T.prototype.R;
T.prototype.modulo = T.prototype.gb;
T.prototype.compare = T.prototype.X;
T.prototype.toNumber = T.prototype.ea;
T.prototype.toString = T.prototype.toString;
T.prototype.getBits = T.prototype.D;
T.fromNumber = U$1;
T.fromString = Vd;
var createWebChannelTransport = function() {
  return new Od();
};
var getStatEventTarget = function() {
  return Mb();
};
var ErrorCode = Sb;
var EventType = Tb;
var Event = E;
var Stat = { xb: 0, Ab: 1, Bb: 2, Ub: 3, Zb: 4, Wb: 5, Xb: 6, Vb: 7, Tb: 8, Yb: 9, PROXY: 10, NOPROXY: 11, Rb: 12, Nb: 13, Ob: 14, Mb: 15, Pb: 16, Qb: 17, tb: 18, sb: 19, ub: 20 };
var FetchXmlHttpFactory = ld;
var WebChannel = Wb;
var XhrIo = P;
var Md5 = S$1;
var Integer = T;
const b = "@firebase/firestore";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class V {
  constructor(t) {
    this.uid = t;
  }
  isAuthenticated() {
    return null != this.uid;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(t) {
    return t.uid === this.uid;
  }
}
V.UNAUTHENTICATED = new V(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
V.GOOGLE_CREDENTIALS = new V("google-credentials-uid"), V.FIRST_PARTY = new V("first-party-uid"), V.MOCK_USER = new V("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let S = "9.23.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const D = new Logger("@firebase/firestore");
function C() {
  return D.logLevel;
}
function N(t, ...e) {
  if (D.logLevel <= LogLevel.DEBUG) {
    const n = e.map($);
    D.debug(`Firestore (${S}): ${t}`, ...n);
  }
}
function k(t, ...e) {
  if (D.logLevel <= LogLevel.ERROR) {
    const n = e.map($);
    D.error(`Firestore (${S}): ${t}`, ...n);
  }
}
function M(t, ...e) {
  if (D.logLevel <= LogLevel.WARN) {
    const n = e.map($);
    D.warn(`Firestore (${S}): ${t}`, ...n);
  }
}
function $(t) {
  if ("string" == typeof t)
    return t;
  try {
    return e = t, JSON.stringify(e);
  } catch (e2) {
    return t;
  }
  /**
  * @license
  * Copyright 2020 Google LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
  var e;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function O(t = "Unexpected state") {
  const e = `FIRESTORE (${S}) INTERNAL ASSERTION FAILED: ` + t;
  throw k(e), new Error(e);
}
function F(t, e) {
  t || O();
}
function L(t, e) {
  return t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const q = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller can not be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
class U extends FirebaseError {
  /** @hideconstructor */
  constructor(t, e) {
    super(t, e), this.code = t, this.message = e, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class K {
  constructor() {
    this.promise = new Promise((t, e) => {
      this.resolve = t, this.reject = e;
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class G {
  constructor(t, e) {
    this.user = e, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${t}`);
  }
}
class Q {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(t, e) {
    t.enqueueRetryable(() => e(V.UNAUTHENTICATED));
  }
  shutdown() {
  }
}
class j {
  constructor(t) {
    this.token = t, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(t, e) {
    this.changeListener = e, // Fire with initial user.
    t.enqueueRetryable(() => e(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class z {
  constructor(t) {
    this.t = t, /** Tracks the current User. */
    this.currentUser = V.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.i = 0, this.forceRefresh = false, this.auth = null;
  }
  start(t, e) {
    let n = this.i;
    const s = (t2) => this.i !== n ? (n = this.i, e(t2)) : Promise.resolve();
    let i = new K();
    this.o = () => {
      this.i++, this.currentUser = this.u(), i.resolve(), i = new K(), t.enqueueRetryable(() => s(this.currentUser));
    };
    const r2 = () => {
      const e2 = i;
      t.enqueueRetryable(async () => {
        await e2.promise, await s(this.currentUser);
      });
    }, o = (t2) => {
      N("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = t2, this.auth.addAuthTokenListener(this.o), r2();
    };
    this.t.onInit((t2) => o(t2)), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout(() => {
      if (!this.auth) {
        const t2 = this.t.getImmediate({
          optional: true
        });
        t2 ? o(t2) : (
          // If auth is still not available, proceed with `null` user
          (N("FirebaseAuthCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new K())
        );
      }
    }, 0), r2();
  }
  getToken() {
    const t = this.i, e = this.forceRefresh;
    return this.forceRefresh = false, this.auth ? this.auth.getToken(e).then((e2) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.i !== t ? (N("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : e2 ? (F("string" == typeof e2.accessToken), new G(e2.accessToken, this.currentUser)) : null
    )) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = true;
  }
  shutdown() {
    this.auth && this.auth.removeAuthTokenListener(this.o);
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  u() {
    const t = this.auth && this.auth.getUid();
    return F(null === t || "string" == typeof t), new V(t);
  }
}
class W {
  constructor(t, e, n) {
    this.h = t, this.l = e, this.m = n, this.type = "FirstParty", this.user = V.FIRST_PARTY, this.g = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  p() {
    return this.m ? this.m() : null;
  }
  get headers() {
    this.g.set("X-Goog-AuthUser", this.h);
    const t = this.p();
    return t && this.g.set("Authorization", t), this.l && this.g.set("X-Goog-Iam-Authorization-Token", this.l), this.g;
  }
}
class H {
  constructor(t, e, n) {
    this.h = t, this.l = e, this.m = n;
  }
  getToken() {
    return Promise.resolve(new W(this.h, this.l, this.m));
  }
  start(t, e) {
    t.enqueueRetryable(() => e(V.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
}
class J {
  constructor(t) {
    this.value = t, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), t && t.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
}
class Y {
  constructor(t) {
    this.I = t, this.forceRefresh = false, this.appCheck = null, this.T = null;
  }
  start(t, e) {
    const n = (t2) => {
      null != t2.error && N("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${t2.error.message}`);
      const n2 = t2.token !== this.T;
      return this.T = t2.token, N("FirebaseAppCheckTokenProvider", `Received ${n2 ? "new" : "existing"} token.`), n2 ? e(t2.token) : Promise.resolve();
    };
    this.o = (e2) => {
      t.enqueueRetryable(() => n(e2));
    };
    const s = (t2) => {
      N("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = t2, this.appCheck.addTokenListener(this.o);
    };
    this.I.onInit((t2) => s(t2)), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout(() => {
      if (!this.appCheck) {
        const t2 = this.I.getImmediate({
          optional: true
        });
        t2 ? s(t2) : (
          // If AppCheck is still not available, proceed without it.
          N("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }, 0);
  }
  getToken() {
    const t = this.forceRefresh;
    return this.forceRefresh = false, this.appCheck ? this.appCheck.getToken(t).then((t2) => t2 ? (F("string" == typeof t2.token), this.T = t2.token, new J(t2.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = true;
  }
  shutdown() {
    this.appCheck && this.appCheck.removeTokenListener(this.o);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Z(t) {
  const e = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto)
  ), n = new Uint8Array(t);
  if (e && "function" == typeof e.getRandomValues)
    e.getRandomValues(n);
  else
    for (let e2 = 0; e2 < t; e2++)
      n[e2] = Math.floor(256 * Math.random());
  return n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tt {
  static A() {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t.length) * t.length;
    let n = "";
    for (; n.length < 20; ) {
      const s = Z(40);
      for (let i = 0; i < s.length; ++i)
        n.length < 20 && s[i] < e && (n += t.charAt(s[i] % t.length));
    }
    return n;
  }
}
function et(t, e) {
  return t < e ? -1 : t > e ? 1 : 0;
}
function nt(t, e, n) {
  return t.length === e.length && t.every((t2, s) => n(t2, e[s]));
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class it {
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(t, e) {
    if (this.seconds = t, this.nanoseconds = e, e < 0)
      throw new U(q.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
    if (e >= 1e9)
      throw new U(q.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
    if (t < -62135596800)
      throw new U(q.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
    if (t >= 253402300800)
      throw new U(q.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t);
  }
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return it.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(t) {
    return it.fromMillis(t.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(t) {
    const e = Math.floor(t / 1e3), n = Math.floor(1e6 * (t - 1e3 * e));
    return new it(e, n);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / 1e6;
  }
  _compareTo(t) {
    return this.seconds === t.seconds ? et(this.nanoseconds, t.nanoseconds) : et(this.seconds, t.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(t) {
    return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /** Returns a JSON-serializable representation of this `Timestamp`. */
  toJSON() {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const t = this.seconds - -62135596800;
    return String(t).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class rt {
  constructor(t) {
    this.timestamp = t;
  }
  static fromTimestamp(t) {
    return new rt(t);
  }
  static min() {
    return new rt(new it(0, 0));
  }
  static max() {
    return new rt(new it(253402300799, 999999999));
  }
  compareTo(t) {
    return this.timestamp._compareTo(t.timestamp);
  }
  isEqual(t) {
    return this.timestamp.isEqual(t.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ot {
  constructor(t, e, n) {
    void 0 === e ? e = 0 : e > t.length && O(), void 0 === n ? n = t.length - e : n > t.length - e && O(), this.segments = t, this.offset = e, this.len = n;
  }
  get length() {
    return this.len;
  }
  isEqual(t) {
    return 0 === ot.comparator(this, t);
  }
  child(t) {
    const e = this.segments.slice(this.offset, this.limit());
    return t instanceof ot ? t.forEach((t2) => {
      e.push(t2);
    }) : e.push(t), this.construct(e);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(t) {
    return t = void 0 === t ? 1 : t, this.construct(this.segments, this.offset + t, this.length - t);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(t) {
    return this.segments[this.offset + t];
  }
  isEmpty() {
    return 0 === this.length;
  }
  isPrefixOf(t) {
    if (t.length < this.length)
      return false;
    for (let e = 0; e < this.length; e++)
      if (this.get(e) !== t.get(e))
        return false;
    return true;
  }
  isImmediateParentOf(t) {
    if (this.length + 1 !== t.length)
      return false;
    for (let e = 0; e < this.length; e++)
      if (this.get(e) !== t.get(e))
        return false;
    return true;
  }
  forEach(t) {
    for (let e = this.offset, n = this.limit(); e < n; e++)
      t(this.segments[e]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(t, e) {
    const n = Math.min(t.length, e.length);
    for (let s = 0; s < n; s++) {
      const n2 = t.get(s), i = e.get(s);
      if (n2 < i)
        return -1;
      if (n2 > i)
        return 1;
    }
    return t.length < e.length ? -1 : t.length > e.length ? 1 : 0;
  }
}
class ut extends ot {
  construct(t, e, n) {
    return new ut(t, e, n);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...t) {
    const e = [];
    for (const n of t) {
      if (n.indexOf("//") >= 0)
        throw new U(q.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
      e.push(...n.split("/").filter((t2) => t2.length > 0));
    }
    return new ut(e);
  }
  static emptyPath() {
    return new ut([]);
  }
}
const ct = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class at extends ot {
  construct(t, e, n) {
    return new at(t, e, n);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(t) {
    return ct.test(t);
  }
  canonicalString() {
    return this.toArray().map((t) => (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), at.isValidIdentifier(t) || (t = "`" + t + "`"), t)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return 1 === this.length && "__name__" === this.get(0);
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new at(["__name__"]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(t) {
    const e = [];
    let n = "", s = 0;
    const i = () => {
      if (0 === n.length)
        throw new U(q.INVALID_ARGUMENT, `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      e.push(n), n = "";
    };
    let r2 = false;
    for (; s < t.length; ) {
      const e2 = t[s];
      if ("\\" === e2) {
        if (s + 1 === t.length)
          throw new U(q.INVALID_ARGUMENT, "Path has trailing escape character: " + t);
        const e3 = t[s + 1];
        if ("\\" !== e3 && "." !== e3 && "`" !== e3)
          throw new U(q.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t);
        n += e3, s += 2;
      } else
        "`" === e2 ? (r2 = !r2, s++) : "." !== e2 || r2 ? (n += e2, s++) : (i(), s++);
    }
    if (i(), r2)
      throw new U(q.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
    return new at(e);
  }
  static emptyPath() {
    return new at([]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ht {
  constructor(t) {
    this.path = t;
  }
  static fromPath(t) {
    return new ht(ut.fromString(t));
  }
  static fromName(t) {
    return new ht(ut.fromString(t).popFirst(5));
  }
  static empty() {
    return new ht(ut.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(t) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === t;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(t) {
    return null !== t && 0 === ut.comparator(this.path, t.path);
  }
  toString() {
    return this.path.toString();
  }
  static comparator(t, e) {
    return ut.comparator(t.path, e.path);
  }
  static isDocumentKey(t) {
    return t.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(t) {
    return new ht(new ut(t.slice()));
  }
}
function yt(t, e) {
  const n = t.toTimestamp().seconds, s = t.toTimestamp().nanoseconds + 1, i = rt.fromTimestamp(1e9 === s ? new it(n + 1, 0) : new it(n, s));
  return new It(i, ht.empty(), e);
}
function pt(t) {
  return new It(t.readTime, t.key, -1);
}
class It {
  constructor(t, e, n) {
    this.readTime = t, this.documentKey = e, this.largestBatchId = n;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new It(rt.min(), ht.empty(), -1);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new It(rt.max(), ht.empty(), -1);
  }
}
function Tt(t, e) {
  let n = t.readTime.compareTo(e.readTime);
  return 0 !== n ? n : (n = ht.comparator(t.documentKey, e.documentKey), 0 !== n ? n : et(t.largestBatchId, e.largestBatchId));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Et = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class At {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(t) {
    this.onCommittedListeners.push(t);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((t) => t());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function vt(t) {
  if (t.code !== q.FAILED_PRECONDITION || t.message !== Et)
    throw t;
  N("LocalStore", "Unexpectedly lost primary lease");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Rt {
  constructor(t) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = false, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = false, t((t2) => {
      this.isDone = true, this.result = t2, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(t2);
    }, (t2) => {
      this.isDone = true, this.error = t2, this.catchCallback && this.catchCallback(t2);
    });
  }
  catch(t) {
    return this.next(void 0, t);
  }
  next(t, e) {
    return this.callbackAttached && O(), this.callbackAttached = true, this.isDone ? this.error ? this.wrapFailure(e, this.error) : this.wrapSuccess(t, this.result) : new Rt((n, s) => {
      this.nextCallback = (e2) => {
        this.wrapSuccess(t, e2).next(n, s);
      }, this.catchCallback = (t2) => {
        this.wrapFailure(e, t2).next(n, s);
      };
    });
  }
  toPromise() {
    return new Promise((t, e) => {
      this.next(t, e);
    });
  }
  wrapUserFunction(t) {
    try {
      const e = t();
      return e instanceof Rt ? e : Rt.resolve(e);
    } catch (t2) {
      return Rt.reject(t2);
    }
  }
  wrapSuccess(t, e) {
    return t ? this.wrapUserFunction(() => t(e)) : Rt.resolve(e);
  }
  wrapFailure(t, e) {
    return t ? this.wrapUserFunction(() => t(e)) : Rt.reject(e);
  }
  static resolve(t) {
    return new Rt((e, n) => {
      e(t);
    });
  }
  static reject(t) {
    return new Rt((e, n) => {
      n(t);
    });
  }
  static waitFor(t) {
    return new Rt((e, n) => {
      let s = 0, i = 0, r2 = false;
      t.forEach((t2) => {
        ++s, t2.next(() => {
          ++i, r2 && i === s && e();
        }, (t3) => n(t3));
      }), r2 = true, i === s && e();
    });
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(t) {
    let e = Rt.resolve(false);
    for (const n of t)
      e = e.next((t2) => t2 ? Rt.resolve(t2) : n());
    return e;
  }
  static forEach(t, e) {
    const n = [];
    return t.forEach((t2, s) => {
      n.push(e.call(this, t2, s));
    }), this.waitFor(n);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(t, e) {
    return new Rt((n, s) => {
      const i = t.length, r2 = new Array(i);
      let o = 0;
      for (let u = 0; u < i; u++) {
        const c = u;
        e(t[c]).next((t2) => {
          r2[c] = t2, ++o, o === i && n(r2);
        }, (t2) => s(t2));
      }
    });
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(t, e) {
    return new Rt((n, s) => {
      const i = () => {
        true === t() ? e().next(() => {
          i();
        }, s) : n();
      };
      i();
    });
  }
}
function Dt(t) {
  return "IndexedDbTransactionError" === t.name;
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ot {
  constructor(t, e) {
    this.previousValue = t, e && (e.sequenceNumberHandler = (t2) => this.ot(t2), this.ut = (t2) => e.writeSequenceNumber(t2));
  }
  ot(t) {
    return this.previousValue = Math.max(t, this.previousValue), this.previousValue;
  }
  next() {
    const t = ++this.previousValue;
    return this.ut && this.ut(t), t;
  }
}
Ot.ct = -1;
function Ft(t) {
  return null == t;
}
function Bt(t) {
  return 0 === t && 1 / t == -1 / 0;
}
function Lt(t) {
  return "number" == typeof t && Number.isInteger(t) && !Bt(t) && t <= Number.MAX_SAFE_INTEGER && t >= Number.MIN_SAFE_INTEGER;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function me(t) {
  let e = 0;
  for (const n in t)
    Object.prototype.hasOwnProperty.call(t, n) && e++;
  return e;
}
function ge(t, e) {
  for (const n in t)
    Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
}
function ye(t) {
  for (const e in t)
    if (Object.prototype.hasOwnProperty.call(t, e))
      return false;
  return true;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class pe {
  constructor(t, e) {
    this.comparator = t, this.root = e || Te.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(t, e) {
    return new pe(this.comparator, this.root.insert(t, e, this.comparator).copy(null, null, Te.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(t) {
    return new pe(this.comparator, this.root.remove(t, this.comparator).copy(null, null, Te.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(t) {
    let e = this.root;
    for (; !e.isEmpty(); ) {
      const n = this.comparator(t, e.key);
      if (0 === n)
        return e.value;
      n < 0 ? e = e.left : n > 0 && (e = e.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(t) {
    let e = 0, n = this.root;
    for (; !n.isEmpty(); ) {
      const s = this.comparator(t, n.key);
      if (0 === s)
        return e + n.left.size;
      s < 0 ? n = n.left : (
        // Count all nodes left of the node plus the node itself
        (e += n.left.size + 1, n = n.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(t) {
    return this.root.inorderTraversal(t);
  }
  forEach(t) {
    this.inorderTraversal((e, n) => (t(e, n), false));
  }
  toString() {
    const t = [];
    return this.inorderTraversal((e, n) => (t.push(`${e}:${n}`), false)), `{${t.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(t) {
    return this.root.reverseTraversal(t);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new Ie(this.root, null, this.comparator, false);
  }
  getIteratorFrom(t) {
    return new Ie(this.root, t, this.comparator, false);
  }
  getReverseIterator() {
    return new Ie(this.root, null, this.comparator, true);
  }
  getReverseIteratorFrom(t) {
    return new Ie(this.root, t, this.comparator, true);
  }
}
class Ie {
  constructor(t, e, n, s) {
    this.isReverse = s, this.nodeStack = [];
    let i = 1;
    for (; !t.isEmpty(); )
      if (i = e ? n(t.key, e) : 1, // flip the comparison if we're going in reverse
      e && s && (i *= -1), i < 0)
        t = this.isReverse ? t.left : t.right;
      else {
        if (0 === i) {
          this.nodeStack.push(t);
          break;
        }
        this.nodeStack.push(t), t = this.isReverse ? t.right : t.left;
      }
  }
  getNext() {
    let t = this.nodeStack.pop();
    const e = {
      key: t.key,
      value: t.value
    };
    if (this.isReverse)
      for (t = t.left; !t.isEmpty(); )
        this.nodeStack.push(t), t = t.right;
    else
      for (t = t.right; !t.isEmpty(); )
        this.nodeStack.push(t), t = t.left;
    return e;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (0 === this.nodeStack.length)
      return null;
    const t = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: t.key,
      value: t.value
    };
  }
}
class Te {
  constructor(t, e, n, s, i) {
    this.key = t, this.value = e, this.color = null != n ? n : Te.RED, this.left = null != s ? s : Te.EMPTY, this.right = null != i ? i : Te.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(t, e, n, s, i) {
    return new Te(null != t ? t : this.key, null != e ? e : this.value, null != n ? n : this.color, null != s ? s : this.left, null != i ? i : this.right);
  }
  isEmpty() {
    return false;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(t) {
    return this.left.inorderTraversal(t) || t(this.key, this.value) || this.right.inorderTraversal(t);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(t) {
    return this.right.reverseTraversal(t) || t(this.key, this.value) || this.left.reverseTraversal(t);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(t, e, n) {
    let s = this;
    const i = n(t, s.key);
    return s = i < 0 ? s.copy(null, null, null, s.left.insert(t, e, n), null) : 0 === i ? s.copy(null, e, null, null, null) : s.copy(null, null, null, null, s.right.insert(t, e, n)), s.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty())
      return Te.EMPTY;
    let t = this;
    return t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()), t = t.copy(null, null, null, t.left.removeMin(), null), t.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(t, e) {
    let n, s = this;
    if (e(t, s.key) < 0)
      s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()), s = s.copy(null, null, null, s.left.remove(t, e), null);
    else {
      if (s.left.isRed() && (s = s.rotateRight()), s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()), 0 === e(t, s.key)) {
        if (s.right.isEmpty())
          return Te.EMPTY;
        n = s.right.min(), s = s.copy(n.key, n.value, null, null, s.right.removeMin());
      }
      s = s.copy(null, null, null, null, s.right.remove(t, e));
    }
    return s.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let t = this;
    return t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()), t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()), t.left.isRed() && t.right.isRed() && (t = t.colorFlip()), t;
  }
  moveRedLeft() {
    let t = this.colorFlip();
    return t.right.left.isRed() && (t = t.copy(null, null, null, null, t.right.rotateRight()), t = t.rotateLeft(), t = t.colorFlip()), t;
  }
  moveRedRight() {
    let t = this.colorFlip();
    return t.left.left.isRed() && (t = t.rotateRight(), t = t.colorFlip()), t;
  }
  rotateLeft() {
    const t = this.copy(null, null, Te.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, t, null);
  }
  rotateRight() {
    const t = this.copy(null, null, Te.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, t);
  }
  colorFlip() {
    const t = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, t, e);
  }
  // For testing.
  checkMaxDepth() {
    const t = this.check();
    return Math.pow(2, t) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed())
      throw O();
    if (this.right.isRed())
      throw O();
    const t = this.left.check();
    if (t !== this.right.check())
      throw O();
    return t + (this.isRed() ? 0 : 1);
  }
}
Te.EMPTY = null, Te.RED = true, Te.BLACK = false;
Te.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw O();
  }
  get value() {
    throw O();
  }
  get color() {
    throw O();
  }
  get left() {
    throw O();
  }
  get right() {
    throw O();
  }
  // Returns a copy of the current node.
  copy(t, e, n, s, i) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(t, e, n) {
    return new Te(t, e);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(t, e) {
    return this;
  }
  isEmpty() {
    return true;
  }
  inorderTraversal(t) {
    return false;
  }
  reverseTraversal(t) {
    return false;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return false;
  }
  // For testing.
  checkMaxDepth() {
    return true;
  }
  check() {
    return 0;
  }
}();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ee {
  constructor(t) {
    this.comparator = t, this.data = new pe(this.comparator);
  }
  has(t) {
    return null !== this.data.get(t);
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(t) {
    return this.data.indexOf(t);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(t) {
    this.data.inorderTraversal((e, n) => (t(e), false));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(t, e) {
    const n = this.data.getIteratorFrom(t[0]);
    for (; n.hasNext(); ) {
      const s = n.getNext();
      if (this.comparator(s.key, t[1]) >= 0)
        return;
      e(s.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(t, e) {
    let n;
    for (n = void 0 !== e ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) {
      if (!t(n.getNext().key))
        return;
    }
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(t) {
    const e = this.data.getIteratorFrom(t);
    return e.hasNext() ? e.getNext().key : null;
  }
  getIterator() {
    return new Ae(this.data.getIterator());
  }
  getIteratorFrom(t) {
    return new Ae(this.data.getIteratorFrom(t));
  }
  /** Inserts or updates an element */
  add(t) {
    return this.copy(this.data.remove(t).insert(t, true));
  }
  /** Deletes an element */
  delete(t) {
    return this.has(t) ? this.copy(this.data.remove(t)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(t) {
    let e = this;
    return e.size < t.size && (e = t, t = this), t.forEach((t2) => {
      e = e.add(t2);
    }), e;
  }
  isEqual(t) {
    if (!(t instanceof Ee))
      return false;
    if (this.size !== t.size)
      return false;
    const e = this.data.getIterator(), n = t.data.getIterator();
    for (; e.hasNext(); ) {
      const t2 = e.getNext().key, s = n.getNext().key;
      if (0 !== this.comparator(t2, s))
        return false;
    }
    return true;
  }
  toArray() {
    const t = [];
    return this.forEach((e) => {
      t.push(e);
    }), t;
  }
  toString() {
    const t = [];
    return this.forEach((e) => t.push(e)), "SortedSet(" + t.toString() + ")";
  }
  copy(t) {
    const e = new Ee(this.comparator);
    return e.data = t, e;
  }
}
class Ae {
  constructor(t) {
    this.iter = t;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Re {
  constructor(t) {
    this.fields = t, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    t.sort(at.comparator);
  }
  static empty() {
    return new Re([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(t) {
    let e = new Ee(at.comparator);
    for (const t2 of this.fields)
      e = e.add(t2);
    for (const n of t)
      e = e.add(n);
    return new Re(e.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(t) {
    for (const e of this.fields)
      if (e.isPrefixOf(t))
        return true;
    return false;
  }
  isEqual(t) {
    return nt(this.fields, t.fields, (t2, e) => t2.isEqual(e));
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pe extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ve {
  constructor(t) {
    this.binaryString = t;
  }
  static fromBase64String(t) {
    const e = function(t2) {
      try {
        return atob(t2);
      } catch (t3) {
        throw "undefined" != typeof DOMException && t3 instanceof DOMException ? new Pe("Invalid base64 string: " + t3) : t3;
      }
    }(t);
    return new Ve(e);
  }
  static fromUint8Array(t) {
    const e = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function(t2) {
        let e2 = "";
        for (let n = 0; n < t2.length; ++n)
          e2 += String.fromCharCode(t2[n]);
        return e2;
      }(t)
    );
    return new Ve(e);
  }
  [Symbol.iterator]() {
    let t = 0;
    return {
      next: () => t < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(t++),
        done: false
      } : {
        value: void 0,
        done: true
      }
    };
  }
  toBase64() {
    return t = this.binaryString, btoa(t);
    var t;
  }
  toUint8Array() {
    return function(t) {
      const e = new Uint8Array(t.length);
      for (let n = 0; n < t.length; n++)
        e[n] = t.charCodeAt(n);
      return e;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(t) {
    return et(this.binaryString, t.binaryString);
  }
  isEqual(t) {
    return this.binaryString === t.binaryString;
  }
}
Ve.EMPTY_BYTE_STRING = new Ve("");
const Se = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function De(t) {
  if (F(!!t), "string" == typeof t) {
    let e = 0;
    const n = Se.exec(t);
    if (F(!!n), n[1]) {
      let t2 = n[1];
      t2 = (t2 + "000000000").substr(0, 9), e = Number(t2);
    }
    const s = new Date(t);
    return {
      seconds: Math.floor(s.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: Ce(t.seconds),
    nanos: Ce(t.nanos)
  };
}
function Ce(t) {
  return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
}
function xe(t) {
  return "string" == typeof t ? Ve.fromBase64String(t) : Ve.fromUint8Array(t);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ne(t) {
  var e, n;
  return "server_timestamp" === (null === (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e ? void 0 : e.fields) || {}).__type__) || void 0 === n ? void 0 : n.stringValue);
}
function ke(t) {
  const e = t.mapValue.fields.__previous_value__;
  return Ne(e) ? ke(e) : e;
}
function Me(t) {
  const e = De(t.mapValue.fields.__local_write_time__.timestampValue);
  return new it(e.seconds, e.nanos);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $e {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions Options that configure long-polling.
   * @param useFetchStreams Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(t, e, n, s, i, r2, o, u, c) {
    this.databaseId = t, this.appId = e, this.persistenceKey = n, this.host = s, this.ssl = i, this.forceLongPolling = r2, this.autoDetectLongPolling = o, this.longPollingOptions = u, this.useFetchStreams = c;
  }
}
class Oe {
  constructor(t, e) {
    this.projectId = t, this.database = e || "(default)";
  }
  static empty() {
    return new Oe("", "");
  }
  get isDefaultDatabase() {
    return "(default)" === this.database;
  }
  isEqual(t) {
    return t instanceof Oe && t.projectId === this.projectId && t.database === this.database;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Fe = {
  mapValue: {
    fields: {
      __type__: {
        stringValue: "__max__"
      }
    }
  }
};
function Le(t) {
  return "nullValue" in t ? 0 : "booleanValue" in t ? 1 : "integerValue" in t || "doubleValue" in t ? 2 : "timestampValue" in t ? 3 : "stringValue" in t ? 5 : "bytesValue" in t ? 6 : "referenceValue" in t ? 7 : "geoPointValue" in t ? 8 : "arrayValue" in t ? 9 : "mapValue" in t ? Ne(t) ? 4 : en(t) ? 9007199254740991 : 10 : O();
}
function qe(t, e) {
  if (t === e)
    return true;
  const n = Le(t);
  if (n !== Le(e))
    return false;
  switch (n) {
    case 0:
    case 9007199254740991:
      return true;
    case 1:
      return t.booleanValue === e.booleanValue;
    case 4:
      return Me(t).isEqual(Me(e));
    case 3:
      return function(t2, e2) {
        if ("string" == typeof t2.timestampValue && "string" == typeof e2.timestampValue && t2.timestampValue.length === e2.timestampValue.length)
          return t2.timestampValue === e2.timestampValue;
        const n2 = De(t2.timestampValue), s = De(e2.timestampValue);
        return n2.seconds === s.seconds && n2.nanos === s.nanos;
      }(t, e);
    case 5:
      return t.stringValue === e.stringValue;
    case 6:
      return function(t2, e2) {
        return xe(t2.bytesValue).isEqual(xe(e2.bytesValue));
      }(t, e);
    case 7:
      return t.referenceValue === e.referenceValue;
    case 8:
      return function(t2, e2) {
        return Ce(t2.geoPointValue.latitude) === Ce(e2.geoPointValue.latitude) && Ce(t2.geoPointValue.longitude) === Ce(e2.geoPointValue.longitude);
      }(t, e);
    case 2:
      return function(t2, e2) {
        if ("integerValue" in t2 && "integerValue" in e2)
          return Ce(t2.integerValue) === Ce(e2.integerValue);
        if ("doubleValue" in t2 && "doubleValue" in e2) {
          const n2 = Ce(t2.doubleValue), s = Ce(e2.doubleValue);
          return n2 === s ? Bt(n2) === Bt(s) : isNaN(n2) && isNaN(s);
        }
        return false;
      }(t, e);
    case 9:
      return nt(t.arrayValue.values || [], e.arrayValue.values || [], qe);
    case 10:
      return function(t2, e2) {
        const n2 = t2.mapValue.fields || {}, s = e2.mapValue.fields || {};
        if (me(n2) !== me(s))
          return false;
        for (const t3 in n2)
          if (n2.hasOwnProperty(t3) && (void 0 === s[t3] || !qe(n2[t3], s[t3])))
            return false;
        return true;
      }(t, e);
    default:
      return O();
  }
}
function Ue(t, e) {
  return void 0 !== (t.values || []).find((t2) => qe(t2, e));
}
function Ke(t, e) {
  if (t === e)
    return 0;
  const n = Le(t), s = Le(e);
  if (n !== s)
    return et(n, s);
  switch (n) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return et(t.booleanValue, e.booleanValue);
    case 2:
      return function(t2, e2) {
        const n2 = Ce(t2.integerValue || t2.doubleValue), s2 = Ce(e2.integerValue || e2.doubleValue);
        return n2 < s2 ? -1 : n2 > s2 ? 1 : n2 === s2 ? 0 : (
          // one or both are NaN.
          isNaN(n2) ? isNaN(s2) ? 0 : -1 : 1
        );
      }(t, e);
    case 3:
      return Ge(t.timestampValue, e.timestampValue);
    case 4:
      return Ge(Me(t), Me(e));
    case 5:
      return et(t.stringValue, e.stringValue);
    case 6:
      return function(t2, e2) {
        const n2 = xe(t2), s2 = xe(e2);
        return n2.compareTo(s2);
      }(t.bytesValue, e.bytesValue);
    case 7:
      return function(t2, e2) {
        const n2 = t2.split("/"), s2 = e2.split("/");
        for (let t3 = 0; t3 < n2.length && t3 < s2.length; t3++) {
          const e3 = et(n2[t3], s2[t3]);
          if (0 !== e3)
            return e3;
        }
        return et(n2.length, s2.length);
      }(t.referenceValue, e.referenceValue);
    case 8:
      return function(t2, e2) {
        const n2 = et(Ce(t2.latitude), Ce(e2.latitude));
        if (0 !== n2)
          return n2;
        return et(Ce(t2.longitude), Ce(e2.longitude));
      }(t.geoPointValue, e.geoPointValue);
    case 9:
      return function(t2, e2) {
        const n2 = t2.values || [], s2 = e2.values || [];
        for (let t3 = 0; t3 < n2.length && t3 < s2.length; ++t3) {
          const e3 = Ke(n2[t3], s2[t3]);
          if (e3)
            return e3;
        }
        return et(n2.length, s2.length);
      }(t.arrayValue, e.arrayValue);
    case 10:
      return function(t2, e2) {
        if (t2 === Fe.mapValue && e2 === Fe.mapValue)
          return 0;
        if (t2 === Fe.mapValue)
          return 1;
        if (e2 === Fe.mapValue)
          return -1;
        const n2 = t2.fields || {}, s2 = Object.keys(n2), i = e2.fields || {}, r2 = Object.keys(i);
        s2.sort(), r2.sort();
        for (let t3 = 0; t3 < s2.length && t3 < r2.length; ++t3) {
          const e3 = et(s2[t3], r2[t3]);
          if (0 !== e3)
            return e3;
          const o = Ke(n2[s2[t3]], i[r2[t3]]);
          if (0 !== o)
            return o;
        }
        return et(s2.length, r2.length);
      }(t.mapValue, e.mapValue);
    default:
      throw O();
  }
}
function Ge(t, e) {
  if ("string" == typeof t && "string" == typeof e && t.length === e.length)
    return et(t, e);
  const n = De(t), s = De(e), i = et(n.seconds, s.seconds);
  return 0 !== i ? i : et(n.nanos, s.nanos);
}
function Qe(t) {
  return je(t);
}
function je(t) {
  return "nullValue" in t ? "null" : "booleanValue" in t ? "" + t.booleanValue : "integerValue" in t ? "" + t.integerValue : "doubleValue" in t ? "" + t.doubleValue : "timestampValue" in t ? function(t2) {
    const e2 = De(t2);
    return `time(${e2.seconds},${e2.nanos})`;
  }(t.timestampValue) : "stringValue" in t ? t.stringValue : "bytesValue" in t ? xe(t.bytesValue).toBase64() : "referenceValue" in t ? (n = t.referenceValue, ht.fromName(n).toString()) : "geoPointValue" in t ? `geo(${(e = t.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t ? function(t2) {
    let e2 = "[", n2 = true;
    for (const s of t2.values || [])
      n2 ? n2 = false : e2 += ",", e2 += je(s);
    return e2 + "]";
  }(t.arrayValue) : "mapValue" in t ? function(t2) {
    const e2 = Object.keys(t2.fields || {}).sort();
    let n2 = "{", s = true;
    for (const i of e2)
      s ? s = false : n2 += ",", n2 += `${i}:${je(t2.fields[i])}`;
    return n2 + "}";
  }(t.mapValue) : O();
  var e, n;
}
function He(t) {
  return !!t && "integerValue" in t;
}
function Je(t) {
  return !!t && "arrayValue" in t;
}
function Ye(t) {
  return !!t && "nullValue" in t;
}
function Xe(t) {
  return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
}
function Ze(t) {
  return !!t && "mapValue" in t;
}
function tn(t) {
  if (t.geoPointValue)
    return {
      geoPointValue: Object.assign({}, t.geoPointValue)
    };
  if (t.timestampValue && "object" == typeof t.timestampValue)
    return {
      timestampValue: Object.assign({}, t.timestampValue)
    };
  if (t.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return ge(t.mapValue.fields, (t2, n) => e.mapValue.fields[t2] = tn(n)), e;
  }
  if (t.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let n = 0; n < (t.arrayValue.values || []).length; ++n)
      e.arrayValue.values[n] = tn(t.arrayValue.values[n]);
    return e;
  }
  return Object.assign({}, t);
}
function en(t) {
  return "__max__" === (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class un {
  constructor(t) {
    this.value = t;
  }
  static empty() {
    return new un({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(t) {
    if (t.isEmpty())
      return this.value;
    {
      let e = this.value;
      for (let n = 0; n < t.length - 1; ++n)
        if (e = (e.mapValue.fields || {})[t.get(n)], !Ze(e))
          return null;
      return e = (e.mapValue.fields || {})[t.lastSegment()], e || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(t, e) {
    this.getFieldsMap(t.popLast())[t.lastSegment()] = tn(e);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(t) {
    let e = at.emptyPath(), n = {}, s = [];
    t.forEach((t2, i2) => {
      if (!e.isImmediateParentOf(i2)) {
        const t3 = this.getFieldsMap(e);
        this.applyChanges(t3, n, s), n = {}, s = [], e = i2.popLast();
      }
      t2 ? n[i2.lastSegment()] = tn(t2) : s.push(i2.lastSegment());
    });
    const i = this.getFieldsMap(e);
    this.applyChanges(i, n, s);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(t) {
    const e = this.field(t.popLast());
    Ze(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
  }
  isEqual(t) {
    return qe(this.value, t.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(t) {
    let e = this.value;
    e.mapValue.fields || (e.mapValue = {
      fields: {}
    });
    for (let n = 0; n < t.length; ++n) {
      let s = e.mapValue.fields[t.get(n)];
      Ze(s) && s.mapValue.fields || (s = {
        mapValue: {
          fields: {}
        }
      }, e.mapValue.fields[t.get(n)] = s), e = s;
    }
    return e.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(t, e, n) {
    ge(e, (e2, n2) => t[e2] = n2);
    for (const e2 of n)
      delete t[e2];
  }
  clone() {
    return new un(tn(this.value));
  }
}
function cn(t) {
  const e = [];
  return ge(t.fields, (t2, n) => {
    const s = new at([t2]);
    if (Ze(n)) {
      const t3 = cn(n.mapValue).fields;
      if (0 === t3.length)
        e.push(s);
      else
        for (const n2 of t3)
          e.push(s.child(n2));
    } else
      e.push(s);
  }), new Re(e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class an {
  constructor(t, e, n, s, i, r2, o) {
    this.key = t, this.documentType = e, this.version = n, this.readTime = s, this.createTime = i, this.data = r2, this.documentState = o;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(t) {
    return new an(
      t,
      0,
      /* version */
      rt.min(),
      /* readTime */
      rt.min(),
      /* createTime */
      rt.min(),
      un.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(t, e, n, s) {
    return new an(
      t,
      1,
      /* version */
      e,
      /* readTime */
      rt.min(),
      /* createTime */
      n,
      s,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(t, e) {
    return new an(
      t,
      2,
      /* version */
      e,
      /* readTime */
      rt.min(),
      /* createTime */
      rt.min(),
      un.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(t, e) {
    return new an(
      t,
      3,
      /* version */
      e,
      /* readTime */
      rt.min(),
      /* createTime */
      rt.min(),
      un.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(t, e) {
    return !this.createTime.isEqual(rt.min()) || 2 !== this.documentType && 0 !== this.documentType || (this.createTime = t), this.version = t, this.documentType = 1, this.data = e, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(t) {
    return this.version = t, this.documentType = 2, this.data = un.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(t) {
    return this.version = t, this.documentType = 3, this.data = un.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = rt.min(), this;
  }
  setReadTime(t) {
    return this.readTime = t, this;
  }
  get hasLocalMutations() {
    return 1 === this.documentState;
  }
  get hasCommittedMutations() {
    return 2 === this.documentState;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return 0 !== this.documentType;
  }
  isFoundDocument() {
    return 1 === this.documentType;
  }
  isNoDocument() {
    return 2 === this.documentType;
  }
  isUnknownDocument() {
    return 3 === this.documentType;
  }
  isEqual(t) {
    return t instanceof an && this.key.isEqual(t.key) && this.version.isEqual(t.version) && this.documentType === t.documentType && this.documentState === t.documentState && this.data.isEqual(t.data);
  }
  mutableCopy() {
    return new an(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class hn {
  constructor(t, e) {
    this.position = t, this.inclusive = e;
  }
}
function ln(t, e, n) {
  let s = 0;
  for (let i = 0; i < t.position.length; i++) {
    const r2 = e[i], o = t.position[i];
    if (r2.field.isKeyField())
      s = ht.comparator(ht.fromName(o.referenceValue), n.key);
    else {
      s = Ke(o, n.data.field(r2.field));
    }
    if ("desc" === r2.dir && (s *= -1), 0 !== s)
      break;
  }
  return s;
}
function fn(t, e) {
  if (null === t)
    return null === e;
  if (null === e)
    return false;
  if (t.inclusive !== e.inclusive || t.position.length !== e.position.length)
    return false;
  for (let n = 0; n < t.position.length; n++) {
    if (!qe(t.position[n], e.position[n]))
      return false;
  }
  return true;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class dn {
  constructor(t, e = "asc") {
    this.field = t, this.dir = e;
  }
}
function wn(t, e) {
  return t.dir === e.dir && t.field.isEqual(e.field);
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _n {
}
class mn extends _n {
  constructor(t, e, n) {
    super(), this.field = t, this.op = e, this.value = n;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(t, e, n) {
    return t.isKeyField() ? "in" === e || "not-in" === e ? this.createKeyFieldInFilter(t, e, n) : new Pn(t, e, n) : "array-contains" === e ? new Dn(t, n) : "in" === e ? new Cn(t, n) : "not-in" === e ? new xn(t, n) : "array-contains-any" === e ? new Nn(t, n) : new mn(t, e, n);
  }
  static createKeyFieldInFilter(t, e, n) {
    return "in" === e ? new bn(t, n) : new Vn(t, n);
  }
  matches(t) {
    const e = t.data.field(this.field);
    return "!=" === this.op ? null !== e && this.matchesComparison(Ke(e, this.value)) : null !== e && Le(this.value) === Le(e) && this.matchesComparison(Ke(e, this.value));
  }
  matchesComparison(t) {
    switch (this.op) {
      case "<":
        return t < 0;
      case "<=":
        return t <= 0;
      case "==":
        return 0 === t;
      case "!=":
        return 0 !== t;
      case ">":
        return t > 0;
      case ">=":
        return t >= 0;
      default:
        return O();
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
  getFirstInequalityField() {
    return this.isInequality() ? this.field : null;
  }
}
class gn extends _n {
  constructor(t, e) {
    super(), this.filters = t, this.op = e, this.lt = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(t, e) {
    return new gn(t, e);
  }
  matches(t) {
    return yn(this) ? void 0 === this.filters.find((e) => !e.matches(t)) : void 0 !== this.filters.find((e) => e.matches(t));
  }
  getFlattenedFilters() {
    return null !== this.lt || (this.lt = this.filters.reduce((t, e) => t.concat(e.getFlattenedFilters()), [])), this.lt;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
  getFirstInequalityField() {
    const t = this.ft((t2) => t2.isInequality());
    return null !== t ? t.field : null;
  }
  // Performs a depth-first search to find and return the first FieldFilter in the composite filter
  // that satisfies the predicate. Returns `null` if none of the FieldFilters satisfy the
  // predicate.
  ft(t) {
    for (const e of this.getFlattenedFilters())
      if (t(e))
        return e;
    return null;
  }
}
function yn(t) {
  return "and" === t.op;
}
function In(t) {
  return Tn(t) && yn(t);
}
function Tn(t) {
  for (const e of t.filters)
    if (e instanceof gn)
      return false;
  return true;
}
function En(t) {
  if (t instanceof mn)
    return t.field.canonicalString() + t.op.toString() + Qe(t.value);
  if (In(t))
    return t.filters.map((t2) => En(t2)).join(",");
  {
    const e = t.filters.map((t2) => En(t2)).join(",");
    return `${t.op}(${e})`;
  }
}
function An(t, e) {
  return t instanceof mn ? function(t2, e2) {
    return e2 instanceof mn && t2.op === e2.op && t2.field.isEqual(e2.field) && qe(t2.value, e2.value);
  }(t, e) : t instanceof gn ? function(t2, e2) {
    if (e2 instanceof gn && t2.op === e2.op && t2.filters.length === e2.filters.length) {
      return t2.filters.reduce((t3, n, s) => t3 && An(n, e2.filters[s]), true);
    }
    return false;
  }(t, e) : void O();
}
function Rn(t) {
  return t instanceof mn ? function(t2) {
    return `${t2.field.canonicalString()} ${t2.op} ${Qe(t2.value)}`;
  }(t) : t instanceof gn ? function(t2) {
    return t2.op.toString() + " {" + t2.getFilters().map(Rn).join(" ,") + "}";
  }(t) : "Filter";
}
class Pn extends mn {
  constructor(t, e, n) {
    super(t, e, n), this.key = ht.fromName(n.referenceValue);
  }
  matches(t) {
    const e = ht.comparator(t.key, this.key);
    return this.matchesComparison(e);
  }
}
class bn extends mn {
  constructor(t, e) {
    super(t, "in", e), this.keys = Sn("in", e);
  }
  matches(t) {
    return this.keys.some((e) => e.isEqual(t.key));
  }
}
class Vn extends mn {
  constructor(t, e) {
    super(t, "not-in", e), this.keys = Sn("not-in", e);
  }
  matches(t) {
    return !this.keys.some((e) => e.isEqual(t.key));
  }
}
function Sn(t, e) {
  var n;
  return ((null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []).map((t2) => ht.fromName(t2.referenceValue));
}
class Dn extends mn {
  constructor(t, e) {
    super(t, "array-contains", e);
  }
  matches(t) {
    const e = t.data.field(this.field);
    return Je(e) && Ue(e.arrayValue, this.value);
  }
}
class Cn extends mn {
  constructor(t, e) {
    super(t, "in", e);
  }
  matches(t) {
    const e = t.data.field(this.field);
    return null !== e && Ue(this.value.arrayValue, e);
  }
}
class xn extends mn {
  constructor(t, e) {
    super(t, "not-in", e);
  }
  matches(t) {
    if (Ue(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    }))
      return false;
    const e = t.data.field(this.field);
    return null !== e && !Ue(this.value.arrayValue, e);
  }
}
class Nn extends mn {
  constructor(t, e) {
    super(t, "array-contains-any", e);
  }
  matches(t) {
    const e = t.data.field(this.field);
    return !(!Je(e) || !e.arrayValue.values) && e.arrayValue.values.some((t2) => Ue(this.value.arrayValue, t2));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class kn {
  constructor(t, e = null, n = [], s = [], i = null, r2 = null, o = null) {
    this.path = t, this.collectionGroup = e, this.orderBy = n, this.filters = s, this.limit = i, this.startAt = r2, this.endAt = o, this.dt = null;
  }
}
function Mn(t, e = null, n = [], s = [], i = null, r2 = null, o = null) {
  return new kn(t, e, n, s, i, r2, o);
}
function $n(t) {
  const e = L(t);
  if (null === e.dt) {
    let t2 = e.path.canonicalString();
    null !== e.collectionGroup && (t2 += "|cg:" + e.collectionGroup), t2 += "|f:", t2 += e.filters.map((t3) => En(t3)).join(","), t2 += "|ob:", t2 += e.orderBy.map((t3) => function(t4) {
      return t4.field.canonicalString() + t4.dir;
    }(t3)).join(","), Ft(e.limit) || (t2 += "|l:", t2 += e.limit), e.startAt && (t2 += "|lb:", t2 += e.startAt.inclusive ? "b:" : "a:", t2 += e.startAt.position.map((t3) => Qe(t3)).join(",")), e.endAt && (t2 += "|ub:", t2 += e.endAt.inclusive ? "a:" : "b:", t2 += e.endAt.position.map((t3) => Qe(t3)).join(",")), e.dt = t2;
  }
  return e.dt;
}
function On(t, e) {
  if (t.limit !== e.limit)
    return false;
  if (t.orderBy.length !== e.orderBy.length)
    return false;
  for (let n = 0; n < t.orderBy.length; n++)
    if (!wn(t.orderBy[n], e.orderBy[n]))
      return false;
  if (t.filters.length !== e.filters.length)
    return false;
  for (let n = 0; n < t.filters.length; n++)
    if (!An(t.filters[n], e.filters[n]))
      return false;
  return t.collectionGroup === e.collectionGroup && (!!t.path.isEqual(e.path) && (!!fn(t.startAt, e.startAt) && fn(t.endAt, e.endAt)));
}
function Fn(t) {
  return ht.isDocumentKey(t.path) && null === t.collectionGroup && 0 === t.filters.length;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Un {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(t, e = null, n = [], s = [], i = null, r2 = "F", o = null, u = null) {
    this.path = t, this.collectionGroup = e, this.explicitOrderBy = n, this.filters = s, this.limit = i, this.limitType = r2, this.startAt = o, this.endAt = u, this.wt = null, // The corresponding `Target` of this `Query` instance.
    this._t = null, this.startAt, this.endAt;
  }
}
function Kn(t, e, n, s, i, r2, o, u) {
  return new Un(t, e, n, s, i, r2, o, u);
}
function Gn(t) {
  return new Un(t);
}
function Qn(t) {
  return 0 === t.filters.length && null === t.limit && null == t.startAt && null == t.endAt && (0 === t.explicitOrderBy.length || 1 === t.explicitOrderBy.length && t.explicitOrderBy[0].field.isKeyField());
}
function jn(t) {
  return t.explicitOrderBy.length > 0 ? t.explicitOrderBy[0].field : null;
}
function zn(t) {
  for (const e of t.filters) {
    const t2 = e.getFirstInequalityField();
    if (null !== t2)
      return t2;
  }
  return null;
}
function Wn(t) {
  return null !== t.collectionGroup;
}
function Hn(t) {
  const e = L(t);
  if (null === e.wt) {
    e.wt = [];
    const t2 = zn(e), n = jn(e);
    if (null !== t2 && null === n)
      t2.isKeyField() || e.wt.push(new dn(t2)), e.wt.push(new dn(
        at.keyField(),
        "asc"
        /* Direction.ASCENDING */
      ));
    else {
      let t3 = false;
      for (const n2 of e.explicitOrderBy)
        e.wt.push(n2), n2.field.isKeyField() && (t3 = true);
      if (!t3) {
        const t4 = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
        e.wt.push(new dn(at.keyField(), t4));
      }
    }
  }
  return e.wt;
}
function Jn(t) {
  const e = L(t);
  if (!e._t)
    if ("F" === e.limitType)
      e._t = Mn(e.path, e.collectionGroup, Hn(e), e.filters, e.limit, e.startAt, e.endAt);
    else {
      const t2 = [];
      for (const n2 of Hn(e)) {
        const e2 = "desc" === n2.dir ? "asc" : "desc";
        t2.push(new dn(n2.field, e2));
      }
      const n = e.endAt ? new hn(e.endAt.position, e.endAt.inclusive) : null, s = e.startAt ? new hn(e.startAt.position, e.startAt.inclusive) : null;
      e._t = Mn(e.path, e.collectionGroup, t2, e.filters, e.limit, n, s);
    }
  return e._t;
}
function Xn(t, e, n) {
  return new Un(t.path, t.collectionGroup, t.explicitOrderBy.slice(), t.filters.slice(), e, n, t.startAt, t.endAt);
}
function Zn(t, e) {
  return On(Jn(t), Jn(e)) && t.limitType === e.limitType;
}
function ts(t) {
  return `${$n(Jn(t))}|lt:${t.limitType}`;
}
function es(t) {
  return `Query(target=${function(t2) {
    let e = t2.path.canonicalString();
    return null !== t2.collectionGroup && (e += " collectionGroup=" + t2.collectionGroup), t2.filters.length > 0 && (e += `, filters: [${t2.filters.map((t3) => Rn(t3)).join(", ")}]`), Ft(t2.limit) || (e += ", limit: " + t2.limit), t2.orderBy.length > 0 && (e += `, orderBy: [${t2.orderBy.map((t3) => function(t4) {
      return `${t4.field.canonicalString()} (${t4.dir})`;
    }(t3)).join(", ")}]`), t2.startAt && (e += ", startAt: ", e += t2.startAt.inclusive ? "b:" : "a:", e += t2.startAt.position.map((t3) => Qe(t3)).join(",")), t2.endAt && (e += ", endAt: ", e += t2.endAt.inclusive ? "a:" : "b:", e += t2.endAt.position.map((t3) => Qe(t3)).join(",")), `Target(${e})`;
  }(Jn(t))}; limitType=${t.limitType})`;
}
function ns(t, e) {
  return e.isFoundDocument() && function(t2, e2) {
    const n = e2.key.path;
    return null !== t2.collectionGroup ? e2.key.hasCollectionId(t2.collectionGroup) && t2.path.isPrefixOf(n) : ht.isDocumentKey(t2.path) ? t2.path.isEqual(n) : t2.path.isImmediateParentOf(n);
  }(t, e) && function(t2, e2) {
    for (const n of Hn(t2))
      if (!n.field.isKeyField() && null === e2.data.field(n.field))
        return false;
    return true;
  }(t, e) && function(t2, e2) {
    for (const n of t2.filters)
      if (!n.matches(e2))
        return false;
    return true;
  }(t, e) && function(t2, e2) {
    if (t2.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    function(t3, e3, n) {
      const s = ln(t3, e3, n);
      return t3.inclusive ? s <= 0 : s < 0;
    }(t2.startAt, Hn(t2), e2))
      return false;
    if (t2.endAt && !function(t3, e3, n) {
      const s = ln(t3, e3, n);
      return t3.inclusive ? s >= 0 : s > 0;
    }(t2.endAt, Hn(t2), e2))
      return false;
    return true;
  }(t, e);
}
function ss(t) {
  return t.collectionGroup || (t.path.length % 2 == 1 ? t.path.lastSegment() : t.path.get(t.path.length - 2));
}
function is(t) {
  return (e, n) => {
    let s = false;
    for (const i of Hn(t)) {
      const t2 = rs(i, e, n);
      if (0 !== t2)
        return t2;
      s = s || i.field.isKeyField();
    }
    return 0;
  };
}
function rs(t, e, n) {
  const s = t.field.isKeyField() ? ht.comparator(e.key, n.key) : function(t2, e2, n2) {
    const s2 = e2.data.field(t2), i = n2.data.field(t2);
    return null !== s2 && null !== i ? Ke(s2, i) : O();
  }(t.field, e, n);
  switch (t.dir) {
    case "asc":
      return s;
    case "desc":
      return -1 * s;
    default:
      return O();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class os {
  constructor(t, e) {
    this.mapKeyFn = t, this.equalsFn = e, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(t) {
    const e = this.mapKeyFn(t), n = this.inner[e];
    if (void 0 !== n) {
      for (const [e2, s] of n)
        if (this.equalsFn(e2, t))
          return s;
    }
  }
  has(t) {
    return void 0 !== this.get(t);
  }
  /** Put this key and value in the map. */
  set(t, e) {
    const n = this.mapKeyFn(t), s = this.inner[n];
    if (void 0 === s)
      return this.inner[n] = [[t, e]], void this.innerSize++;
    for (let n2 = 0; n2 < s.length; n2++)
      if (this.equalsFn(s[n2][0], t))
        return void (s[n2] = [t, e]);
    s.push([t, e]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(t) {
    const e = this.mapKeyFn(t), n = this.inner[e];
    if (void 0 === n)
      return false;
    for (let s = 0; s < n.length; s++)
      if (this.equalsFn(n[s][0], t))
        return 1 === n.length ? delete this.inner[e] : n.splice(s, 1), this.innerSize--, true;
    return false;
  }
  forEach(t) {
    ge(this.inner, (e, n) => {
      for (const [e2, s] of n)
        t(e2, s);
    });
  }
  isEmpty() {
    return ye(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const us = new pe(ht.comparator);
function cs() {
  return us;
}
const as = new pe(ht.comparator);
function hs(...t) {
  let e = as;
  for (const n of t)
    e = e.insert(n.key, n);
  return e;
}
function ls(t) {
  let e = as;
  return t.forEach((t2, n) => e = e.insert(t2, n.overlayedDocument)), e;
}
function fs() {
  return ws();
}
function ds() {
  return ws();
}
function ws() {
  return new os((t) => t.toString(), (t, e) => t.isEqual(e));
}
const _s = new pe(ht.comparator);
const ms = new Ee(ht.comparator);
function gs(...t) {
  let e = ms;
  for (const n of t)
    e = e.add(n);
  return e;
}
const ys = new Ee(et);
function ps() {
  return ys;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Is(t, e) {
  if (t.useProto3Json) {
    if (isNaN(e))
      return {
        doubleValue: "NaN"
      };
    if (e === 1 / 0)
      return {
        doubleValue: "Infinity"
      };
    if (e === -1 / 0)
      return {
        doubleValue: "-Infinity"
      };
  }
  return {
    doubleValue: Bt(e) ? "-0" : e
  };
}
function Ts(t) {
  return {
    integerValue: "" + t
  };
}
function Es(t, e) {
  return Lt(e) ? Ts(e) : Is(t, e);
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class As {
  constructor() {
    this._ = void 0;
  }
}
function vs(t, e, n) {
  return t instanceof bs ? function(t2, e2) {
    const n2 = {
      fields: {
        __type__: {
          stringValue: "server_timestamp"
        },
        __local_write_time__: {
          timestampValue: {
            seconds: t2.seconds,
            nanos: t2.nanoseconds
          }
        }
      }
    };
    return e2 && Ne(e2) && (e2 = ke(e2)), e2 && (n2.fields.__previous_value__ = e2), {
      mapValue: n2
    };
  }(n, e) : t instanceof Vs ? Ss(t, e) : t instanceof Ds ? Cs(t, e) : function(t2, e2) {
    const n2 = Ps(t2, e2), s = Ns(n2) + Ns(t2.gt);
    return He(n2) && He(t2.gt) ? Ts(s) : Is(t2.serializer, s);
  }(t, e);
}
function Rs(t, e, n) {
  return t instanceof Vs ? Ss(t, e) : t instanceof Ds ? Cs(t, e) : n;
}
function Ps(t, e) {
  return t instanceof xs ? He(n = e) || function(t2) {
    return !!t2 && "doubleValue" in t2;
  }(n) ? e : {
    integerValue: 0
  } : null;
  var n;
}
class bs extends As {
}
class Vs extends As {
  constructor(t) {
    super(), this.elements = t;
  }
}
function Ss(t, e) {
  const n = ks(e);
  for (const e2 of t.elements)
    n.some((t2) => qe(t2, e2)) || n.push(e2);
  return {
    arrayValue: {
      values: n
    }
  };
}
class Ds extends As {
  constructor(t) {
    super(), this.elements = t;
  }
}
function Cs(t, e) {
  let n = ks(e);
  for (const e2 of t.elements)
    n = n.filter((t2) => !qe(t2, e2));
  return {
    arrayValue: {
      values: n
    }
  };
}
class xs extends As {
  constructor(t, e) {
    super(), this.serializer = t, this.gt = e;
  }
}
function Ns(t) {
  return Ce(t.integerValue || t.doubleValue);
}
function ks(t) {
  return Je(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ms {
  constructor(t, e) {
    this.field = t, this.transform = e;
  }
}
function $s(t, e) {
  return t.field.isEqual(e.field) && function(t2, e2) {
    return t2 instanceof Vs && e2 instanceof Vs || t2 instanceof Ds && e2 instanceof Ds ? nt(t2.elements, e2.elements, qe) : t2 instanceof xs && e2 instanceof xs ? qe(t2.gt, e2.gt) : t2 instanceof bs && e2 instanceof bs;
  }(t.transform, e.transform);
}
class Os {
  constructor(t, e) {
    this.version = t, this.transformResults = e;
  }
}
class Fs {
  constructor(t, e) {
    this.updateTime = t, this.exists = e;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new Fs();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(t) {
    return new Fs(void 0, t);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(t) {
    return new Fs(t);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return void 0 === this.updateTime && void 0 === this.exists;
  }
  isEqual(t) {
    return this.exists === t.exists && (this.updateTime ? !!t.updateTime && this.updateTime.isEqual(t.updateTime) : !t.updateTime);
  }
}
function Bs(t, e) {
  return void 0 !== t.updateTime ? e.isFoundDocument() && e.version.isEqual(t.updateTime) : void 0 === t.exists || t.exists === e.isFoundDocument();
}
class Ls {
}
function qs(t, e) {
  if (!t.hasLocalMutations || e && 0 === e.fields.length)
    return null;
  if (null === e)
    return t.isNoDocument() ? new Ys(t.key, Fs.none()) : new js(t.key, t.data, Fs.none());
  {
    const n = t.data, s = un.empty();
    let i = new Ee(at.comparator);
    for (let t2 of e.fields)
      if (!i.has(t2)) {
        let e2 = n.field(t2);
        null === e2 && t2.length > 1 && (t2 = t2.popLast(), e2 = n.field(t2)), null === e2 ? s.delete(t2) : s.set(t2, e2), i = i.add(t2);
      }
    return new zs(t.key, s, new Re(i.toArray()), Fs.none());
  }
}
function Us(t, e, n) {
  t instanceof js ? function(t2, e2, n2) {
    const s = t2.value.clone(), i = Hs(t2.fieldTransforms, e2, n2.transformResults);
    s.setAll(i), e2.convertToFoundDocument(n2.version, s).setHasCommittedMutations();
  }(t, e, n) : t instanceof zs ? function(t2, e2, n2) {
    if (!Bs(t2.precondition, e2))
      return void e2.convertToUnknownDocument(n2.version);
    const s = Hs(t2.fieldTransforms, e2, n2.transformResults), i = e2.data;
    i.setAll(Ws(t2)), i.setAll(s), e2.convertToFoundDocument(n2.version, i).setHasCommittedMutations();
  }(t, e, n) : function(t2, e2, n2) {
    e2.convertToNoDocument(n2.version).setHasCommittedMutations();
  }(0, e, n);
}
function Ks(t, e, n, s) {
  return t instanceof js ? function(t2, e2, n2, s2) {
    if (!Bs(t2.precondition, e2))
      return n2;
    const i = t2.value.clone(), r2 = Js(t2.fieldTransforms, s2, e2);
    return i.setAll(r2), e2.convertToFoundDocument(e2.version, i).setHasLocalMutations(), null;
  }(t, e, n, s) : t instanceof zs ? function(t2, e2, n2, s2) {
    if (!Bs(t2.precondition, e2))
      return n2;
    const i = Js(t2.fieldTransforms, s2, e2), r2 = e2.data;
    if (r2.setAll(Ws(t2)), r2.setAll(i), e2.convertToFoundDocument(e2.version, r2).setHasLocalMutations(), null === n2)
      return null;
    return n2.unionWith(t2.fieldMask.fields).unionWith(t2.fieldTransforms.map((t3) => t3.field));
  }(t, e, n, s) : function(t2, e2, n2) {
    if (Bs(t2.precondition, e2))
      return e2.convertToNoDocument(e2.version).setHasLocalMutations(), null;
    return n2;
  }(t, e, n);
}
function Gs(t, e) {
  let n = null;
  for (const s of t.fieldTransforms) {
    const t2 = e.data.field(s.field), i = Ps(s.transform, t2 || null);
    null != i && (null === n && (n = un.empty()), n.set(s.field, i));
  }
  return n || null;
}
function Qs(t, e) {
  return t.type === e.type && (!!t.key.isEqual(e.key) && (!!t.precondition.isEqual(e.precondition) && (!!function(t2, e2) {
    return void 0 === t2 && void 0 === e2 || !(!t2 || !e2) && nt(t2, e2, (t3, e3) => $s(t3, e3));
  }(t.fieldTransforms, e.fieldTransforms) && (0 === t.type ? t.value.isEqual(e.value) : 1 !== t.type || t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask)))));
}
class js extends Ls {
  constructor(t, e, n, s = []) {
    super(), this.key = t, this.value = e, this.precondition = n, this.fieldTransforms = s, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
}
class zs extends Ls {
  constructor(t, e, n, s, i = []) {
    super(), this.key = t, this.data = e, this.fieldMask = n, this.precondition = s, this.fieldTransforms = i, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function Ws(t) {
  const e = /* @__PURE__ */ new Map();
  return t.fieldMask.fields.forEach((n) => {
    if (!n.isEmpty()) {
      const s = t.data.field(n);
      e.set(n, s);
    }
  }), e;
}
function Hs(t, e, n) {
  const s = /* @__PURE__ */ new Map();
  F(t.length === n.length);
  for (let i = 0; i < n.length; i++) {
    const r2 = t[i], o = r2.transform, u = e.data.field(r2.field);
    s.set(r2.field, Rs(o, u, n[i]));
  }
  return s;
}
function Js(t, e, n) {
  const s = /* @__PURE__ */ new Map();
  for (const i of t) {
    const t2 = i.transform, r2 = n.data.field(i.field);
    s.set(i.field, vs(t2, r2, e));
  }
  return s;
}
class Ys extends Ls {
  constructor(t, e) {
    super(), this.key = t, this.precondition = e, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class Xs extends Ls {
  constructor(t, e) {
    super(), this.key = t, this.precondition = e, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zs {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(t, e, n, s) {
    this.batchId = t, this.localWriteTime = e, this.baseMutations = n, this.mutations = s;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(t, e) {
    const n = e.mutationResults;
    for (let e2 = 0; e2 < this.mutations.length; e2++) {
      const s = this.mutations[e2];
      if (s.key.isEqual(t.key)) {
        Us(s, t, n[e2]);
      }
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(t, e) {
    for (const n of this.baseMutations)
      n.key.isEqual(t.key) && (e = Ks(n, t, e, this.localWriteTime));
    for (const n of this.mutations)
      n.key.isEqual(t.key) && (e = Ks(n, t, e, this.localWriteTime));
    return e;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(t, e) {
    const n = ds();
    return this.mutations.forEach((s) => {
      const i = t.get(s.key), r2 = i.overlayedDocument;
      let o = this.applyToLocalView(r2, i.mutatedFields);
      o = e.has(s.key) ? null : o;
      const u = qs(r2, o);
      null !== u && n.set(s.key, u), r2.isValidDocument() || r2.convertToNoDocument(rt.min());
    }), n;
  }
  keys() {
    return this.mutations.reduce((t, e) => t.add(e.key), gs());
  }
  isEqual(t) {
    return this.batchId === t.batchId && nt(this.mutations, t.mutations, (t2, e) => Qs(t2, e)) && nt(this.baseMutations, t.baseMutations, (t2, e) => Qs(t2, e));
  }
}
class ti {
  constructor(t, e, n, s) {
    this.batch = t, this.commitVersion = e, this.mutationResults = n, this.docVersions = s;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(t, e, n) {
    F(t.mutations.length === n.length);
    let s = _s;
    const i = t.mutations;
    for (let t2 = 0; t2 < i.length; t2++)
      s = s.insert(i[t2].key, n[t2].version);
    return new ti(t, e, n, s);
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ei {
  constructor(t, e) {
    this.largestBatchId = t, this.mutation = e;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(t) {
    return null !== t && this.mutation === t.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class si {
  constructor(t, e) {
    this.count = t, this.unchangedNames = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ii, ri;
function oi(t) {
  switch (t) {
    default:
      return O();
    case q.CANCELLED:
    case q.UNKNOWN:
    case q.DEADLINE_EXCEEDED:
    case q.RESOURCE_EXHAUSTED:
    case q.INTERNAL:
    case q.UNAVAILABLE:
    case q.UNAUTHENTICATED:
      return false;
    case q.INVALID_ARGUMENT:
    case q.NOT_FOUND:
    case q.ALREADY_EXISTS:
    case q.PERMISSION_DENIED:
    case q.FAILED_PRECONDITION:
    case q.ABORTED:
    case q.OUT_OF_RANGE:
    case q.UNIMPLEMENTED:
    case q.DATA_LOSS:
      return true;
  }
}
function ui(t) {
  if (void 0 === t)
    return k("GRPC error has no .code"), q.UNKNOWN;
  switch (t) {
    case ii.OK:
      return q.OK;
    case ii.CANCELLED:
      return q.CANCELLED;
    case ii.UNKNOWN:
      return q.UNKNOWN;
    case ii.DEADLINE_EXCEEDED:
      return q.DEADLINE_EXCEEDED;
    case ii.RESOURCE_EXHAUSTED:
      return q.RESOURCE_EXHAUSTED;
    case ii.INTERNAL:
      return q.INTERNAL;
    case ii.UNAVAILABLE:
      return q.UNAVAILABLE;
    case ii.UNAUTHENTICATED:
      return q.UNAUTHENTICATED;
    case ii.INVALID_ARGUMENT:
      return q.INVALID_ARGUMENT;
    case ii.NOT_FOUND:
      return q.NOT_FOUND;
    case ii.ALREADY_EXISTS:
      return q.ALREADY_EXISTS;
    case ii.PERMISSION_DENIED:
      return q.PERMISSION_DENIED;
    case ii.FAILED_PRECONDITION:
      return q.FAILED_PRECONDITION;
    case ii.ABORTED:
      return q.ABORTED;
    case ii.OUT_OF_RANGE:
      return q.OUT_OF_RANGE;
    case ii.UNIMPLEMENTED:
      return q.UNIMPLEMENTED;
    case ii.DATA_LOSS:
      return q.DATA_LOSS;
    default:
      return O();
  }
}
(ri = ii || (ii = {}))[ri.OK = 0] = "OK", ri[ri.CANCELLED = 1] = "CANCELLED", ri[ri.UNKNOWN = 2] = "UNKNOWN", ri[ri.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", ri[ri.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ri[ri.NOT_FOUND = 5] = "NOT_FOUND", ri[ri.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ri[ri.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", ri[ri.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ri[ri.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", ri[ri.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ri[ri.ABORTED = 10] = "ABORTED", ri[ri.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ri[ri.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", ri[ri.INTERNAL = 13] = "INTERNAL", ri[ri.UNAVAILABLE = 14] = "UNAVAILABLE", ri[ri.DATA_LOSS = 15] = "DATA_LOSS";
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ci {
  constructor() {
    this.onExistenceFilterMismatchCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * Returns the singleton instance of this class, or null if it has not been
   * initialized.
   */
  static get instance() {
    return ai;
  }
  /**
   * Returns the singleton instance of this class, creating it if is has never
   * been created before.
   */
  static getOrCreateInstance() {
    return null === ai && (ai = new ci()), ai;
  }
  /**
   * Registers a callback to be notified when an existence filter mismatch
   * occurs in the Watch listen stream.
   *
   * The relative order in which callbacks are notified is unspecified; do not
   * rely on any particular ordering. If a given callback is registered multiple
   * times then it will be notified multiple times, once per registration.
   *
   * @param callback the callback to invoke upon existence filter mismatch.
   *
   * @return a function that, when called, unregisters the given callback; only
   * the first invocation of the returned function does anything; all subsequent
   * invocations do nothing.
   */
  onExistenceFilterMismatch(t) {
    const e = Symbol();
    return this.onExistenceFilterMismatchCallbacks.set(e, t), () => this.onExistenceFilterMismatchCallbacks.delete(e);
  }
  /**
   * Invokes all currently-registered `onExistenceFilterMismatch` callbacks.
   * @param info Information about the existence filter mismatch.
   */
  notifyOnExistenceFilterMismatch(t) {
    this.onExistenceFilterMismatchCallbacks.forEach((e) => e(t));
  }
}
let ai = null;
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function hi() {
  return new TextEncoder();
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const li = new Integer([4294967295, 4294967295], 0);
function fi(t) {
  const e = hi().encode(t), n = new Md5();
  return n.update(e), new Uint8Array(n.digest());
}
function di(t) {
  const e = new DataView(t.buffer), n = e.getUint32(
    0,
    /* littleEndian= */
    true
  ), s = e.getUint32(
    4,
    /* littleEndian= */
    true
  ), i = e.getUint32(
    8,
    /* littleEndian= */
    true
  ), r2 = e.getUint32(
    12,
    /* littleEndian= */
    true
  );
  return [new Integer([n, s], 0), new Integer([i, r2], 0)];
}
class wi {
  constructor(t, e, n) {
    if (this.bitmap = t, this.padding = e, this.hashCount = n, e < 0 || e >= 8)
      throw new _i(`Invalid padding: ${e}`);
    if (n < 0)
      throw new _i(`Invalid hash count: ${n}`);
    if (t.length > 0 && 0 === this.hashCount)
      throw new _i(`Invalid hash count: ${n}`);
    if (0 === t.length && 0 !== e)
      throw new _i(`Invalid padding when bitmap length is 0: ${e}`);
    this.It = 8 * t.length - e, // Set the bit count in Integer to avoid repetition in mightContain().
    this.Tt = Integer.fromNumber(this.It);
  }
  // Calculate the ith hash value based on the hashed 64bit integers,
  // and calculate its corresponding bit index in the bitmap to be checked.
  Et(t, e, n) {
    let s = t.add(e.multiply(Integer.fromNumber(n)));
    return 1 === s.compare(li) && (s = new Integer([s.getBits(0), s.getBits(1)], 0)), s.modulo(this.Tt).toNumber();
  }
  // Return whether the bit on the given index in the bitmap is set to 1.
  At(t) {
    return 0 != (this.bitmap[Math.floor(t / 8)] & 1 << t % 8);
  }
  vt(t) {
    if (0 === this.It)
      return false;
    const e = fi(t), [n, s] = di(e);
    for (let t2 = 0; t2 < this.hashCount; t2++) {
      const e2 = this.Et(n, s, t2);
      if (!this.At(e2))
        return false;
    }
    return true;
  }
  /** Create bloom filter for testing purposes only. */
  static create(t, e, n) {
    const s = t % 8 == 0 ? 0 : 8 - t % 8, i = new Uint8Array(Math.ceil(t / 8)), r2 = new wi(i, s, e);
    return n.forEach((t2) => r2.insert(t2)), r2;
  }
  insert(t) {
    if (0 === this.It)
      return;
    const e = fi(t), [n, s] = di(e);
    for (let t2 = 0; t2 < this.hashCount; t2++) {
      const e2 = this.Et(n, s, t2);
      this.Rt(e2);
    }
  }
  Rt(t) {
    const e = Math.floor(t / 8), n = t % 8;
    this.bitmap[e] |= 1 << n;
  }
}
class _i extends Error {
  constructor() {
    super(...arguments), this.name = "BloomFilterError";
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class mi {
  constructor(t, e, n, s, i) {
    this.snapshotVersion = t, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = s, this.resolvedLimboDocuments = i;
  }
  /**
   * HACK: Views require RemoteEvents in order to determine whether the view is
   * CURRENT, but secondary tabs don't receive remote events. So this method is
   * used to create a synthesized RemoteEvent that can be used to apply a
   * CURRENT status change to a View, for queries executed in a different tab.
   */
  // PORTING NOTE: Multi-tab only
  static createSynthesizedRemoteEventForCurrentChange(t, e, n) {
    const s = /* @__PURE__ */ new Map();
    return s.set(t, gi.createSynthesizedTargetChangeForCurrentChange(t, e, n)), new mi(rt.min(), s, new pe(et), cs(), gs());
  }
}
class gi {
  constructor(t, e, n, s, i) {
    this.resumeToken = t, this.current = e, this.addedDocuments = n, this.modifiedDocuments = s, this.removedDocuments = i;
  }
  /**
   * This method is used to create a synthesized TargetChanges that can be used to
   * apply a CURRENT status change to a View (for queries executed in a different
   * tab) or for new queries (to raise snapshots with correct CURRENT status).
   */
  static createSynthesizedTargetChangeForCurrentChange(t, e, n) {
    return new gi(n, e, gs(), gs(), gs());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yi {
  constructor(t, e, n, s) {
    this.Pt = t, this.removedTargetIds = e, this.key = n, this.bt = s;
  }
}
class pi {
  constructor(t, e) {
    this.targetId = t, this.Vt = e;
  }
}
class Ii {
  constructor(t, e, n = Ve.EMPTY_BYTE_STRING, s = null) {
    this.state = t, this.targetIds = e, this.resumeToken = n, this.cause = s;
  }
}
class Ti {
  constructor() {
    this.St = 0, /**
     * Keeps track of the document changes since the last raised snapshot.
     *
     * These changes are continuously updated as we receive document updates and
     * always reflect the current set of changes against the last issued snapshot.
     */
    this.Dt = vi(), /** See public getters for explanations of these fields. */
    this.Ct = Ve.EMPTY_BYTE_STRING, this.xt = false, /**
     * Whether this target state should be included in the next snapshot. We
     * initialize to true so that newly-added targets are included in the next
     * RemoteEvent.
     */
    this.Nt = true;
  }
  /**
   * Whether this target has been marked 'current'.
   *
   * 'Current' has special meaning in the RPC protocol: It implies that the
   * Watch backend has sent us all changes up to the point at which the target
   * was added and that the target is consistent with the rest of the watch
   * stream.
   */
  get current() {
    return this.xt;
  }
  /** The last resume token sent to us for this target. */
  get resumeToken() {
    return this.Ct;
  }
  /** Whether this target has pending target adds or target removes. */
  get kt() {
    return 0 !== this.St;
  }
  /** Whether we have modified any state that should trigger a snapshot. */
  get Mt() {
    return this.Nt;
  }
  /**
   * Applies the resume token to the TargetChange, but only when it has a new
   * value. Empty resumeTokens are discarded.
   */
  $t(t) {
    t.approximateByteSize() > 0 && (this.Nt = true, this.Ct = t);
  }
  /**
   * Creates a target change from the current set of changes.
   *
   * To reset the document changes after raising this snapshot, call
   * `clearPendingChanges()`.
   */
  Ot() {
    let t = gs(), e = gs(), n = gs();
    return this.Dt.forEach((s, i) => {
      switch (i) {
        case 0:
          t = t.add(s);
          break;
        case 2:
          e = e.add(s);
          break;
        case 1:
          n = n.add(s);
          break;
        default:
          O();
      }
    }), new gi(this.Ct, this.xt, t, e, n);
  }
  /**
   * Resets the document changes and sets `hasPendingChanges` to false.
   */
  Ft() {
    this.Nt = false, this.Dt = vi();
  }
  Bt(t, e) {
    this.Nt = true, this.Dt = this.Dt.insert(t, e);
  }
  Lt(t) {
    this.Nt = true, this.Dt = this.Dt.remove(t);
  }
  qt() {
    this.St += 1;
  }
  Ut() {
    this.St -= 1;
  }
  Kt() {
    this.Nt = true, this.xt = true;
  }
}
class Ei {
  constructor(t) {
    this.Gt = t, /** The internal state of all tracked targets. */
    this.Qt = /* @__PURE__ */ new Map(), /** Keeps track of the documents to update since the last raised snapshot. */
    this.jt = cs(), /** A mapping of document keys to their set of target IDs. */
    this.zt = Ai(), /**
     * A map of targets with existence filter mismatches. These targets are
     * known to be inconsistent and their listens needs to be re-established by
     * RemoteStore.
     */
    this.Wt = new pe(et);
  }
  /**
   * Processes and adds the DocumentWatchChange to the current set of changes.
   */
  Ht(t) {
    for (const e of t.Pt)
      t.bt && t.bt.isFoundDocument() ? this.Jt(e, t.bt) : this.Yt(e, t.key, t.bt);
    for (const e of t.removedTargetIds)
      this.Yt(e, t.key, t.bt);
  }
  /** Processes and adds the WatchTargetChange to the current set of changes. */
  Xt(t) {
    this.forEachTarget(t, (e) => {
      const n = this.Zt(e);
      switch (t.state) {
        case 0:
          this.te(e) && n.$t(t.resumeToken);
          break;
        case 1:
          n.Ut(), n.kt || // We have a freshly added target, so we need to reset any state
          // that we had previously. This can happen e.g. when remove and add
          // back a target for existence filter mismatches.
          n.Ft(), n.$t(t.resumeToken);
          break;
        case 2:
          n.Ut(), n.kt || this.removeTarget(e);
          break;
        case 3:
          this.te(e) && (n.Kt(), n.$t(t.resumeToken));
          break;
        case 4:
          this.te(e) && // Reset the target and synthesizes removes for all existing
          // documents. The backend will re-add any documents that still
          // match the target before it sends the next global snapshot.
          (this.ee(e), n.$t(t.resumeToken));
          break;
        default:
          O();
      }
    });
  }
  /**
   * Iterates over all targetIds that the watch change applies to: either the
   * targetIds explicitly listed in the change or the targetIds of all currently
   * active targets.
   */
  forEachTarget(t, e) {
    t.targetIds.length > 0 ? t.targetIds.forEach(e) : this.Qt.forEach((t2, n) => {
      this.te(n) && e(n);
    });
  }
  /**
   * Handles existence filters and synthesizes deletes for filter mismatches.
   * Targets that are invalidated by filter mismatches are added to
   * `pendingTargetResets`.
   */
  ne(t) {
    var e;
    const n = t.targetId, s = t.Vt.count, i = this.se(n);
    if (i) {
      const r2 = i.target;
      if (Fn(r2))
        if (0 === s) {
          const t2 = new ht(r2.path);
          this.Yt(n, t2, an.newNoDocument(t2, rt.min()));
        } else
          F(1 === s);
      else {
        const i2 = this.ie(n);
        if (i2 !== s) {
          const s2 = this.re(t, i2);
          if (0 !== s2) {
            this.ee(n);
            const t2 = 2 === s2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
            this.Wt = this.Wt.insert(n, t2);
          }
          null === (e = ci.instance) || void 0 === e || e.notifyOnExistenceFilterMismatch(function(t2, e2, n2) {
            var s3, i3, r3, o, u, c;
            const a = {
              localCacheCount: e2,
              existenceFilterCount: n2.count
            }, h = n2.unchangedNames;
            h && (a.bloomFilter = {
              applied: 0 === t2,
              hashCount: null !== (s3 = null == h ? void 0 : h.hashCount) && void 0 !== s3 ? s3 : 0,
              bitmapLength: null !== (o = null === (r3 = null === (i3 = null == h ? void 0 : h.bits) || void 0 === i3 ? void 0 : i3.bitmap) || void 0 === r3 ? void 0 : r3.length) && void 0 !== o ? o : 0,
              padding: null !== (c = null === (u = null == h ? void 0 : h.bits) || void 0 === u ? void 0 : u.padding) && void 0 !== c ? c : 0
            });
            return a;
          }(s2, i2, t.Vt));
        }
      }
    }
  }
  /**
   * Apply bloom filter to remove the deleted documents, and return the
   * application status.
   */
  re(t, e) {
    const { unchangedNames: n, count: s } = t.Vt;
    if (!n || !n.bits)
      return 1;
    const { bits: { bitmap: i = "", padding: r2 = 0 }, hashCount: o = 0 } = n;
    let u, c;
    try {
      u = xe(i).toUint8Array();
    } catch (t2) {
      if (t2 instanceof Pe)
        return M("Decoding the base64 bloom filter in existence filter failed (" + t2.message + "); ignoring the bloom filter and falling back to full re-query."), 1;
      throw t2;
    }
    try {
      c = new wi(u, r2, o);
    } catch (t2) {
      return M(t2 instanceof _i ? "BloomFilter error: " : "Applying bloom filter failed: ", t2), 1;
    }
    if (0 === c.It)
      return 1;
    return s !== e - this.oe(t.targetId, c) ? 2 : 0;
  }
  /**
   * Filter out removed documents based on bloom filter membership result and
   * return number of documents removed.
   */
  oe(t, e) {
    const n = this.Gt.getRemoteKeysForTarget(t);
    let s = 0;
    return n.forEach((n2) => {
      const i = this.Gt.ue(), r2 = `projects/${i.projectId}/databases/${i.database}/documents/${n2.path.canonicalString()}`;
      e.vt(r2) || (this.Yt(
        t,
        n2,
        /*updatedDocument=*/
        null
      ), s++);
    }), s;
  }
  /**
   * Converts the currently accumulated state into a remote event at the
   * provided snapshot version. Resets the accumulated changes before returning.
   */
  ce(t) {
    const e = /* @__PURE__ */ new Map();
    this.Qt.forEach((n2, s2) => {
      const i = this.se(s2);
      if (i) {
        if (n2.current && Fn(i.target)) {
          const e2 = new ht(i.target.path);
          null !== this.jt.get(e2) || this.ae(s2, e2) || this.Yt(s2, e2, an.newNoDocument(e2, t));
        }
        n2.Mt && (e.set(s2, n2.Ot()), n2.Ft());
      }
    });
    let n = gs();
    this.zt.forEach((t2, e2) => {
      let s2 = true;
      e2.forEachWhile((t3) => {
        const e3 = this.se(t3);
        return !e3 || "TargetPurposeLimboResolution" === e3.purpose || (s2 = false, false);
      }), s2 && (n = n.add(t2));
    }), this.jt.forEach((e2, n2) => n2.setReadTime(t));
    const s = new mi(t, e, this.Wt, this.jt, n);
    return this.jt = cs(), this.zt = Ai(), this.Wt = new pe(et), s;
  }
  /**
   * Adds the provided document to the internal list of document updates and
   * its document key to the given target's mapping.
   */
  // Visible for testing.
  Jt(t, e) {
    if (!this.te(t))
      return;
    const n = this.ae(t, e.key) ? 2 : 0;
    this.Zt(t).Bt(e.key, n), this.jt = this.jt.insert(e.key, e), this.zt = this.zt.insert(e.key, this.he(e.key).add(t));
  }
  /**
   * Removes the provided document from the target mapping. If the
   * document no longer matches the target, but the document's state is still
   * known (e.g. we know that the document was deleted or we received the change
   * that caused the filter mismatch), the new document can be provided
   * to update the remote document cache.
   */
  // Visible for testing.
  Yt(t, e, n) {
    if (!this.te(t))
      return;
    const s = this.Zt(t);
    this.ae(t, e) ? s.Bt(
      e,
      1
      /* ChangeType.Removed */
    ) : (
      // The document may have entered and left the target before we raised a
      // snapshot, so we can just ignore the change.
      s.Lt(e)
    ), this.zt = this.zt.insert(e, this.he(e).delete(t)), n && (this.jt = this.jt.insert(e, n));
  }
  removeTarget(t) {
    this.Qt.delete(t);
  }
  /**
   * Returns the current count of documents in the target. This includes both
   * the number of documents that the LocalStore considers to be part of the
   * target as well as any accumulated changes.
   */
  ie(t) {
    const e = this.Zt(t).Ot();
    return this.Gt.getRemoteKeysForTarget(t).size + e.addedDocuments.size - e.removedDocuments.size;
  }
  /**
   * Increment the number of acks needed from watch before we can consider the
   * server to be 'in-sync' with the client's active targets.
   */
  qt(t) {
    this.Zt(t).qt();
  }
  Zt(t) {
    let e = this.Qt.get(t);
    return e || (e = new Ti(), this.Qt.set(t, e)), e;
  }
  he(t) {
    let e = this.zt.get(t);
    return e || (e = new Ee(et), this.zt = this.zt.insert(t, e)), e;
  }
  /**
   * Verifies that the user is still interested in this target (by calling
   * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
   * from watch.
   */
  te(t) {
    const e = null !== this.se(t);
    return e || N("WatchChangeAggregator", "Detected inactive target", t), e;
  }
  /**
   * Returns the TargetData for an active target (i.e. a target that the user
   * is still interested in that has no outstanding target change requests).
   */
  se(t) {
    const e = this.Qt.get(t);
    return e && e.kt ? null : this.Gt.le(t);
  }
  /**
   * Resets the state of a Watch target to its initial state (e.g. sets
   * 'current' to false, clears the resume token and removes its target mapping
   * from all documents).
   */
  ee(t) {
    this.Qt.set(t, new Ti());
    this.Gt.getRemoteKeysForTarget(t).forEach((e) => {
      this.Yt(
        t,
        e,
        /*updatedDocument=*/
        null
      );
    });
  }
  /**
   * Returns whether the LocalStore considers the document to be part of the
   * specified target.
   */
  ae(t, e) {
    return this.Gt.getRemoteKeysForTarget(t).has(e);
  }
}
function Ai() {
  return new pe(ht.comparator);
}
function vi() {
  return new pe(ht.comparator);
}
const Ri = (() => {
  const t = {
    asc: "ASCENDING",
    desc: "DESCENDING"
  };
  return t;
})(), Pi = (() => {
  const t = {
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
    "not-in": "NOT_IN",
    "array-contains-any": "ARRAY_CONTAINS_ANY"
  };
  return t;
})(), bi = (() => {
  const t = {
    and: "AND",
    or: "OR"
  };
  return t;
})();
class Vi {
  constructor(t, e) {
    this.databaseId = t, this.useProto3Json = e;
  }
}
function Si(t, e) {
  return t.useProto3Json || Ft(e) ? e : {
    value: e
  };
}
function Di(t, e) {
  if (t.useProto3Json) {
    return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
  }
  return {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function Ci(t, e) {
  return t.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function xi(t, e) {
  return Di(t, e.toTimestamp());
}
function Ni(t) {
  return F(!!t), rt.fromTimestamp(function(t2) {
    const e = De(t2);
    return new it(e.seconds, e.nanos);
  }(t));
}
function ki(t, e) {
  return function(t2) {
    return new ut(["projects", t2.projectId, "databases", t2.database]);
  }(t).child("documents").child(e).canonicalString();
}
function Mi(t) {
  const e = ut.fromString(t);
  return F(ur(e)), e;
}
function $i(t, e) {
  return ki(t.databaseId, e.path);
}
function Oi(t, e) {
  const n = Mi(e);
  if (n.get(1) !== t.databaseId.projectId)
    throw new U(q.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t.databaseId.projectId);
  if (n.get(3) !== t.databaseId.database)
    throw new U(q.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t.databaseId.database);
  return new ht(qi(n));
}
function Fi(t, e) {
  return ki(t.databaseId, e);
}
function Bi(t) {
  const e = Mi(t);
  return 4 === e.length ? ut.emptyPath() : qi(e);
}
function Li(t) {
  return new ut(["projects", t.databaseId.projectId, "databases", t.databaseId.database]).canonicalString();
}
function qi(t) {
  return F(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
}
function Ui(t, e, n) {
  return {
    name: $i(t, e),
    fields: n.value.mapValue.fields
  };
}
function Qi(t, e) {
  let n;
  if ("targetChange" in e) {
    e.targetChange;
    const s = function(t2) {
      return "NO_CHANGE" === t2 ? 0 : "ADD" === t2 ? 1 : "REMOVE" === t2 ? 2 : "CURRENT" === t2 ? 3 : "RESET" === t2 ? 4 : O();
    }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r2 = function(t2, e2) {
      return t2.useProto3Json ? (F(void 0 === e2 || "string" == typeof e2), Ve.fromBase64String(e2 || "")) : (F(void 0 === e2 || e2 instanceof Uint8Array), Ve.fromUint8Array(e2 || new Uint8Array()));
    }(t, e.targetChange.resumeToken), o = e.targetChange.cause, u = o && function(t2) {
      const e2 = void 0 === t2.code ? q.UNKNOWN : ui(t2.code);
      return new U(e2, t2.message || "");
    }(o);
    n = new Ii(s, i, r2, u || null);
  } else if ("documentChange" in e) {
    e.documentChange;
    const s = e.documentChange;
    s.document, s.document.name, s.document.updateTime;
    const i = Oi(t, s.document.name), r2 = Ni(s.document.updateTime), o = s.document.createTime ? Ni(s.document.createTime) : rt.min(), u = new un({
      mapValue: {
        fields: s.document.fields
      }
    }), c = an.newFoundDocument(i, r2, o, u), a = s.targetIds || [], h = s.removedTargetIds || [];
    n = new yi(a, h, c.key, c);
  } else if ("documentDelete" in e) {
    e.documentDelete;
    const s = e.documentDelete;
    s.document;
    const i = Oi(t, s.document), r2 = s.readTime ? Ni(s.readTime) : rt.min(), o = an.newNoDocument(i, r2), u = s.removedTargetIds || [];
    n = new yi([], u, o.key, o);
  } else if ("documentRemove" in e) {
    e.documentRemove;
    const s = e.documentRemove;
    s.document;
    const i = Oi(t, s.document), r2 = s.removedTargetIds || [];
    n = new yi([], r2, i, null);
  } else {
    if (!("filter" in e))
      return O();
    {
      e.filter;
      const t2 = e.filter;
      t2.targetId;
      const { count: s = 0, unchangedNames: i } = t2, r2 = new si(s, i), o = t2.targetId;
      n = new pi(o, r2);
    }
  }
  return n;
}
function ji(t, e) {
  let n;
  if (e instanceof js)
    n = {
      update: Ui(t, e.key, e.value)
    };
  else if (e instanceof Ys)
    n = {
      delete: $i(t, e.key)
    };
  else if (e instanceof zs)
    n = {
      update: Ui(t, e.key, e.data),
      updateMask: or(e.fieldMask)
    };
  else {
    if (!(e instanceof Xs))
      return O();
    n = {
      verify: $i(t, e.key)
    };
  }
  return e.fieldTransforms.length > 0 && (n.updateTransforms = e.fieldTransforms.map((t2) => function(t3, e2) {
    const n2 = e2.transform;
    if (n2 instanceof bs)
      return {
        fieldPath: e2.field.canonicalString(),
        setToServerValue: "REQUEST_TIME"
      };
    if (n2 instanceof Vs)
      return {
        fieldPath: e2.field.canonicalString(),
        appendMissingElements: {
          values: n2.elements
        }
      };
    if (n2 instanceof Ds)
      return {
        fieldPath: e2.field.canonicalString(),
        removeAllFromArray: {
          values: n2.elements
        }
      };
    if (n2 instanceof xs)
      return {
        fieldPath: e2.field.canonicalString(),
        increment: n2.gt
      };
    throw O();
  }(0, t2))), e.precondition.isNone || (n.currentDocument = function(t2, e2) {
    return void 0 !== e2.updateTime ? {
      updateTime: xi(t2, e2.updateTime)
    } : void 0 !== e2.exists ? {
      exists: e2.exists
    } : O();
  }(t, e.precondition)), n;
}
function Wi(t, e) {
  return t && t.length > 0 ? (F(void 0 !== e), t.map((t2) => function(t3, e2) {
    let n = t3.updateTime ? Ni(t3.updateTime) : Ni(e2);
    return n.isEqual(rt.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (n = Ni(e2)), new Os(n, t3.transformResults || []);
  }(t2, e))) : [];
}
function Hi(t, e) {
  return {
    documents: [Fi(t, e.path)]
  };
}
function Ji(t, e) {
  const n = {
    structuredQuery: {}
  }, s = e.path;
  null !== e.collectionGroup ? (n.parent = Fi(t, s), n.structuredQuery.from = [{
    collectionId: e.collectionGroup,
    allDescendants: true
  }]) : (n.parent = Fi(t, s.popLast()), n.structuredQuery.from = [{
    collectionId: s.lastSegment()
  }]);
  const i = function(t2) {
    if (0 === t2.length)
      return;
    return rr(gn.create(
      t2,
      "and"
      /* CompositeOperator.AND */
    ));
  }(e.filters);
  i && (n.structuredQuery.where = i);
  const r2 = function(t2) {
    if (0 === t2.length)
      return;
    return t2.map((t3) => (
      // visible for testing
      function(t4) {
        return {
          field: sr(t4.field),
          direction: tr(t4.dir)
        };
      }(t3)
    ));
  }(e.orderBy);
  r2 && (n.structuredQuery.orderBy = r2);
  const o = Si(t, e.limit);
  var u;
  return null !== o && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = {
    before: (u = e.startAt).inclusive,
    values: u.position
  }), e.endAt && (n.structuredQuery.endAt = function(t2) {
    return {
      before: !t2.inclusive,
      values: t2.position
    };
  }(e.endAt)), n;
}
function Yi(t) {
  let e = Bi(t.parent);
  const n = t.structuredQuery, s = n.from ? n.from.length : 0;
  let i = null;
  if (s > 0) {
    F(1 === s);
    const t2 = n.from[0];
    t2.allDescendants ? i = t2.collectionId : e = e.child(t2.collectionId);
  }
  let r2 = [];
  n.where && (r2 = function(t2) {
    const e2 = Zi(t2);
    if (e2 instanceof gn && In(e2))
      return e2.getFilters();
    return [e2];
  }(n.where));
  let o = [];
  n.orderBy && (o = n.orderBy.map((t2) => function(t3) {
    return new dn(
      ir(t3.field),
      // visible for testing
      function(t4) {
        switch (t4) {
          case "ASCENDING":
            return "asc";
          case "DESCENDING":
            return "desc";
          default:
            return;
        }
      }(t3.direction)
    );
  }(t2)));
  let u = null;
  n.limit && (u = function(t2) {
    let e2;
    return e2 = "object" == typeof t2 ? t2.value : t2, Ft(e2) ? null : e2;
  }(n.limit));
  let c = null;
  n.startAt && (c = function(t2) {
    const e2 = !!t2.before, n2 = t2.values || [];
    return new hn(n2, e2);
  }(n.startAt));
  let a = null;
  return n.endAt && (a = function(t2) {
    const e2 = !t2.before, n2 = t2.values || [];
    return new hn(n2, e2);
  }(n.endAt)), Kn(e, i, o, r2, u, "F", c, a);
}
function Xi(t, e) {
  const n = function(t2) {
    switch (t2) {
      case "TargetPurposeListen":
        return null;
      case "TargetPurposeExistenceFilterMismatch":
        return "existence-filter-mismatch";
      case "TargetPurposeExistenceFilterMismatchBloom":
        return "existence-filter-mismatch-bloom";
      case "TargetPurposeLimboResolution":
        return "limbo-document";
      default:
        return O();
    }
  }(e.purpose);
  return null == n ? null : {
    "goog-listen-tags": n
  };
}
function Zi(t) {
  return void 0 !== t.unaryFilter ? function(t2) {
    switch (t2.unaryFilter.op) {
      case "IS_NAN":
        const e = ir(t2.unaryFilter.field);
        return mn.create(e, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const n = ir(t2.unaryFilter.field);
        return mn.create(n, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const s = ir(t2.unaryFilter.field);
        return mn.create(s, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const i = ir(t2.unaryFilter.field);
        return mn.create(i, "!=", {
          nullValue: "NULL_VALUE"
        });
      default:
        return O();
    }
  }(t) : void 0 !== t.fieldFilter ? function(t2) {
    return mn.create(ir(t2.fieldFilter.field), function(t3) {
      switch (t3) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        default:
          return O();
      }
    }(t2.fieldFilter.op), t2.fieldFilter.value);
  }(t) : void 0 !== t.compositeFilter ? function(t2) {
    return gn.create(t2.compositeFilter.filters.map((t3) => Zi(t3)), function(t3) {
      switch (t3) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return O();
      }
    }(t2.compositeFilter.op));
  }(t) : O();
}
function tr(t) {
  return Ri[t];
}
function er(t) {
  return Pi[t];
}
function nr(t) {
  return bi[t];
}
function sr(t) {
  return {
    fieldPath: t.canonicalString()
  };
}
function ir(t) {
  return at.fromServerFormat(t.fieldPath);
}
function rr(t) {
  return t instanceof mn ? function(t2) {
    if ("==" === t2.op) {
      if (Xe(t2.value))
        return {
          unaryFilter: {
            field: sr(t2.field),
            op: "IS_NAN"
          }
        };
      if (Ye(t2.value))
        return {
          unaryFilter: {
            field: sr(t2.field),
            op: "IS_NULL"
          }
        };
    } else if ("!=" === t2.op) {
      if (Xe(t2.value))
        return {
          unaryFilter: {
            field: sr(t2.field),
            op: "IS_NOT_NAN"
          }
        };
      if (Ye(t2.value))
        return {
          unaryFilter: {
            field: sr(t2.field),
            op: "IS_NOT_NULL"
          }
        };
    }
    return {
      fieldFilter: {
        field: sr(t2.field),
        op: er(t2.op),
        value: t2.value
      }
    };
  }(t) : t instanceof gn ? function(t2) {
    const e = t2.getFilters().map((t3) => rr(t3));
    if (1 === e.length)
      return e[0];
    return {
      compositeFilter: {
        op: nr(t2.op),
        filters: e
      }
    };
  }(t) : O();
}
function or(t) {
  const e = [];
  return t.fields.forEach((t2) => e.push(t2.canonicalString())), {
    fieldPaths: e
  };
}
function ur(t) {
  return t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class cr {
  constructor(t, e, n, s, i = rt.min(), r2 = rt.min(), o = Ve.EMPTY_BYTE_STRING, u = null) {
    this.target = t, this.targetId = e, this.purpose = n, this.sequenceNumber = s, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = r2, this.resumeToken = o, this.expectedCount = u;
  }
  /** Creates a new target data instance with an updated sequence number. */
  withSequenceNumber(t) {
    return new cr(this.target, this.targetId, this.purpose, t, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
  }
  /**
   * Creates a new target data instance with an updated resume token and
   * snapshot version.
   */
  withResumeToken(t, e) {
    return new cr(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      e,
      this.lastLimboFreeSnapshotVersion,
      t,
      /* expectedCount= */
      null
    );
  }
  /**
   * Creates a new target data instance with an updated expected count.
   */
  withExpectedCount(t) {
    return new cr(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, t);
  }
  /**
   * Creates a new target data instance with an updated last limbo free
   * snapshot version number.
   */
  withLastLimboFreeSnapshotVersion(t) {
    return new cr(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t, this.resumeToken, this.expectedCount);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ar {
  constructor(t) {
    this.fe = t;
  }
}
function yr(t) {
  const e = Yi({
    parent: t.parent,
    structuredQuery: t.structuredQuery
  });
  return "LAST" === t.limitType ? Xn(
    e,
    e.limit,
    "L"
    /* LimitType.Last */
  ) : e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class zr {
  constructor() {
    this.rn = new Wr();
  }
  addToCollectionParentIndex(t, e) {
    return this.rn.add(e), Rt.resolve();
  }
  getCollectionParents(t, e) {
    return Rt.resolve(this.rn.getEntries(e));
  }
  addFieldIndex(t, e) {
    return Rt.resolve();
  }
  deleteFieldIndex(t, e) {
    return Rt.resolve();
  }
  getDocumentsMatchingTarget(t, e) {
    return Rt.resolve(null);
  }
  getIndexType(t, e) {
    return Rt.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(t, e) {
    return Rt.resolve([]);
  }
  getNextCollectionGroupToUpdate(t) {
    return Rt.resolve(null);
  }
  getMinOffset(t, e) {
    return Rt.resolve(It.min());
  }
  getMinOffsetFromCollectionGroup(t, e) {
    return Rt.resolve(It.min());
  }
  updateCollectionGroup(t, e, n) {
    return Rt.resolve();
  }
  updateIndexEntries(t, e) {
    return Rt.resolve();
  }
}
class Wr {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(t) {
    const e = t.lastSegment(), n = t.popLast(), s = this.index[e] || new Ee(ut.comparator), i = !s.has(n);
    return this.index[e] = s.add(n), i;
  }
  has(t) {
    const e = t.lastSegment(), n = t.popLast(), s = this.index[e];
    return s && s.has(n);
  }
  getEntries(t) {
    return (this.index[t] || new Ee(ut.comparator)).toArray();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class lo {
  constructor(t) {
    this.Nn = t;
  }
  next() {
    return this.Nn += 2, this.Nn;
  }
  static kn() {
    return new lo(0);
  }
  static Mn() {
    return new lo(-1);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class vo {
  constructor() {
    this.changes = new os((t) => t.toString(), (t, e) => t.isEqual(e)), this.changesApplied = false;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(t) {
    this.assertNotApplied(), this.changes.set(t.key, t);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(t, e) {
    this.assertNotApplied(), this.changes.set(t, an.newInvalidDocument(t).setReadTime(e));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(t, e) {
    this.assertNotApplied();
    const n = this.changes.get(e);
    return void 0 !== n ? Rt.resolve(n) : this.getFromCache(t, e);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(t, e) {
    return this.getAllFromCache(t, e);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(t) {
    return this.assertNotApplied(), this.changesApplied = true, this.applyChanges(t);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class No {
  constructor(t, e) {
    this.overlayedDocument = t, this.mutatedFields = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ko {
  constructor(t, e, n, s) {
    this.remoteDocumentCache = t, this.mutationQueue = e, this.documentOverlayCache = n, this.indexManager = s;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(t, e) {
    let n = null;
    return this.documentOverlayCache.getOverlay(t, e).next((s) => (n = s, this.remoteDocumentCache.getEntry(t, e))).next((t2) => (null !== n && Ks(n.mutation, t2, Re.empty(), it.now()), t2));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(t, e) {
    return this.remoteDocumentCache.getEntries(t, e).next((e2) => this.getLocalViewOfDocuments(t, e2, gs()).next(() => e2));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(t, e, n = gs()) {
    const s = fs();
    return this.populateOverlays(t, s, e).next(() => this.computeViews(t, e, s, n).next((t2) => {
      let e2 = hs();
      return t2.forEach((t3, n2) => {
        e2 = e2.insert(t3, n2.overlayedDocument);
      }), e2;
    }));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(t, e) {
    const n = fs();
    return this.populateOverlays(t, n, e).next(() => this.computeViews(t, e, n, gs()));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(t, e, n) {
    const s = [];
    return n.forEach((t2) => {
      e.has(t2) || s.push(t2);
    }), this.documentOverlayCache.getOverlays(t, s).next((t2) => {
      t2.forEach((t3, n2) => {
        e.set(t3, n2);
      });
    });
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @return A map represents the local documents view.
   */
  computeViews(t, e, n, s) {
    let i = cs();
    const r2 = ws(), o = ws();
    return e.forEach((t2, e2) => {
      const o2 = n.get(e2.key);
      s.has(e2.key) && (void 0 === o2 || o2.mutation instanceof zs) ? i = i.insert(e2.key, e2) : void 0 !== o2 ? (r2.set(e2.key, o2.mutation.getFieldMask()), Ks(o2.mutation, e2, o2.mutation.getFieldMask(), it.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        r2.set(e2.key, Re.empty())
      );
    }), this.recalculateAndSaveOverlays(t, i).next((t2) => (t2.forEach((t3, e2) => r2.set(t3, e2)), e.forEach((t3, e2) => {
      var n2;
      return o.set(t3, new No(e2, null !== (n2 = r2.get(t3)) && void 0 !== n2 ? n2 : null));
    }), o));
  }
  recalculateAndSaveOverlays(t, e) {
    const n = ws();
    let s = new pe((t2, e2) => t2 - e2), i = gs();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t, e).next((t2) => {
      for (const i2 of t2)
        i2.keys().forEach((t3) => {
          const r2 = e.get(t3);
          if (null === r2)
            return;
          let o = n.get(t3) || Re.empty();
          o = i2.applyToLocalView(r2, o), n.set(t3, o);
          const u = (s.get(i2.batchId) || gs()).add(t3);
          s = s.insert(i2.batchId, u);
        });
    }).next(() => {
      const r2 = [], o = s.getReverseIterator();
      for (; o.hasNext(); ) {
        const s2 = o.getNext(), u = s2.key, c = s2.value, a = ds();
        c.forEach((t2) => {
          if (!i.has(t2)) {
            const s3 = qs(e.get(t2), n.get(t2));
            null !== s3 && a.set(t2, s3), i = i.add(t2);
          }
        }), r2.push(this.documentOverlayCache.saveOverlays(t, u, a));
      }
      return Rt.waitFor(r2);
    }).next(() => n);
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(t, e) {
    return this.remoteDocumentCache.getEntries(t, e).next((e2) => this.recalculateAndSaveOverlays(t, e2));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   */
  getDocumentsMatchingQuery(t, e, n) {
    return function(t2) {
      return ht.isDocumentKey(t2.path) && null === t2.collectionGroup && 0 === t2.filters.length;
    }(e) ? this.getDocumentsMatchingDocumentQuery(t, e.path) : Wn(e) ? this.getDocumentsMatchingCollectionGroupQuery(t, e, n) : this.getDocumentsMatchingCollectionQuery(t, e, n);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup The collection group for the documents.
   * @param offset The offset to index into.
   * @param count The number of documents to return
   * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(t, e, n, s) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(t, e, n, s).next((i) => {
      const r2 = s - i.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(t, e, n.largestBatchId, s - i.size) : Rt.resolve(fs());
      let o = -1, u = i;
      return r2.next((e2) => Rt.forEach(e2, (e3, n2) => (o < n2.largestBatchId && (o = n2.largestBatchId), i.get(e3) ? Rt.resolve() : this.remoteDocumentCache.getEntry(t, e3).next((t2) => {
        u = u.insert(e3, t2);
      }))).next(() => this.populateOverlays(t, e2, i)).next(() => this.computeViews(t, u, e2, gs())).next((t2) => ({
        batchId: o,
        changes: ls(t2)
      })));
    });
  }
  getDocumentsMatchingDocumentQuery(t, e) {
    return this.getDocument(t, new ht(e)).next((t2) => {
      let e2 = hs();
      return t2.isFoundDocument() && (e2 = e2.insert(t2.key, t2)), e2;
    });
  }
  getDocumentsMatchingCollectionGroupQuery(t, e, n) {
    const s = e.collectionGroup;
    let i = hs();
    return this.indexManager.getCollectionParents(t, s).next((r2) => Rt.forEach(r2, (r3) => {
      const o = function(t2, e2) {
        return new Un(
          e2,
          /*collectionGroup=*/
          null,
          t2.explicitOrderBy.slice(),
          t2.filters.slice(),
          t2.limit,
          t2.limitType,
          t2.startAt,
          t2.endAt
        );
      }(e, r3.child(s));
      return this.getDocumentsMatchingCollectionQuery(t, o, n).next((t2) => {
        t2.forEach((t3, e2) => {
          i = i.insert(t3, e2);
        });
      });
    }).next(() => i));
  }
  getDocumentsMatchingCollectionQuery(t, e, n) {
    let s;
    return this.documentOverlayCache.getOverlaysForCollection(t, e.path, n.largestBatchId).next((i) => (s = i, this.remoteDocumentCache.getDocumentsMatchingQuery(t, e, n, s))).next((t2) => {
      s.forEach((e2, n3) => {
        const s2 = n3.getKey();
        null === t2.get(s2) && (t2 = t2.insert(s2, an.newInvalidDocument(s2)));
      });
      let n2 = hs();
      return t2.forEach((t3, i) => {
        const r2 = s.get(t3);
        void 0 !== r2 && Ks(r2.mutation, i, Re.empty(), it.now()), // Finally, insert the documents that still match the query
        ns(e, i) && (n2 = n2.insert(t3, i));
      }), n2;
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Mo {
  constructor(t) {
    this.serializer = t, this.cs = /* @__PURE__ */ new Map(), this.hs = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(t, e) {
    return Rt.resolve(this.cs.get(e));
  }
  saveBundleMetadata(t, e) {
    var n;
    return this.cs.set(e.id, {
      id: (n = e).id,
      version: n.version,
      createTime: Ni(n.createTime)
    }), Rt.resolve();
  }
  getNamedQuery(t, e) {
    return Rt.resolve(this.hs.get(e));
  }
  saveNamedQuery(t, e) {
    return this.hs.set(e.name, function(t2) {
      return {
        name: t2.name,
        query: yr(t2.bundledQuery),
        readTime: Ni(t2.readTime)
      };
    }(e)), Rt.resolve();
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $o {
  constructor() {
    this.overlays = new pe(ht.comparator), this.ls = /* @__PURE__ */ new Map();
  }
  getOverlay(t, e) {
    return Rt.resolve(this.overlays.get(e));
  }
  getOverlays(t, e) {
    const n = fs();
    return Rt.forEach(e, (e2) => this.getOverlay(t, e2).next((t2) => {
      null !== t2 && n.set(e2, t2);
    })).next(() => n);
  }
  saveOverlays(t, e, n) {
    return n.forEach((n2, s) => {
      this.we(t, e, s);
    }), Rt.resolve();
  }
  removeOverlaysForBatchId(t, e, n) {
    const s = this.ls.get(n);
    return void 0 !== s && (s.forEach((t2) => this.overlays = this.overlays.remove(t2)), this.ls.delete(n)), Rt.resolve();
  }
  getOverlaysForCollection(t, e, n) {
    const s = fs(), i = e.length + 1, r2 = new ht(e.child("")), o = this.overlays.getIteratorFrom(r2);
    for (; o.hasNext(); ) {
      const t2 = o.getNext().value, r3 = t2.getKey();
      if (!e.isPrefixOf(r3.path))
        break;
      r3.path.length === i && (t2.largestBatchId > n && s.set(t2.getKey(), t2));
    }
    return Rt.resolve(s);
  }
  getOverlaysForCollectionGroup(t, e, n, s) {
    let i = new pe((t2, e2) => t2 - e2);
    const r2 = this.overlays.getIterator();
    for (; r2.hasNext(); ) {
      const t2 = r2.getNext().value;
      if (t2.getKey().getCollectionGroup() === e && t2.largestBatchId > n) {
        let e2 = i.get(t2.largestBatchId);
        null === e2 && (e2 = fs(), i = i.insert(t2.largestBatchId, e2)), e2.set(t2.getKey(), t2);
      }
    }
    const o = fs(), u = i.getIterator();
    for (; u.hasNext(); ) {
      if (u.getNext().value.forEach((t2, e2) => o.set(t2, e2)), o.size() >= s)
        break;
    }
    return Rt.resolve(o);
  }
  we(t, e, n) {
    const s = this.overlays.get(n.key);
    if (null !== s) {
      const t2 = this.ls.get(s.largestBatchId).delete(n.key);
      this.ls.set(s.largestBatchId, t2);
    }
    this.overlays = this.overlays.insert(n.key, new ei(e, n));
    let i = this.ls.get(e);
    void 0 === i && (i = gs(), this.ls.set(e, i)), this.ls.set(e, i.add(n.key));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Oo {
  constructor() {
    this.fs = new Ee(Fo.ds), // A set of outstanding references to a document sorted by target id.
    this.ws = new Ee(Fo._s);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.fs.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(t, e) {
    const n = new Fo(t, e);
    this.fs = this.fs.add(n), this.ws = this.ws.add(n);
  }
  /** Add references to the given document keys for the given ID. */
  gs(t, e) {
    t.forEach((t2) => this.addReference(t2, e));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(t, e) {
    this.ys(new Fo(t, e));
  }
  ps(t, e) {
    t.forEach((t2) => this.removeReference(t2, e));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  Is(t) {
    const e = new ht(new ut([])), n = new Fo(e, t), s = new Fo(e, t + 1), i = [];
    return this.ws.forEachInRange([n, s], (t2) => {
      this.ys(t2), i.push(t2.key);
    }), i;
  }
  Ts() {
    this.fs.forEach((t) => this.ys(t));
  }
  ys(t) {
    this.fs = this.fs.delete(t), this.ws = this.ws.delete(t);
  }
  Es(t) {
    const e = new ht(new ut([])), n = new Fo(e, t), s = new Fo(e, t + 1);
    let i = gs();
    return this.ws.forEachInRange([n, s], (t2) => {
      i = i.add(t2.key);
    }), i;
  }
  containsKey(t) {
    const e = new Fo(t, 0), n = this.fs.firstAfterOrEqual(e);
    return null !== n && t.isEqual(n.key);
  }
}
class Fo {
  constructor(t, e) {
    this.key = t, this.As = e;
  }
  /** Compare by key then by ID */
  static ds(t, e) {
    return ht.comparator(t.key, e.key) || et(t.As, e.As);
  }
  /** Compare by ID then by key */
  static _s(t, e) {
    return et(t.As, e.As) || ht.comparator(t.key, e.key);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bo {
  constructor(t, e) {
    this.indexManager = t, this.referenceDelegate = e, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.vs = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.Rs = new Ee(Fo.ds);
  }
  checkEmpty(t) {
    return Rt.resolve(0 === this.mutationQueue.length);
  }
  addMutationBatch(t, e, n, s) {
    const i = this.vs;
    this.vs++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const r2 = new Zs(i, e, n, s);
    this.mutationQueue.push(r2);
    for (const e2 of s)
      this.Rs = this.Rs.add(new Fo(e2.key, i)), this.indexManager.addToCollectionParentIndex(t, e2.key.path.popLast());
    return Rt.resolve(r2);
  }
  lookupMutationBatch(t, e) {
    return Rt.resolve(this.Ps(e));
  }
  getNextMutationBatchAfterBatchId(t, e) {
    const n = e + 1, s = this.bs(n), i = s < 0 ? 0 : s;
    return Rt.resolve(this.mutationQueue.length > i ? this.mutationQueue[i] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return Rt.resolve(0 === this.mutationQueue.length ? -1 : this.vs - 1);
  }
  getAllMutationBatches(t) {
    return Rt.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(t, e) {
    const n = new Fo(e, 0), s = new Fo(e, Number.POSITIVE_INFINITY), i = [];
    return this.Rs.forEachInRange([n, s], (t2) => {
      const e2 = this.Ps(t2.As);
      i.push(e2);
    }), Rt.resolve(i);
  }
  getAllMutationBatchesAffectingDocumentKeys(t, e) {
    let n = new Ee(et);
    return e.forEach((t2) => {
      const e2 = new Fo(t2, 0), s = new Fo(t2, Number.POSITIVE_INFINITY);
      this.Rs.forEachInRange([e2, s], (t3) => {
        n = n.add(t3.As);
      });
    }), Rt.resolve(this.Vs(n));
  }
  getAllMutationBatchesAffectingQuery(t, e) {
    const n = e.path, s = n.length + 1;
    let i = n;
    ht.isDocumentKey(i) || (i = i.child(""));
    const r2 = new Fo(new ht(i), 0);
    let o = new Ee(et);
    return this.Rs.forEachWhile((t2) => {
      const e2 = t2.key.path;
      return !!n.isPrefixOf(e2) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (e2.length === s && (o = o.add(t2.As)), true);
    }, r2), Rt.resolve(this.Vs(o));
  }
  Vs(t) {
    const e = [];
    return t.forEach((t2) => {
      const n = this.Ps(t2);
      null !== n && e.push(n);
    }), e;
  }
  removeMutationBatch(t, e) {
    F(0 === this.Ss(e.batchId, "removed")), this.mutationQueue.shift();
    let n = this.Rs;
    return Rt.forEach(e.mutations, (s) => {
      const i = new Fo(s.key, e.batchId);
      return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(t, s.key);
    }).next(() => {
      this.Rs = n;
    });
  }
  Cn(t) {
  }
  containsKey(t, e) {
    const n = new Fo(e, 0), s = this.Rs.firstAfterOrEqual(n);
    return Rt.resolve(e.isEqual(s && s.key));
  }
  performConsistencyCheck(t) {
    return this.mutationQueue.length, Rt.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  Ss(t, e) {
    return this.bs(t);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been remvoed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  bs(t) {
    if (0 === this.mutationQueue.length)
      return 0;
    return t - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficent.
   */
  Ps(t) {
    const e = this.bs(t);
    if (e < 0 || e >= this.mutationQueue.length)
      return null;
    return this.mutationQueue[e];
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Lo {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(t) {
    this.Ds = t, /** Underlying cache of documents and their read times. */
    this.docs = new pe(ht.comparator), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(t) {
    this.indexManager = t;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(t, e) {
    const n = e.key, s = this.docs.get(n), i = s ? s.size : 0, r2 = this.Ds(e);
    return this.docs = this.docs.insert(n, {
      document: e.mutableCopy(),
      size: r2
    }), this.size += r2 - i, this.indexManager.addToCollectionParentIndex(t, n.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(t) {
    const e = this.docs.get(t);
    e && (this.docs = this.docs.remove(t), this.size -= e.size);
  }
  getEntry(t, e) {
    const n = this.docs.get(e);
    return Rt.resolve(n ? n.document.mutableCopy() : an.newInvalidDocument(e));
  }
  getEntries(t, e) {
    let n = cs();
    return e.forEach((t2) => {
      const e2 = this.docs.get(t2);
      n = n.insert(t2, e2 ? e2.document.mutableCopy() : an.newInvalidDocument(t2));
    }), Rt.resolve(n);
  }
  getDocumentsMatchingQuery(t, e, n, s) {
    let i = cs();
    const r2 = e.path, o = new ht(r2.child("")), u = this.docs.getIteratorFrom(o);
    for (; u.hasNext(); ) {
      const { key: t2, value: { document: o2 } } = u.getNext();
      if (!r2.isPrefixOf(t2.path))
        break;
      t2.path.length > r2.length + 1 || (Tt(pt(o2), n) <= 0 || (s.has(o2.key) || ns(e, o2)) && (i = i.insert(o2.key, o2.mutableCopy())));
    }
    return Rt.resolve(i);
  }
  getAllFromCollectionGroup(t, e, n, s) {
    O();
  }
  Cs(t, e) {
    return Rt.forEach(this.docs, (t2) => e(t2));
  }
  newChangeBuffer(t) {
    return new qo(this);
  }
  getSize(t) {
    return Rt.resolve(this.size);
  }
}
class qo extends vo {
  constructor(t) {
    super(), this.os = t;
  }
  applyChanges(t) {
    const e = [];
    return this.changes.forEach((n, s) => {
      s.isValidDocument() ? e.push(this.os.addEntry(t, s)) : this.os.removeEntry(n);
    }), Rt.waitFor(e);
  }
  getFromCache(t, e) {
    return this.os.getEntry(t, e);
  }
  getAllFromCache(t, e) {
    return this.os.getEntries(t, e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Uo {
  constructor(t) {
    this.persistence = t, /**
     * Maps a target to the data about that target
     */
    this.xs = new os((t2) => $n(t2), On), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = rt.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.Ns = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this.ks = new Oo(), this.targetCount = 0, this.Ms = lo.kn();
  }
  forEachTarget(t, e) {
    return this.xs.forEach((t2, n) => e(n)), Rt.resolve();
  }
  getLastRemoteSnapshotVersion(t) {
    return Rt.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(t) {
    return Rt.resolve(this.Ns);
  }
  allocateTargetId(t) {
    return this.highestTargetId = this.Ms.next(), Rt.resolve(this.highestTargetId);
  }
  setTargetsMetadata(t, e, n) {
    return n && (this.lastRemoteSnapshotVersion = n), e > this.Ns && (this.Ns = e), Rt.resolve();
  }
  Fn(t) {
    this.xs.set(t.target, t);
    const e = t.targetId;
    e > this.highestTargetId && (this.Ms = new lo(e), this.highestTargetId = e), t.sequenceNumber > this.Ns && (this.Ns = t.sequenceNumber);
  }
  addTargetData(t, e) {
    return this.Fn(e), this.targetCount += 1, Rt.resolve();
  }
  updateTargetData(t, e) {
    return this.Fn(e), Rt.resolve();
  }
  removeTargetData(t, e) {
    return this.xs.delete(e.target), this.ks.Is(e.targetId), this.targetCount -= 1, Rt.resolve();
  }
  removeTargets(t, e, n) {
    let s = 0;
    const i = [];
    return this.xs.forEach((r2, o) => {
      o.sequenceNumber <= e && null === n.get(o.targetId) && (this.xs.delete(r2), i.push(this.removeMatchingKeysForTargetId(t, o.targetId)), s++);
    }), Rt.waitFor(i).next(() => s);
  }
  getTargetCount(t) {
    return Rt.resolve(this.targetCount);
  }
  getTargetData(t, e) {
    const n = this.xs.get(e) || null;
    return Rt.resolve(n);
  }
  addMatchingKeys(t, e, n) {
    return this.ks.gs(e, n), Rt.resolve();
  }
  removeMatchingKeys(t, e, n) {
    this.ks.ps(e, n);
    const s = this.persistence.referenceDelegate, i = [];
    return s && e.forEach((e2) => {
      i.push(s.markPotentiallyOrphaned(t, e2));
    }), Rt.waitFor(i);
  }
  removeMatchingKeysForTargetId(t, e) {
    return this.ks.Is(e), Rt.resolve();
  }
  getMatchingKeysForTargetId(t, e) {
    const n = this.ks.Es(e);
    return Rt.resolve(n);
  }
  containsKey(t, e) {
    return Rt.resolve(this.ks.containsKey(e));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ko {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(t, e) {
    this.$s = {}, this.overlays = {}, this.Os = new Ot(0), this.Fs = false, this.Fs = true, this.referenceDelegate = t(this), this.Bs = new Uo(this);
    this.indexManager = new zr(), this.remoteDocumentCache = function(t2) {
      return new Lo(t2);
    }((t2) => this.referenceDelegate.Ls(t2)), this.serializer = new ar(e), this.qs = new Mo(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.Fs = false, Promise.resolve();
  }
  get started() {
    return this.Fs;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(t) {
    return this.indexManager;
  }
  getDocumentOverlayCache(t) {
    let e = this.overlays[t.toKey()];
    return e || (e = new $o(), this.overlays[t.toKey()] = e), e;
  }
  getMutationQueue(t, e) {
    let n = this.$s[t.toKey()];
    return n || (n = new Bo(e, this.referenceDelegate), this.$s[t.toKey()] = n), n;
  }
  getTargetCache() {
    return this.Bs;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.qs;
  }
  runTransaction(t, e, n) {
    N("MemoryPersistence", "Starting transaction:", t);
    const s = new Go(this.Os.next());
    return this.referenceDelegate.Us(), n(s).next((t2) => this.referenceDelegate.Ks(s).next(() => t2)).toPromise().then((t2) => (s.raiseOnCommittedEvent(), t2));
  }
  Gs(t, e) {
    return Rt.or(Object.values(this.$s).map((n) => () => n.containsKey(t, e)));
  }
}
class Go extends At {
  constructor(t) {
    super(), this.currentSequenceNumber = t;
  }
}
class Qo {
  constructor(t) {
    this.persistence = t, /** Tracks all documents that are active in Query views. */
    this.Qs = new Oo(), /** The list of documents that are potentially GCed after each transaction. */
    this.js = null;
  }
  static zs(t) {
    return new Qo(t);
  }
  get Ws() {
    if (this.js)
      return this.js;
    throw O();
  }
  addReference(t, e, n) {
    return this.Qs.addReference(n, e), this.Ws.delete(n.toString()), Rt.resolve();
  }
  removeReference(t, e, n) {
    return this.Qs.removeReference(n, e), this.Ws.add(n.toString()), Rt.resolve();
  }
  markPotentiallyOrphaned(t, e) {
    return this.Ws.add(e.toString()), Rt.resolve();
  }
  removeTarget(t, e) {
    this.Qs.Is(e.targetId).forEach((t2) => this.Ws.add(t2.toString()));
    const n = this.persistence.getTargetCache();
    return n.getMatchingKeysForTargetId(t, e.targetId).next((t2) => {
      t2.forEach((t3) => this.Ws.add(t3.toString()));
    }).next(() => n.removeTargetData(t, e));
  }
  Us() {
    this.js = /* @__PURE__ */ new Set();
  }
  Ks(t) {
    const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return Rt.forEach(this.Ws, (n) => {
      const s = ht.fromPath(n);
      return this.Hs(t, s).next((t2) => {
        t2 || e.removeEntry(s, rt.min());
      });
    }).next(() => (this.js = null, e.apply(t)));
  }
  updateLimboDocument(t, e) {
    return this.Hs(t, e).next((t2) => {
      t2 ? this.Ws.delete(e.toString()) : this.Ws.add(e.toString());
    });
  }
  Ls(t) {
    return 0;
  }
  Hs(t, e) {
    return Rt.or([() => Rt.resolve(this.Qs.containsKey(e)), () => this.persistence.getTargetCache().containsKey(t, e), () => this.persistence.Gs(t, e)]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tu {
  constructor(t, e, n, s) {
    this.targetId = t, this.fromCache = e, this.Fi = n, this.Bi = s;
  }
  static Li(t, e) {
    let n = gs(), s = gs();
    for (const t2 of e.docChanges)
      switch (t2.type) {
        case 0:
          n = n.add(t2.doc.key);
          break;
        case 1:
          s = s.add(t2.doc.key);
      }
    return new tu(t, e.fromCache, n, s);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class eu {
  constructor() {
    this.qi = false;
  }
  /** Sets the document view to query against. */
  initialize(t, e) {
    this.Ui = t, this.indexManager = e, this.qi = true;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(t, e, n, s) {
    return this.Ki(t, e).next((i) => i || this.Gi(t, e, s, n)).next((n2) => n2 || this.Qi(t, e));
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  Ki(t, e) {
    if (Qn(e))
      return Rt.resolve(null);
    let n = Jn(e);
    return this.indexManager.getIndexType(t, n).next((s) => 0 === s ? null : (null !== e.limit && 1 === s && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (e = Xn(
      e,
      null,
      "F"
      /* LimitType.First */
    ), n = Jn(e)), this.indexManager.getDocumentsMatchingTarget(t, n).next((s2) => {
      const i = gs(...s2);
      return this.Ui.getDocuments(t, i).next((s3) => this.indexManager.getMinOffset(t, n).next((n2) => {
        const r2 = this.ji(e, s3);
        return this.zi(e, r2, i, n2.readTime) ? this.Ki(t, Xn(
          e,
          null,
          "F"
          /* LimitType.First */
        )) : this.Wi(t, r2, e, n2);
      }));
    })));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  Gi(t, e, n, s) {
    return Qn(e) || s.isEqual(rt.min()) ? this.Qi(t, e) : this.Ui.getDocuments(t, n).next((i) => {
      const r2 = this.ji(e, i);
      return this.zi(e, r2, n, s) ? this.Qi(t, e) : (C() <= LogLevel.DEBUG && N("QueryEngine", "Re-using previous result from %s to execute query: %s", s.toString(), es(e)), this.Wi(t, r2, e, yt(s, -1)));
    });
  }
  /** Applies the query filter and sorting to the provided documents.  */
  ji(t, e) {
    let n = new Ee(is(t));
    return e.forEach((e2, s) => {
      ns(t, s) && (n = n.add(s));
    }), n;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  zi(t, e, n, s) {
    if (null === t.limit)
      return false;
    if (n.size !== e.size)
      return true;
    const i = "F" === t.limitType ? e.last() : e.first();
    return !!i && (i.hasPendingWrites || i.version.compareTo(s) > 0);
  }
  Qi(t, e) {
    return C() <= LogLevel.DEBUG && N("QueryEngine", "Using full collection scan to execute query:", es(e)), this.Ui.getDocumentsMatchingQuery(t, e, It.min());
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  Wi(t, e, n, s) {
    return this.Ui.getDocumentsMatchingQuery(t, n, s).next((t2) => (
      // Merge with existing results
      (e.forEach((e2) => {
        t2 = t2.insert(e2.key, e2);
      }), t2)
    ));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class nu {
  constructor(t, e, n, s) {
    this.persistence = t, this.Hi = e, this.serializer = s, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.Ji = new pe(et), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this.Yi = new os((t2) => $n(t2), On), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.Xi = /* @__PURE__ */ new Map(), this.Zi = t.getRemoteDocumentCache(), this.Bs = t.getTargetCache(), this.qs = t.getBundleCache(), this.tr(n);
  }
  tr(t) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(t), this.indexManager = this.persistence.getIndexManager(t), this.mutationQueue = this.persistence.getMutationQueue(t, this.indexManager), this.localDocuments = new ko(this.Zi, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.Zi.setIndexManager(this.indexManager), this.Hi.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(t) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (e) => t.collect(e, this.Ji));
  }
}
function su(t, e, n, s) {
  return new nu(t, e, n, s);
}
async function iu(t, e) {
  const n = L(t);
  return await n.persistence.runTransaction("Handle user change", "readonly", (t2) => {
    let s;
    return n.mutationQueue.getAllMutationBatches(t2).next((i) => (s = i, n.tr(e), n.mutationQueue.getAllMutationBatches(t2))).next((e2) => {
      const i = [], r2 = [];
      let o = gs();
      for (const t3 of s) {
        i.push(t3.batchId);
        for (const e3 of t3.mutations)
          o = o.add(e3.key);
      }
      for (const t3 of e2) {
        r2.push(t3.batchId);
        for (const e3 of t3.mutations)
          o = o.add(e3.key);
      }
      return n.localDocuments.getDocuments(t2, o).next((t3) => ({
        er: t3,
        removedBatchIds: i,
        addedBatchIds: r2
      }));
    });
  });
}
function ru(t, e) {
  const n = L(t);
  return n.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (t2) => {
    const s = e.batch.keys(), i = n.Zi.newChangeBuffer({
      trackRemovals: true
    });
    return function(t3, e2, n2, s2) {
      const i2 = n2.batch, r2 = i2.keys();
      let o = Rt.resolve();
      return r2.forEach((t4) => {
        o = o.next(() => s2.getEntry(e2, t4)).next((e3) => {
          const r3 = n2.docVersions.get(t4);
          F(null !== r3), e3.version.compareTo(r3) < 0 && (i2.applyToRemoteDocument(e3, n2), e3.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (e3.setReadTime(n2.commitVersion), s2.addEntry(e3)));
        });
      }), o.next(() => t3.mutationQueue.removeMutationBatch(e2, i2));
    }(n, t2, e, i).next(() => i.apply(t2)).next(() => n.mutationQueue.performConsistencyCheck(t2)).next(() => n.documentOverlayCache.removeOverlaysForBatchId(t2, s, e.batch.batchId)).next(() => n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t2, function(t3) {
      let e2 = gs();
      for (let n2 = 0; n2 < t3.mutationResults.length; ++n2) {
        t3.mutationResults[n2].transformResults.length > 0 && (e2 = e2.add(t3.batch.mutations[n2].key));
      }
      return e2;
    }(e))).next(() => n.localDocuments.getDocuments(t2, s));
  });
}
function ou(t) {
  const e = L(t);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t2) => e.Bs.getLastRemoteSnapshotVersion(t2));
}
function uu(t, e) {
  const n = L(t), s = e.snapshotVersion;
  let i = n.Ji;
  return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (t2) => {
    const r2 = n.Zi.newChangeBuffer({
      trackRemovals: true
    });
    i = n.Ji;
    const o = [];
    e.targetChanges.forEach((r3, u2) => {
      const c2 = i.get(u2);
      if (!c2)
        return;
      o.push(n.Bs.removeMatchingKeys(t2, r3.removedDocuments, u2).next(() => n.Bs.addMatchingKeys(t2, r3.addedDocuments, u2)));
      let a = c2.withSequenceNumber(t2.currentSequenceNumber);
      null !== e.targetMismatches.get(u2) ? a = a.withResumeToken(Ve.EMPTY_BYTE_STRING, rt.min()).withLastLimboFreeSnapshotVersion(rt.min()) : r3.resumeToken.approximateByteSize() > 0 && (a = a.withResumeToken(r3.resumeToken, s)), i = i.insert(u2, a), // Update the target data if there are target changes (or if
      // sufficient time has passed since the last update).
      /**
      * Returns true if the newTargetData should be persisted during an update of
      * an active target. TargetData should always be persisted when a target is
      * being released and should not call this function.
      *
      * While the target is active, TargetData updates can be omitted when nothing
      * about the target has changed except metadata like the resume token or
      * snapshot version. Occasionally it's worth the extra write to prevent these
      * values from getting too stale after a crash, but this doesn't have to be
      * too frequent.
      */
      function(t3, e2, n2) {
        if (0 === t3.resumeToken.approximateByteSize())
          return true;
        if (e2.snapshotVersion.toMicroseconds() - t3.snapshotVersion.toMicroseconds() >= 3e8)
          return true;
        return n2.addedDocuments.size + n2.modifiedDocuments.size + n2.removedDocuments.size > 0;
      }(c2, a, r3) && o.push(n.Bs.updateTargetData(t2, a));
    });
    let u = cs(), c = gs();
    if (e.documentUpdates.forEach((s2) => {
      e.resolvedLimboDocuments.has(s2) && o.push(n.persistence.referenceDelegate.updateLimboDocument(t2, s2));
    }), // Each loop iteration only affects its "own" doc, so it's safe to get all
    // the remote documents in advance in a single call.
    o.push(cu(t2, r2, e.documentUpdates).next((t3) => {
      u = t3.nr, c = t3.sr;
    })), !s.isEqual(rt.min())) {
      const e2 = n.Bs.getLastRemoteSnapshotVersion(t2).next((e3) => n.Bs.setTargetsMetadata(t2, t2.currentSequenceNumber, s));
      o.push(e2);
    }
    return Rt.waitFor(o).next(() => r2.apply(t2)).next(() => n.localDocuments.getLocalViewOfDocuments(t2, u, c)).next(() => u);
  }).then((t2) => (n.Ji = i, t2));
}
function cu(t, e, n) {
  let s = gs(), i = gs();
  return n.forEach((t2) => s = s.add(t2)), e.getEntries(t, s).next((t2) => {
    let s2 = cs();
    return n.forEach((n2, r2) => {
      const o = t2.get(n2);
      r2.isFoundDocument() !== o.isFoundDocument() && (i = i.add(n2)), // Note: The order of the steps below is important, since we want
      // to ensure that rejected limbo resolutions (which fabricate
      // NoDocuments with SnapshotVersion.min()) never add documents to
      // cache.
      r2.isNoDocument() && r2.version.isEqual(rt.min()) ? (
        // NoDocuments with SnapshotVersion.min() are used in manufactured
        // events. We remove these documents from cache since we lost
        // access.
        (e.removeEntry(n2, r2.readTime), s2 = s2.insert(n2, r2))
      ) : !o.isValidDocument() || r2.version.compareTo(o.version) > 0 || 0 === r2.version.compareTo(o.version) && o.hasPendingWrites ? (e.addEntry(r2), s2 = s2.insert(n2, r2)) : N("LocalStore", "Ignoring outdated watch update for ", n2, ". Current version:", o.version, " Watch version:", r2.version);
    }), {
      nr: s2,
      sr: i
    };
  });
}
function au(t, e) {
  const n = L(t);
  return n.persistence.runTransaction("Get next mutation batch", "readonly", (t2) => (void 0 === e && (e = -1), n.mutationQueue.getNextMutationBatchAfterBatchId(t2, e)));
}
function hu(t, e) {
  const n = L(t);
  return n.persistence.runTransaction("Allocate target", "readwrite", (t2) => {
    let s;
    return n.Bs.getTargetData(t2, e).next((i) => i ? (
      // This target has been listened to previously, so reuse the
      // previous targetID.
      // TODO(mcg): freshen last accessed date?
      (s = i, Rt.resolve(s))
    ) : n.Bs.allocateTargetId(t2).next((i2) => (s = new cr(e, i2, "TargetPurposeListen", t2.currentSequenceNumber), n.Bs.addTargetData(t2, s).next(() => s))));
  }).then((t2) => {
    const s = n.Ji.get(t2.targetId);
    return (null === s || t2.snapshotVersion.compareTo(s.snapshotVersion) > 0) && (n.Ji = n.Ji.insert(t2.targetId, t2), n.Yi.set(e, t2.targetId)), t2;
  });
}
async function lu(t, e, n) {
  const s = L(t), i = s.Ji.get(e), r2 = n ? "readwrite" : "readwrite-primary";
  try {
    n || await s.persistence.runTransaction("Release target", r2, (t2) => s.persistence.referenceDelegate.removeTarget(t2, i));
  } catch (t2) {
    if (!Dt(t2))
      throw t2;
    N("LocalStore", `Failed to update sequence numbers for target ${e}: ${t2}`);
  }
  s.Ji = s.Ji.remove(e), s.Yi.delete(i.target);
}
function fu(t, e, n) {
  const s = L(t);
  let i = rt.min(), r2 = gs();
  return s.persistence.runTransaction("Execute query", "readonly", (t2) => function(t3, e2, n2) {
    const s2 = L(t3), i2 = s2.Yi.get(n2);
    return void 0 !== i2 ? Rt.resolve(s2.Ji.get(i2)) : s2.Bs.getTargetData(e2, n2);
  }(s, t2, Jn(e)).next((e2) => {
    if (e2)
      return i = e2.lastLimboFreeSnapshotVersion, s.Bs.getMatchingKeysForTargetId(t2, e2.targetId).next((t3) => {
        r2 = t3;
      });
  }).next(() => s.Hi.getDocumentsMatchingQuery(t2, e, n ? i : rt.min(), n ? r2 : gs())).next((t3) => (_u(s, ss(e), t3), {
    documents: t3,
    ir: r2
  })));
}
function _u(t, e, n) {
  let s = t.Xi.get(e) || rt.min();
  n.forEach((t2, e2) => {
    e2.readTime.compareTo(s) > 0 && (s = e2.readTime);
  }), t.Xi.set(e, s);
}
class Ru {
  constructor() {
    this.activeTargetIds = ps();
  }
  lr(t) {
    this.activeTargetIds = this.activeTargetIds.add(t);
  }
  dr(t) {
    this.activeTargetIds = this.activeTargetIds.delete(t);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  hr() {
    const t = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(t);
  }
}
class bu {
  constructor() {
    this.Hr = new Ru(), this.Jr = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(t) {
  }
  updateMutationState(t, e, n) {
  }
  addLocalQueryTarget(t) {
    return this.Hr.lr(t), this.Jr[t] || "not-current";
  }
  updateQueryState(t, e, n) {
    this.Jr[t] = e;
  }
  removeLocalQueryTarget(t) {
    this.Hr.dr(t);
  }
  isLocalQueryTarget(t) {
    return this.Hr.activeTargetIds.has(t);
  }
  clearQueryState(t) {
    delete this.Jr[t];
  }
  getAllActiveQueryTargets() {
    return this.Hr.activeTargetIds;
  }
  isActiveQueryTarget(t) {
    return this.Hr.activeTargetIds.has(t);
  }
  start() {
    return this.Hr = new Ru(), Promise.resolve();
  }
  handleUserChange(t, e, n) {
  }
  setOnlineState(t) {
  }
  shutdown() {
  }
  writeSequenceNumber(t) {
  }
  notifyBundleLoaded(t) {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Vu {
  Yr(t) {
  }
  shutdown() {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Su {
  constructor() {
    this.Xr = () => this.Zr(), this.eo = () => this.no(), this.so = [], this.io();
  }
  Yr(t) {
    this.so.push(t);
  }
  shutdown() {
    window.removeEventListener("online", this.Xr), window.removeEventListener("offline", this.eo);
  }
  io() {
    window.addEventListener("online", this.Xr), window.addEventListener("offline", this.eo);
  }
  Zr() {
    N("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
    for (const t of this.so)
      t(
        0
        /* NetworkStatus.AVAILABLE */
      );
  }
  no() {
    N("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
    for (const t of this.so)
      t(
        1
        /* NetworkStatus.UNAVAILABLE */
      );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static D() {
    return "undefined" != typeof window && void 0 !== window.addEventListener && void 0 !== window.removeEventListener;
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let Du = null;
function Cu() {
  return null === Du ? Du = 268435456 + Math.round(2147483648 * Math.random()) : Du++, "0x" + Du.toString(16);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const xu = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery"
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Nu {
  constructor(t) {
    this.ro = t.ro, this.oo = t.oo;
  }
  uo(t) {
    this.co = t;
  }
  ao(t) {
    this.ho = t;
  }
  onMessage(t) {
    this.lo = t;
  }
  close() {
    this.oo();
  }
  send(t) {
    this.ro(t);
  }
  fo() {
    this.co();
  }
  wo(t) {
    this.ho(t);
  }
  _o(t) {
    this.lo(t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ku = "WebChannelConnection";
class Mu extends /**
 * Base class for all Rest-based connections to the backend (WebChannel and
 * HTTP).
 */
class {
  constructor(t) {
    this.databaseInfo = t, this.databaseId = t.databaseId;
    const e = t.ssl ? "https" : "http";
    this.mo = e + "://" + t.host, this.yo = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
  }
  get po() {
    return false;
  }
  Io(t, e, n, s, i) {
    const r2 = Cu(), o = this.To(t, e);
    N("RestConnection", `Sending RPC '${t}' ${r2}:`, o, n);
    const u = {};
    return this.Eo(u, s, i), this.Ao(t, o, u, n).then((e2) => (N("RestConnection", `Received RPC '${t}' ${r2}: `, e2), e2), (e2) => {
      throw M("RestConnection", `RPC '${t}' ${r2} failed with error: `, e2, "url: ", o, "request:", n), e2;
    });
  }
  vo(t, e, n, s, i, r2) {
    return this.Io(t, e, n, s, i);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  Eo(t, e, n) {
    t["X-Goog-Api-Client"] = "gl-js/ fire/" + S, // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), e && e.headers.forEach((e2, n2) => t[n2] = e2), n && n.headers.forEach((e2, n2) => t[n2] = e2);
  }
  To(t, e) {
    const n = xu[t];
    return `${this.mo}/v1/${e}:${n}`;
  }
} {
  constructor(t) {
    super(t), this.forceLongPolling = t.forceLongPolling, this.autoDetectLongPolling = t.autoDetectLongPolling, this.useFetchStreams = t.useFetchStreams, this.longPollingOptions = t.longPollingOptions;
  }
  Ao(t, e, n, s) {
    const i = Cu();
    return new Promise((r2, o) => {
      const u = new XhrIo();
      u.setWithCredentials(true), u.listenOnce(EventType.COMPLETE, () => {
        try {
          switch (u.getLastErrorCode()) {
            case ErrorCode.NO_ERROR:
              const e2 = u.getResponseJson();
              N(ku, `XHR for RPC '${t}' ${i} received:`, JSON.stringify(e2)), r2(e2);
              break;
            case ErrorCode.TIMEOUT:
              N(ku, `RPC '${t}' ${i} timed out`), o(new U(q.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case ErrorCode.HTTP_ERROR:
              const n2 = u.getStatus();
              if (N(ku, `RPC '${t}' ${i} failed with status:`, n2, "response text:", u.getResponseText()), n2 > 0) {
                let t2 = u.getResponseJson();
                Array.isArray(t2) && (t2 = t2[0]);
                const e3 = null == t2 ? void 0 : t2.error;
                if (e3 && e3.status && e3.message) {
                  const t3 = function(t4) {
                    const e4 = t4.toLowerCase().replace(/_/g, "-");
                    return Object.values(q).indexOf(e4) >= 0 ? e4 : q.UNKNOWN;
                  }(e3.status);
                  o(new U(t3, e3.message));
                } else
                  o(new U(q.UNKNOWN, "Server responded with status " + u.getStatus()));
              } else
                o(new U(q.UNAVAILABLE, "Connection failed."));
              break;
            default:
              O();
          }
        } finally {
          N(ku, `RPC '${t}' ${i} completed.`);
        }
      });
      const c = JSON.stringify(s);
      N(ku, `RPC '${t}' ${i} sending request:`, s), u.send(e, "POST", c, n, 15);
    });
  }
  Ro(t, e, n) {
    const s = Cu(), i = [this.mo, "/", "google.firestore.v1.Firestore", "/", t, "/channel"], r2 = createWebChannelTransport(), o = getStatEventTarget(), u = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: true,
      supportsCrossDomainXhr: true,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, c = this.longPollingOptions.timeoutSeconds;
    void 0 !== c && (u.longPollingTimeout = Math.round(1e3 * c)), this.useFetchStreams && (u.xmlHttpFactory = new FetchXmlHttpFactory({})), this.Eo(u.initMessageHeaders, e, n), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    u.encodeInitMessageHeaders = true;
    const a = i.join("");
    N(ku, `Creating RPC '${t}' stream ${s}: ${a}`, u);
    const h = r2.createWebChannel(a, u);
    let l2 = false, f = false;
    const d = new Nu({
      ro: (e2) => {
        f ? N(ku, `Not sending because RPC '${t}' stream ${s} is closed:`, e2) : (l2 || (N(ku, `Opening RPC '${t}' stream ${s} transport.`), h.open(), l2 = true), N(ku, `RPC '${t}' stream ${s} sending:`, e2), h.send(e2));
      },
      oo: () => h.close()
    }), w2 = (t2, e2, n2) => {
      t2.listen(e2, (t3) => {
        try {
          n2(t3);
        } catch (t4) {
          setTimeout(() => {
            throw t4;
          }, 0);
        }
      });
    };
    return w2(h, WebChannel.EventType.OPEN, () => {
      f || N(ku, `RPC '${t}' stream ${s} transport opened.`);
    }), w2(h, WebChannel.EventType.CLOSE, () => {
      f || (f = true, N(ku, `RPC '${t}' stream ${s} transport closed`), d.wo());
    }), w2(h, WebChannel.EventType.ERROR, (e2) => {
      f || (f = true, M(ku, `RPC '${t}' stream ${s} transport errored:`, e2), d.wo(new U(q.UNAVAILABLE, "The operation could not be completed")));
    }), w2(h, WebChannel.EventType.MESSAGE, (e2) => {
      var n2;
      if (!f) {
        const i2 = e2.data[0];
        F(!!i2);
        const r3 = i2, o2 = r3.error || (null === (n2 = r3[0]) || void 0 === n2 ? void 0 : n2.error);
        if (o2) {
          N(ku, `RPC '${t}' stream ${s} received error:`, o2);
          const e3 = o2.status;
          let n3 = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            function(t2) {
              const e4 = ii[t2];
              if (void 0 !== e4)
                return ui(e4);
            }(e3)
          ), i3 = o2.message;
          void 0 === n3 && (n3 = q.INTERNAL, i3 = "Unknown error status: " + e3 + " with message " + o2.message), // Mark closed so no further events are propagated
          f = true, d.wo(new U(n3, i3)), h.close();
        } else
          N(ku, `RPC '${t}' stream ${s} received:`, i2), d._o(i2);
      }
    }), w2(o, Event.STAT_EVENT, (e2) => {
      e2.stat === Stat.PROXY ? N(ku, `RPC '${t}' stream ${s} detected buffering proxy`) : e2.stat === Stat.NOPROXY && N(ku, `RPC '${t}' stream ${s} detected no buffering proxy`);
    }), setTimeout(() => {
      d.fo();
    }, 0), d;
  }
}
function Ou() {
  return "undefined" != typeof document ? document : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Fu(t) {
  return new Vi(
    t,
    /* useProto3Json= */
    true
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bu {
  constructor(t, e, n = 1e3, s = 1.5, i = 6e4) {
    this.ii = t, this.timerId = e, this.Po = n, this.bo = s, this.Vo = i, this.So = 0, this.Do = null, /** The last backoff attempt, as epoch milliseconds. */
    this.Co = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.So = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  xo() {
    this.So = this.Vo;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  No(t) {
    this.cancel();
    const e = Math.floor(this.So + this.ko()), n = Math.max(0, Date.now() - this.Co), s = Math.max(0, e - n);
    s > 0 && N("ExponentialBackoff", `Backing off for ${s} ms (base delay: ${this.So} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), this.Do = this.ii.enqueueAfterDelay(this.timerId, s, () => (this.Co = Date.now(), t())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.So *= this.bo, this.So < this.Po && (this.So = this.Po), this.So > this.Vo && (this.So = this.Vo);
  }
  Mo() {
    null !== this.Do && (this.Do.skipDelay(), this.Do = null);
  }
  cancel() {
    null !== this.Do && (this.Do.cancel(), this.Do = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  ko() {
    return (Math.random() - 0.5) * this.So;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Lu {
  constructor(t, e, n, s, i, r2, o, u) {
    this.ii = t, this.$o = n, this.Oo = s, this.connection = i, this.authCredentialsProvider = r2, this.appCheckCredentialsProvider = o, this.listener = u, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.Fo = 0, this.Bo = null, this.Lo = null, this.stream = null, this.qo = new Bu(t, e);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  Uo() {
    return 1 === this.state || 5 === this.state || this.Ko();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  Ko() {
    return 2 === this.state || 3 === this.state;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    4 !== this.state ? this.auth() : this.Go();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.Uo() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  Qo() {
    this.state = 0, this.qo.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  jo() {
    this.Ko() && null === this.Bo && (this.Bo = this.ii.enqueueAfterDelay(this.$o, 6e4, () => this.zo()));
  }
  /** Sends a message to the underlying stream. */
  Wo(t) {
    this.Ho(), this.stream.send(t);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async zo() {
    if (this.Ko())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  Ho() {
    this.Bo && (this.Bo.cancel(), this.Bo = null);
  }
  /** Cancels the health check delayed operation. */
  Jo() {
    this.Lo && (this.Lo.cancel(), this.Lo = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(t, e) {
    this.Ho(), this.Jo(), this.qo.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.Fo++, 4 !== t ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.qo.reset()
    ) : e && e.code === q.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (k(e.toString()), k("Using maximum backoff delay to prevent overloading the backend."), this.qo.xo())
    ) : e && e.code === q.UNAUTHENTICATED && 3 !== this.state && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    null !== this.stream && (this.Yo(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = t, // Notify the listener that the stream closed.
    await this.listener.ao(e);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  Yo() {
  }
  auth() {
    this.state = 1;
    const t = this.Xo(this.Fo), e = this.Fo;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then(([t2, n]) => {
      this.Fo === e && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.Zo(t2, n);
    }, (e2) => {
      t(() => {
        const t2 = new U(q.UNKNOWN, "Fetching auth token failed: " + e2.message);
        return this.tu(t2);
      });
    });
  }
  Zo(t, e) {
    const n = this.Xo(this.Fo);
    this.stream = this.eu(t, e), this.stream.uo(() => {
      n(() => (this.state = 2, this.Lo = this.ii.enqueueAfterDelay(this.Oo, 1e4, () => (this.Ko() && (this.state = 3), Promise.resolve())), this.listener.uo()));
    }), this.stream.ao((t2) => {
      n(() => this.tu(t2));
    }), this.stream.onMessage((t2) => {
      n(() => this.onMessage(t2));
    });
  }
  Go() {
    this.state = 5, this.qo.No(async () => {
      this.state = 0, this.start();
    });
  }
  // Visible for tests
  tu(t) {
    return N("PersistentStream", `close with error: ${t}`), this.stream = null, this.close(4, t);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  Xo(t) {
    return (e) => {
      this.ii.enqueueAndForget(() => this.Fo === t ? e() : (N("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
}
class qu extends Lu {
  constructor(t, e, n, s, i, r2) {
    super(t, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", e, n, s, r2), this.serializer = i;
  }
  eu(t, e) {
    return this.connection.Ro("Listen", t, e);
  }
  onMessage(t) {
    this.qo.reset();
    const e = Qi(this.serializer, t), n = function(t2) {
      if (!("targetChange" in t2))
        return rt.min();
      const e2 = t2.targetChange;
      return e2.targetIds && e2.targetIds.length ? rt.min() : e2.readTime ? Ni(e2.readTime) : rt.min();
    }(t);
    return this.listener.nu(e, n);
  }
  /**
   * Registers interest in the results of the given target. If the target
   * includes a resumeToken it will be included in the request. Results that
   * affect the target will be streamed back as WatchChange messages that
   * reference the targetId.
   */
  su(t) {
    const e = {};
    e.database = Li(this.serializer), e.addTarget = function(t2, e2) {
      let n2;
      const s = e2.target;
      if (n2 = Fn(s) ? {
        documents: Hi(t2, s)
      } : {
        query: Ji(t2, s)
      }, n2.targetId = e2.targetId, e2.resumeToken.approximateByteSize() > 0) {
        n2.resumeToken = Ci(t2, e2.resumeToken);
        const s2 = Si(t2, e2.expectedCount);
        null !== s2 && (n2.expectedCount = s2);
      } else if (e2.snapshotVersion.compareTo(rt.min()) > 0) {
        n2.readTime = Di(t2, e2.snapshotVersion.toTimestamp());
        const s2 = Si(t2, e2.expectedCount);
        null !== s2 && (n2.expectedCount = s2);
      }
      return n2;
    }(this.serializer, t);
    const n = Xi(this.serializer, t);
    n && (e.labels = n), this.Wo(e);
  }
  /**
   * Unregisters interest in the results of the target associated with the
   * given targetId.
   */
  iu(t) {
    const e = {};
    e.database = Li(this.serializer), e.removeTarget = t, this.Wo(e);
  }
}
class Uu extends Lu {
  constructor(t, e, n, s, i, r2) {
    super(t, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", e, n, s, r2), this.serializer = i, this.ru = false;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get ou() {
    return this.ru;
  }
  // Override of PersistentStream.start
  start() {
    this.ru = false, this.lastStreamToken = void 0, super.start();
  }
  Yo() {
    this.ru && this.uu([]);
  }
  eu(t, e) {
    return this.connection.Ro("Write", t, e);
  }
  onMessage(t) {
    if (
      // Always capture the last stream token.
      F(!!t.streamToken), this.lastStreamToken = t.streamToken, this.ru
    ) {
      this.qo.reset();
      const e = Wi(t.writeResults, t.commitTime), n = Ni(t.commitTime);
      return this.listener.cu(n, e);
    }
    return F(!t.writeResults || 0 === t.writeResults.length), this.ru = true, this.listener.au();
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  hu() {
    const t = {};
    t.database = Li(this.serializer), this.Wo(t);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  uu(t) {
    const e = {
      streamToken: this.lastStreamToken,
      writes: t.map((t2) => ji(this.serializer, t2))
    };
    this.Wo(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ku extends class {
} {
  constructor(t, e, n, s) {
    super(), this.authCredentials = t, this.appCheckCredentials = e, this.connection = n, this.serializer = s, this.lu = false;
  }
  fu() {
    if (this.lu)
      throw new U(q.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  Io(t, e, n) {
    return this.fu(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([s, i]) => this.connection.Io(t, e, n, s, i)).catch((t2) => {
      throw "FirebaseError" === t2.name ? (t2.code === q.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), t2) : new U(q.UNKNOWN, t2.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  vo(t, e, n, s) {
    return this.fu(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([i, r2]) => this.connection.vo(t, e, n, i, r2, s)).catch((t2) => {
      throw "FirebaseError" === t2.name ? (t2.code === q.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), t2) : new U(q.UNKNOWN, t2.toString());
    });
  }
  terminate() {
    this.lu = true;
  }
}
class Qu {
  constructor(t, e) {
    this.asyncQueue = t, this.onlineStateHandler = e, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.wu = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this._u = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this.mu = true;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  gu() {
    0 === this.wu && (this.yu(
      "Unknown"
      /* OnlineState.Unknown */
    ), this._u = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this._u = null, this.pu("Backend didn't respond within 10 seconds."), this.yu(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve())));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  Iu(t) {
    "Online" === this.state ? this.yu(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.wu++, this.wu >= 1 && (this.Tu(), this.pu(`Connection failed 1 times. Most recent error: ${t.toString()}`), this.yu(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(t) {
    this.Tu(), this.wu = 0, "Online" === t && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this.mu = false), this.yu(t);
  }
  yu(t) {
    t !== this.state && (this.state = t, this.onlineStateHandler(t));
  }
  pu(t) {
    const e = `Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.mu ? (k(e), this.mu = false) : N("OnlineStateTracker", e);
  }
  Tu() {
    null !== this._u && (this._u.cancel(), this._u = null);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ju {
  constructor(t, e, n, s, i) {
    this.localStore = t, this.datastore = e, this.asyncQueue = n, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.Eu = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.Au = /* @__PURE__ */ new Map(), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.vu = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.Ru = [], this.Pu = i, this.Pu.Yr((t2) => {
      n.enqueueAndForget(async () => {
        ec(this) && (N("RemoteStore", "Restarting streams for network reachability change."), await async function(t3) {
          const e2 = L(t3);
          e2.vu.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Wu(e2), e2.bu.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), e2.vu.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await zu(e2);
        }(this));
      });
    }), this.bu = new Qu(n, s);
  }
}
async function zu(t) {
  if (ec(t))
    for (const e of t.Ru)
      await e(
        /* enabled= */
        true
      );
}
async function Wu(t) {
  for (const e of t.Ru)
    await e(
      /* enabled= */
      false
    );
}
function Hu(t, e) {
  const n = L(t);
  n.Au.has(e.targetId) || // Mark this as something the client is currently listening for.
  (n.Au.set(e.targetId, e), tc(n) ? (
    // The listen will be sent in onWatchStreamOpen
    Zu(n)
  ) : pc(n).Ko() && Yu(n, e));
}
function Ju(t, e) {
  const n = L(t), s = pc(n);
  n.Au.delete(e), s.Ko() && Xu(n, e), 0 === n.Au.size && (s.Ko() ? s.jo() : ec(n) && // Revert to OnlineState.Unknown if the watch stream is not open and we
  // have no listeners, since without any listens to send we cannot
  // confirm if the stream is healthy and upgrade to OnlineState.Online.
  n.bu.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function Yu(t, e) {
  if (t.Vu.qt(e.targetId), e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(rt.min()) > 0) {
    const n = t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
    e = e.withExpectedCount(n);
  }
  pc(t).su(e);
}
function Xu(t, e) {
  t.Vu.qt(e), pc(t).iu(e);
}
function Zu(t) {
  t.Vu = new Ei({
    getRemoteKeysForTarget: (e) => t.remoteSyncer.getRemoteKeysForTarget(e),
    le: (e) => t.Au.get(e) || null,
    ue: () => t.datastore.serializer.databaseId
  }), pc(t).start(), t.bu.gu();
}
function tc(t) {
  return ec(t) && !pc(t).Uo() && t.Au.size > 0;
}
function ec(t) {
  return 0 === L(t).vu.size;
}
function nc(t) {
  t.Vu = void 0;
}
async function sc(t) {
  t.Au.forEach((e, n) => {
    Yu(t, e);
  });
}
async function ic(t, e) {
  nc(t), // If we still need the watch stream, retry the connection.
  tc(t) ? (t.bu.Iu(e), Zu(t)) : (
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    t.bu.set(
      "Unknown"
      /* OnlineState.Unknown */
    )
  );
}
async function rc(t, e, n) {
  if (
    // Mark the client as online since we got a message from the server
    t.bu.set(
      "Online"
      /* OnlineState.Online */
    ), e instanceof Ii && 2 === e.state && e.cause
  )
    try {
      await /** Handles an error on a target */
      async function(t2, e2) {
        const n2 = e2.cause;
        for (const s of e2.targetIds)
          t2.Au.has(s) && (await t2.remoteSyncer.rejectListen(s, n2), t2.Au.delete(s), t2.Vu.removeTarget(s));
      }(t, e);
    } catch (n2) {
      N("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), n2), await oc(t, n2);
    }
  else if (e instanceof yi ? t.Vu.Ht(e) : e instanceof pi ? t.Vu.ne(e) : t.Vu.Xt(e), !n.isEqual(rt.min()))
    try {
      const e2 = await ou(t.localStore);
      n.compareTo(e2) >= 0 && // We have received a target change with a global snapshot if the snapshot
      // version is not equal to SnapshotVersion.min().
      await /**
      * Takes a batch of changes from the Datastore, repackages them as a
      * RemoteEvent, and passes that on to the listener, which is typically the
      * SyncEngine.
      */
      function(t2, e3) {
        const n2 = t2.Vu.ce(e3);
        return n2.targetChanges.forEach((n3, s) => {
          if (n3.resumeToken.approximateByteSize() > 0) {
            const i = t2.Au.get(s);
            i && t2.Au.set(s, i.withResumeToken(n3.resumeToken, e3));
          }
        }), // Re-establish listens for the targets that have been invalidated by
        // existence filter mismatches.
        n2.targetMismatches.forEach((e4, n3) => {
          const s = t2.Au.get(e4);
          if (!s)
            return;
          t2.Au.set(e4, s.withResumeToken(Ve.EMPTY_BYTE_STRING, s.snapshotVersion)), // Cause a hard reset by unwatching and rewatching immediately, but
          // deliberately don't send a resume token so that we get a full update.
          Xu(t2, e4);
          const i = new cr(s.target, e4, n3, s.sequenceNumber);
          Yu(t2, i);
        }), t2.remoteSyncer.applyRemoteEvent(n2);
      }(t, n);
    } catch (e2) {
      N("RemoteStore", "Failed to raise snapshot:", e2), await oc(t, e2);
    }
}
async function oc(t, e, n) {
  if (!Dt(e))
    throw e;
  t.vu.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await Wu(t), t.bu.set(
    "Offline"
    /* OnlineState.Offline */
  ), n || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (n = () => ou(t.localStore)), // Probe IndexedDB periodically and re-enable network
  t.asyncQueue.enqueueRetryable(async () => {
    N("RemoteStore", "Retrying IndexedDB access"), await n(), t.vu.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await zu(t);
  });
}
function uc(t, e) {
  return e().catch((n) => oc(t, n, e));
}
async function cc(t) {
  const e = L(t), n = Ic(e);
  let s = e.Eu.length > 0 ? e.Eu[e.Eu.length - 1].batchId : -1;
  for (; ac(e); )
    try {
      const t2 = await au(e.localStore, s);
      if (null === t2) {
        0 === e.Eu.length && n.jo();
        break;
      }
      s = t2.batchId, hc(e, t2);
    } catch (t2) {
      await oc(e, t2);
    }
  lc(e) && fc(e);
}
function ac(t) {
  return ec(t) && t.Eu.length < 10;
}
function hc(t, e) {
  t.Eu.push(e);
  const n = Ic(t);
  n.Ko() && n.ou && n.uu(e.mutations);
}
function lc(t) {
  return ec(t) && !Ic(t).Uo() && t.Eu.length > 0;
}
function fc(t) {
  Ic(t).start();
}
async function dc(t) {
  Ic(t).hu();
}
async function wc(t) {
  const e = Ic(t);
  for (const n of t.Eu)
    e.uu(n.mutations);
}
async function _c(t, e, n) {
  const s = t.Eu.shift(), i = ti.from(s, e, n);
  await uc(t, () => t.remoteSyncer.applySuccessfulWrite(i)), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await cc(t);
}
async function mc(t, e) {
  e && Ic(t).ou && // This error affects the actual write.
  await async function(t2, e2) {
    if (n = e2.code, oi(n) && n !== q.ABORTED) {
      const n2 = t2.Eu.shift();
      Ic(t2).Qo(), await uc(t2, () => t2.remoteSyncer.rejectFailedWrite(n2.batchId, e2)), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await cc(t2);
    }
    var n;
  }(t, e), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  lc(t) && fc(t);
}
async function gc(t, e) {
  const n = L(t);
  n.asyncQueue.verifyOperationInProgress(), N("RemoteStore", "RemoteStore received new credentials");
  const s = ec(n);
  n.vu.add(
    3
    /* OfflineCause.CredentialChange */
  ), await Wu(n), s && // Don't set the network status to Unknown if we are offline.
  n.bu.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await n.remoteSyncer.handleCredentialChange(e), n.vu.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await zu(n);
}
async function yc(t, e) {
  const n = L(t);
  e ? (n.vu.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await zu(n)) : e || (n.vu.add(
    2
    /* OfflineCause.IsSecondary */
  ), await Wu(n), n.bu.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function pc(t) {
  return t.Su || // Create stream (but note that it is not started yet).
  (t.Su = function(t2, e, n) {
    const s = L(t2);
    return s.fu(), new qu(e, s.connection, s.authCredentials, s.appCheckCredentials, s.serializer, n);
  }(t.datastore, t.asyncQueue, {
    uo: sc.bind(null, t),
    ao: ic.bind(null, t),
    nu: rc.bind(null, t)
  }), t.Ru.push(async (e) => {
    e ? (t.Su.Qo(), tc(t) ? Zu(t) : t.bu.set(
      "Unknown"
      /* OnlineState.Unknown */
    )) : (await t.Su.stop(), nc(t));
  })), t.Su;
}
function Ic(t) {
  return t.Du || // Create stream (but note that it is not started yet).
  (t.Du = function(t2, e, n) {
    const s = L(t2);
    return s.fu(), new Uu(e, s.connection, s.authCredentials, s.appCheckCredentials, s.serializer, n);
  }(t.datastore, t.asyncQueue, {
    uo: dc.bind(null, t),
    ao: mc.bind(null, t),
    au: wc.bind(null, t),
    cu: _c.bind(null, t)
  }), t.Ru.push(async (e) => {
    e ? (t.Du.Qo(), // This will start the write stream if necessary.
    await cc(t)) : (await t.Du.stop(), t.Eu.length > 0 && (N("RemoteStore", `Stopping write stream with ${t.Eu.length} pending writes`), t.Eu = []));
  })), t.Du;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Tc {
  constructor(t, e, n, s, i) {
    this.asyncQueue = t, this.timerId = e, this.targetTimeMs = n, this.op = s, this.removalCallback = i, this.deferred = new K(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((t2) => {
    });
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(t, e, n, s, i) {
    const r2 = Date.now() + n, o = new Tc(t, e, r2, s, i);
    return o.start(n), o;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(t) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), t);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(t) {
    null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new U(q.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => null !== this.timerHandle ? (this.clearTimeout(), this.op().then((t) => this.deferred.resolve(t))) : Promise.resolve());
  }
  clearTimeout() {
    null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
}
function Ec(t, e) {
  if (k("AsyncQueue", `${e}: ${t}`), Dt(t))
    return new U(q.UNAVAILABLE, `${e}: ${t}`);
  throw t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ac {
  /** The default ordering is by key if the comparator is omitted */
  constructor(t) {
    this.comparator = t ? (e, n) => t(e, n) || ht.comparator(e.key, n.key) : (t2, e) => ht.comparator(t2.key, e.key), this.keyedMap = hs(), this.sortedSet = new pe(this.comparator);
  }
  /**
   * Returns an empty copy of the existing DocumentSet, using the same
   * comparator.
   */
  static emptySet(t) {
    return new Ac(t.comparator);
  }
  has(t) {
    return null != this.keyedMap.get(t);
  }
  get(t) {
    return this.keyedMap.get(t);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  /**
   * Returns the index of the provided key in the document set, or -1 if the
   * document key is not present in the set;
   */
  indexOf(t) {
    const e = this.keyedMap.get(t);
    return e ? this.sortedSet.indexOf(e) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  /** Iterates documents in order defined by "comparator" */
  forEach(t) {
    this.sortedSet.inorderTraversal((e, n) => (t(e), false));
  }
  /** Inserts or updates a document with the same key */
  add(t) {
    const e = this.delete(t.key);
    return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
  }
  /** Deletes a document with a given key */
  delete(t) {
    const e = this.get(t);
    return e ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e)) : this;
  }
  isEqual(t) {
    if (!(t instanceof Ac))
      return false;
    if (this.size !== t.size)
      return false;
    const e = this.sortedSet.getIterator(), n = t.sortedSet.getIterator();
    for (; e.hasNext(); ) {
      const t2 = e.getNext().key, s = n.getNext().key;
      if (!t2.isEqual(s))
        return false;
    }
    return true;
  }
  toString() {
    const t = [];
    return this.forEach((e) => {
      t.push(e.toString());
    }), 0 === t.length ? "DocumentSet ()" : "DocumentSet (\n  " + t.join("  \n") + "\n)";
  }
  copy(t, e) {
    const n = new Ac();
    return n.comparator = this.comparator, n.keyedMap = t, n.sortedSet = e, n;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class vc {
  constructor() {
    this.Cu = new pe(ht.comparator);
  }
  track(t) {
    const e = t.doc.key, n = this.Cu.get(e);
    n ? (
      // Merge the new change with the existing change.
      0 !== t.type && 3 === n.type ? this.Cu = this.Cu.insert(e, t) : 3 === t.type && 1 !== n.type ? this.Cu = this.Cu.insert(e, {
        type: n.type,
        doc: t.doc
      }) : 2 === t.type && 2 === n.type ? this.Cu = this.Cu.insert(e, {
        type: 2,
        doc: t.doc
      }) : 2 === t.type && 0 === n.type ? this.Cu = this.Cu.insert(e, {
        type: 0,
        doc: t.doc
      }) : 1 === t.type && 0 === n.type ? this.Cu = this.Cu.remove(e) : 1 === t.type && 2 === n.type ? this.Cu = this.Cu.insert(e, {
        type: 1,
        doc: n.doc
      }) : 0 === t.type && 1 === n.type ? this.Cu = this.Cu.insert(e, {
        type: 2,
        doc: t.doc
      }) : (
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        O()
      )
    ) : this.Cu = this.Cu.insert(e, t);
  }
  xu() {
    const t = [];
    return this.Cu.inorderTraversal((e, n) => {
      t.push(n);
    }), t;
  }
}
class Rc {
  constructor(t, e, n, s, i, r2, o, u, c) {
    this.query = t, this.docs = e, this.oldDocs = n, this.docChanges = s, this.mutatedKeys = i, this.fromCache = r2, this.syncStateChanged = o, this.excludesMetadataChanges = u, this.hasCachedResults = c;
  }
  /** Returns a view snapshot as if all documents in the snapshot were added. */
  static fromInitialDocuments(t, e, n, s, i) {
    const r2 = [];
    return e.forEach((t2) => {
      r2.push({
        type: 0,
        doc: t2
      });
    }), new Rc(
      t,
      e,
      Ac.emptySet(e),
      r2,
      n,
      s,
      /* syncStateChanged= */
      true,
      /* excludesMetadataChanges= */
      false,
      i
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(t) {
    if (!(this.fromCache === t.fromCache && this.hasCachedResults === t.hasCachedResults && this.syncStateChanged === t.syncStateChanged && this.mutatedKeys.isEqual(t.mutatedKeys) && Zn(this.query, t.query) && this.docs.isEqual(t.docs) && this.oldDocs.isEqual(t.oldDocs)))
      return false;
    const e = this.docChanges, n = t.docChanges;
    if (e.length !== n.length)
      return false;
    for (let t2 = 0; t2 < e.length; t2++)
      if (e[t2].type !== n[t2].type || !e[t2].doc.isEqual(n[t2].doc))
        return false;
    return true;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pc {
  constructor() {
    this.Nu = void 0, this.listeners = [];
  }
}
class bc {
  constructor() {
    this.queries = new os((t) => ts(t), Zn), this.onlineState = "Unknown", this.ku = /* @__PURE__ */ new Set();
  }
}
async function Vc(t, e) {
  const n = L(t), s = e.query;
  let i = false, r2 = n.queries.get(s);
  if (r2 || (i = true, r2 = new Pc()), i)
    try {
      r2.Nu = await n.onListen(s);
    } catch (t2) {
      const n2 = Ec(t2, `Initialization of query '${es(e.query)}' failed`);
      return void e.onError(n2);
    }
  if (n.queries.set(s, r2), r2.listeners.push(e), // Run global snapshot listeners if a consistent snapshot has been emitted.
  e.Mu(n.onlineState), r2.Nu) {
    e.$u(r2.Nu) && xc(n);
  }
}
async function Sc(t, e) {
  const n = L(t), s = e.query;
  let i = false;
  const r2 = n.queries.get(s);
  if (r2) {
    const t2 = r2.listeners.indexOf(e);
    t2 >= 0 && (r2.listeners.splice(t2, 1), i = 0 === r2.listeners.length);
  }
  if (i)
    return n.queries.delete(s), n.onUnlisten(s);
}
function Dc(t, e) {
  const n = L(t);
  let s = false;
  for (const t2 of e) {
    const e2 = t2.query, i = n.queries.get(e2);
    if (i) {
      for (const e3 of i.listeners)
        e3.$u(t2) && (s = true);
      i.Nu = t2;
    }
  }
  s && xc(n);
}
function Cc(t, e, n) {
  const s = L(t), i = s.queries.get(e);
  if (i)
    for (const t2 of i.listeners)
      t2.onError(n);
  s.queries.delete(e);
}
function xc(t) {
  t.ku.forEach((t2) => {
    t2.next();
  });
}
class Nc {
  constructor(t, e, n) {
    this.query = t, this.Ou = e, /**
     * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
     * observer. This flag is set to true once we've actually raised an event.
     */
    this.Fu = false, this.Bu = null, this.onlineState = "Unknown", this.options = n || {};
  }
  /**
   * Applies the new ViewSnapshot to this listener, raising a user-facing event
   * if applicable (depending on what changed, whether the user has opted into
   * metadata-only changes, etc.). Returns true if a user-facing event was
   * indeed raised.
   */
  $u(t) {
    if (!this.options.includeMetadataChanges) {
      const e2 = [];
      for (const n of t.docChanges)
        3 !== n.type && e2.push(n);
      t = new Rc(
        t.query,
        t.docs,
        t.oldDocs,
        e2,
        t.mutatedKeys,
        t.fromCache,
        t.syncStateChanged,
        /* excludesMetadataChanges= */
        true,
        t.hasCachedResults
      );
    }
    let e = false;
    return this.Fu ? this.Lu(t) && (this.Ou.next(t), e = true) : this.qu(t, this.onlineState) && (this.Uu(t), e = true), this.Bu = t, e;
  }
  onError(t) {
    this.Ou.error(t);
  }
  /** Returns whether a snapshot was raised. */
  Mu(t) {
    this.onlineState = t;
    let e = false;
    return this.Bu && !this.Fu && this.qu(this.Bu, t) && (this.Uu(this.Bu), e = true), e;
  }
  qu(t, e) {
    if (!t.fromCache)
      return true;
    const n = "Offline" !== e;
    return (!this.options.Ku || !n) && (!t.docs.isEmpty() || t.hasCachedResults || "Offline" === e);
  }
  Lu(t) {
    if (t.docChanges.length > 0)
      return true;
    const e = this.Bu && this.Bu.hasPendingWrites !== t.hasPendingWrites;
    return !(!t.syncStateChanged && !e) && true === this.options.includeMetadataChanges;
  }
  Uu(t) {
    t = Rc.fromInitialDocuments(t.query, t.docs, t.mutatedKeys, t.fromCache, t.hasCachedResults), this.Fu = true, this.Ou.next(t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Fc {
  constructor(t) {
    this.key = t;
  }
}
class Bc {
  constructor(t) {
    this.key = t;
  }
}
class Lc {
  constructor(t, e) {
    this.query = t, this.Yu = e, this.Xu = null, this.hasCachedResults = false, /**
     * A flag whether the view is current with the backend. A view is considered
     * current after it has seen the current flag from the backend and did not
     * lose consistency within the watch stream (e.g. because of an existence
     * filter mismatch).
     */
    this.current = false, /** Documents in the view but not in the remote target */
    this.Zu = gs(), /** Document Keys that have local changes */
    this.mutatedKeys = gs(), this.tc = is(t), this.ec = new Ac(this.tc);
  }
  /**
   * The set of remote documents that the server has told us belongs to the target associated with
   * this view.
   */
  get nc() {
    return this.Yu;
  }
  /**
   * Iterates over a set of doc changes, applies the query limit, and computes
   * what the new results should be, what the changes were, and whether we may
   * need to go back to the local cache for more results. Does not make any
   * changes to the view.
   * @param docChanges - The doc changes to apply to this view.
   * @param previousChanges - If this is being called with a refill, then start
   *        with this set of docs and changes instead of the current view.
   * @returns a new set of docs, changes, and refill flag.
   */
  sc(t, e) {
    const n = e ? e.ic : new vc(), s = e ? e.ec : this.ec;
    let i = e ? e.mutatedKeys : this.mutatedKeys, r2 = s, o = false;
    const u = "F" === this.query.limitType && s.size === this.query.limit ? s.last() : null, c = "L" === this.query.limitType && s.size === this.query.limit ? s.first() : null;
    if (t.inorderTraversal((t2, e2) => {
      const a = s.get(t2), h = ns(this.query, e2) ? e2 : null, l2 = !!a && this.mutatedKeys.has(a.key), f = !!h && (h.hasLocalMutations || // We only consider committed mutations for documents that were
      // mutated during the lifetime of the view.
      this.mutatedKeys.has(h.key) && h.hasCommittedMutations);
      let d = false;
      if (a && h) {
        a.data.isEqual(h.data) ? l2 !== f && (n.track({
          type: 3,
          doc: h
        }), d = true) : this.rc(a, h) || (n.track({
          type: 2,
          doc: h
        }), d = true, (u && this.tc(h, u) > 0 || c && this.tc(h, c) < 0) && // This doc moved from inside the limit to outside the limit.
        // That means there may be some other doc in the local cache
        // that should be included instead.
        (o = true));
      } else
        !a && h ? (n.track({
          type: 0,
          doc: h
        }), d = true) : a && !h && (n.track({
          type: 1,
          doc: a
        }), d = true, (u || c) && // A doc was removed from a full limit query. We'll need to
        // requery from the local cache to see if we know about some other
        // doc that should be in the results.
        (o = true));
      d && (h ? (r2 = r2.add(h), i = f ? i.add(t2) : i.delete(t2)) : (r2 = r2.delete(t2), i = i.delete(t2)));
    }), null !== this.query.limit)
      for (; r2.size > this.query.limit; ) {
        const t2 = "F" === this.query.limitType ? r2.last() : r2.first();
        r2 = r2.delete(t2.key), i = i.delete(t2.key), n.track({
          type: 1,
          doc: t2
        });
      }
    return {
      ec: r2,
      ic: n,
      zi: o,
      mutatedKeys: i
    };
  }
  rc(t, e) {
    return t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
  }
  /**
   * Updates the view with the given ViewDocumentChanges and optionally updates
   * limbo docs and sync state from the provided target change.
   * @param docChanges - The set of changes to make to the view's docs.
   * @param updateLimboDocuments - Whether to update limbo documents based on
   *        this change.
   * @param targetChange - A target change to apply for computing limbo docs and
   *        sync state.
   * @returns A new ViewChange with the given docs, changes, and sync state.
   */
  // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
  applyChanges(t, e, n) {
    const s = this.ec;
    this.ec = t.ec, this.mutatedKeys = t.mutatedKeys;
    const i = t.ic.xu();
    i.sort((t2, e2) => function(t3, e3) {
      const n2 = (t4) => {
        switch (t4) {
          case 0:
            return 1;
          case 2:
          case 3:
            return 2;
          case 1:
            return 0;
          default:
            return O();
        }
      };
      return n2(t3) - n2(e3);
    }(t2.type, e2.type) || this.tc(t2.doc, e2.doc)), this.oc(n);
    const r2 = e ? this.uc() : [], o = 0 === this.Zu.size && this.current ? 1 : 0, u = o !== this.Xu;
    if (this.Xu = o, 0 !== i.length || u) {
      return {
        snapshot: new Rc(
          this.query,
          t.ec,
          s,
          i,
          t.mutatedKeys,
          0 === o,
          u,
          /* excludesMetadataChanges= */
          false,
          !!n && n.resumeToken.approximateByteSize() > 0
        ),
        cc: r2
      };
    }
    return {
      cc: r2
    };
  }
  /**
   * Applies an OnlineState change to the view, potentially generating a
   * ViewChange if the view's syncState changes as a result.
   */
  Mu(t) {
    return this.current && "Offline" === t ? (
      // If we're offline, set `current` to false and then call applyChanges()
      // to refresh our syncState and generate a ViewChange as appropriate. We
      // are guaranteed to get a new TargetChange that sets `current` back to
      // true once the client is back online.
      (this.current = false, this.applyChanges(
        {
          ec: this.ec,
          ic: new vc(),
          mutatedKeys: this.mutatedKeys,
          zi: false
        },
        /* updateLimboDocuments= */
        false
      ))
    ) : {
      cc: []
    };
  }
  /**
   * Returns whether the doc for the given key should be in limbo.
   */
  ac(t) {
    return !this.Yu.has(t) && // The local store doesn't think it's a result, so it shouldn't be in limbo.
    (!!this.ec.has(t) && !this.ec.get(t).hasLocalMutations);
  }
  /**
   * Updates syncedDocuments, current, and limbo docs based on the given change.
   * Returns the list of changes to which docs are in limbo.
   */
  oc(t) {
    t && (t.addedDocuments.forEach((t2) => this.Yu = this.Yu.add(t2)), t.modifiedDocuments.forEach((t2) => {
    }), t.removedDocuments.forEach((t2) => this.Yu = this.Yu.delete(t2)), this.current = t.current);
  }
  uc() {
    if (!this.current)
      return [];
    const t = this.Zu;
    this.Zu = gs(), this.ec.forEach((t2) => {
      this.ac(t2.key) && (this.Zu = this.Zu.add(t2.key));
    });
    const e = [];
    return t.forEach((t2) => {
      this.Zu.has(t2) || e.push(new Bc(t2));
    }), this.Zu.forEach((n) => {
      t.has(n) || e.push(new Fc(n));
    }), e;
  }
  /**
   * Update the in-memory state of the current view with the state read from
   * persistence.
   *
   * We update the query view whenever a client's primary status changes:
   * - When a client transitions from primary to secondary, it can miss
   *   LocalStorage updates and its query views may temporarily not be
   *   synchronized with the state on disk.
   * - For secondary to primary transitions, the client needs to update the list
   *   of `syncedDocuments` since secondary clients update their query views
   *   based purely on synthesized RemoteEvents.
   *
   * @param queryResult.documents - The documents that match the query according
   * to the LocalStore.
   * @param queryResult.remoteKeys - The keys of the documents that match the
   * query according to the backend.
   *
   * @returns The ViewChange that resulted from this synchronization.
   */
  // PORTING NOTE: Multi-tab only.
  hc(t) {
    this.Yu = t.ir, this.Zu = gs();
    const e = this.sc(t.documents);
    return this.applyChanges(
      e,
      /*updateLimboDocuments=*/
      true
    );
  }
  /**
   * Returns a view snapshot as if this query was just listened to. Contains
   * a document add for every existing document and the `fromCache` and
   * `hasPendingWrites` status of the already established view.
   */
  // PORTING NOTE: Multi-tab only.
  lc() {
    return Rc.fromInitialDocuments(this.query, this.ec, this.mutatedKeys, 0 === this.Xu, this.hasCachedResults);
  }
}
class qc {
  constructor(t, e, n) {
    this.query = t, this.targetId = e, this.view = n;
  }
}
class Uc {
  constructor(t) {
    this.key = t, /**
     * Set to true once we've received a document. This is used in
     * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
     * decide whether it needs to manufacture a delete event for the target once
     * the target is CURRENT.
     */
    this.fc = false;
  }
}
class Kc {
  constructor(t, e, n, s, i, r2) {
    this.localStore = t, this.remoteStore = e, this.eventManager = n, this.sharedClientState = s, this.currentUser = i, this.maxConcurrentLimboResolutions = r2, this.dc = {}, this.wc = new os((t2) => ts(t2), Zn), this._c = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.mc = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.gc = new pe(ht.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.yc = /* @__PURE__ */ new Map(), this.Ic = new Oo(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Tc = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.Ec = /* @__PURE__ */ new Map(), this.Ac = lo.Mn(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.vc = void 0;
  }
  get isPrimaryClient() {
    return true === this.vc;
  }
}
async function Gc(t, e) {
  const n = pa(t);
  let s, i;
  const r2 = n.wc.get(e);
  if (r2)
    s = r2.targetId, n.sharedClientState.addLocalQueryTarget(s), i = r2.view.lc();
  else {
    const t2 = await hu(n.localStore, Jn(e)), r3 = n.sharedClientState.addLocalQueryTarget(t2.targetId);
    s = t2.targetId, i = await Qc(n, e, s, "current" === r3, t2.resumeToken), n.isPrimaryClient && Hu(n.remoteStore, t2);
  }
  return i;
}
async function Qc(t, e, n, s, i) {
  t.Rc = (e2, n2, s2) => async function(t2, e3, n3, s3) {
    let i2 = e3.view.sc(n3);
    i2.zi && // The query has a limit and some docs were removed, so we need
    // to re-run the query against the local store to make sure we
    // didn't lose any good docs that had been past the limit.
    (i2 = await fu(
      t2.localStore,
      e3.query,
      /* usePreviousResults= */
      false
    ).then(({ documents: t3 }) => e3.view.sc(t3, i2)));
    const r3 = s3 && s3.targetChanges.get(e3.targetId), o2 = e3.view.applyChanges(
      i2,
      /* updateLimboDocuments= */
      t2.isPrimaryClient,
      r3
    );
    return ia(t2, e3.targetId, o2.cc), o2.snapshot;
  }(t, e2, n2, s2);
  const r2 = await fu(
    t.localStore,
    e,
    /* usePreviousResults= */
    true
  ), o = new Lc(e, r2.ir), u = o.sc(r2.documents), c = gi.createSynthesizedTargetChangeForCurrentChange(n, s && "Offline" !== t.onlineState, i), a = o.applyChanges(
    u,
    /* updateLimboDocuments= */
    t.isPrimaryClient,
    c
  );
  ia(t, n, a.cc);
  const h = new qc(e, n, o);
  return t.wc.set(e, h), t._c.has(n) ? t._c.get(n).push(e) : t._c.set(n, [e]), a.snapshot;
}
async function jc(t, e) {
  const n = L(t), s = n.wc.get(e), i = n._c.get(s.targetId);
  if (i.length > 1)
    return n._c.set(s.targetId, i.filter((t2) => !Zn(t2, e))), void n.wc.delete(e);
  if (n.isPrimaryClient) {
    n.sharedClientState.removeLocalQueryTarget(s.targetId);
    n.sharedClientState.isActiveQueryTarget(s.targetId) || await lu(
      n.localStore,
      s.targetId,
      /*keepPersistedTargetData=*/
      false
    ).then(() => {
      n.sharedClientState.clearQueryState(s.targetId), Ju(n.remoteStore, s.targetId), na(n, s.targetId);
    }).catch(vt);
  } else
    na(n, s.targetId), await lu(
      n.localStore,
      s.targetId,
      /*keepPersistedTargetData=*/
      true
    );
}
async function zc(t, e, n) {
  const s = Ia(t);
  try {
    const t2 = await function(t3, e2) {
      const n2 = L(t3), s2 = it.now(), i = e2.reduce((t4, e3) => t4.add(e3.key), gs());
      let r2, o;
      return n2.persistence.runTransaction("Locally write mutations", "readwrite", (t4) => {
        let u = cs(), c = gs();
        return n2.Zi.getEntries(t4, i).next((t5) => {
          u = t5, u.forEach((t6, e3) => {
            e3.isValidDocument() || (c = c.add(t6));
          });
        }).next(() => n2.localDocuments.getOverlayedDocuments(t4, u)).next((i2) => {
          r2 = i2;
          const o2 = [];
          for (const t5 of e2) {
            const e3 = Gs(t5, r2.get(t5.key).overlayedDocument);
            null != e3 && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            o2.push(new zs(t5.key, e3, cn(e3.value.mapValue), Fs.exists(true)));
          }
          return n2.mutationQueue.addMutationBatch(t4, s2, o2, e2);
        }).next((e3) => {
          o = e3;
          const s3 = e3.applyToLocalDocumentSet(r2, c);
          return n2.documentOverlayCache.saveOverlays(t4, e3.batchId, s3);
        });
      }).then(() => ({
        batchId: o.batchId,
        changes: ls(r2)
      }));
    }(s.localStore, e);
    s.sharedClientState.addPendingMutation(t2.batchId), function(t3, e2, n2) {
      let s2 = t3.Tc[t3.currentUser.toKey()];
      s2 || (s2 = new pe(et));
      s2 = s2.insert(e2, n2), t3.Tc[t3.currentUser.toKey()] = s2;
    }(s, t2.batchId, n), await ua(s, t2.changes), await cc(s.remoteStore);
  } catch (t2) {
    const e2 = Ec(t2, "Failed to persist write");
    n.reject(e2);
  }
}
async function Wc(t, e) {
  const n = L(t);
  try {
    const t2 = await uu(n.localStore, e);
    e.targetChanges.forEach((t3, e2) => {
      const s = n.yc.get(e2);
      s && // Since this is a limbo resolution lookup, it's for a single document
      // and it could be added, modified, or removed, but not a combination.
      (F(t3.addedDocuments.size + t3.modifiedDocuments.size + t3.removedDocuments.size <= 1), t3.addedDocuments.size > 0 ? s.fc = true : t3.modifiedDocuments.size > 0 ? F(s.fc) : t3.removedDocuments.size > 0 && (F(s.fc), s.fc = false));
    }), await ua(n, t2, e);
  } catch (t2) {
    await vt(t2);
  }
}
function Hc(t, e, n) {
  const s = L(t);
  if (s.isPrimaryClient && 0 === n || !s.isPrimaryClient && 1 === n) {
    const t2 = [];
    s.wc.forEach((n2, s2) => {
      const i = s2.view.Mu(e);
      i.snapshot && t2.push(i.snapshot);
    }), function(t3, e2) {
      const n2 = L(t3);
      n2.onlineState = e2;
      let s2 = false;
      n2.queries.forEach((t4, n3) => {
        for (const t5 of n3.listeners)
          t5.Mu(e2) && (s2 = true);
      }), s2 && xc(n2);
    }(s.eventManager, e), t2.length && s.dc.nu(t2), s.onlineState = e, s.isPrimaryClient && s.sharedClientState.setOnlineState(e);
  }
}
async function Jc(t, e, n) {
  const s = L(t);
  s.sharedClientState.updateQueryState(e, "rejected", n);
  const i = s.yc.get(e), r2 = i && i.key;
  if (r2) {
    let t2 = new pe(ht.comparator);
    t2 = t2.insert(r2, an.newNoDocument(r2, rt.min()));
    const n2 = gs().add(r2), i2 = new mi(
      rt.min(),
      /* targetChanges= */
      /* @__PURE__ */ new Map(),
      /* targetMismatches= */
      new pe(et),
      t2,
      n2
    );
    await Wc(s, i2), // Since this query failed, we won't want to manually unlisten to it.
    // We only remove it from bookkeeping after we successfully applied the
    // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
    // this query when the RemoteStore restarts the Watch stream, which should
    // re-trigger the target failure.
    s.gc = s.gc.remove(r2), s.yc.delete(e), oa(s);
  } else
    await lu(
      s.localStore,
      e,
      /* keepPersistedTargetData */
      false
    ).then(() => na(s, e, n)).catch(vt);
}
async function Yc(t, e) {
  const n = L(t), s = e.batch.batchId;
  try {
    const t2 = await ru(n.localStore, e);
    ea(
      n,
      s,
      /*error=*/
      null
    ), ta(n, s), n.sharedClientState.updateMutationState(s, "acknowledged"), await ua(n, t2);
  } catch (t2) {
    await vt(t2);
  }
}
async function Xc(t, e, n) {
  const s = L(t);
  try {
    const t2 = await function(t3, e2) {
      const n2 = L(t3);
      return n2.persistence.runTransaction("Reject batch", "readwrite-primary", (t4) => {
        let s2;
        return n2.mutationQueue.lookupMutationBatch(t4, e2).next((e3) => (F(null !== e3), s2 = e3.keys(), n2.mutationQueue.removeMutationBatch(t4, e3))).next(() => n2.mutationQueue.performConsistencyCheck(t4)).next(() => n2.documentOverlayCache.removeOverlaysForBatchId(t4, s2, e2)).next(() => n2.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t4, s2)).next(() => n2.localDocuments.getDocuments(t4, s2));
      });
    }(s.localStore, e);
    ea(s, e, n), ta(s, e), s.sharedClientState.updateMutationState(e, "rejected", n), await ua(s, t2);
  } catch (n2) {
    await vt(n2);
  }
}
function ta(t, e) {
  (t.Ec.get(e) || []).forEach((t2) => {
    t2.resolve();
  }), t.Ec.delete(e);
}
function ea(t, e, n) {
  const s = L(t);
  let i = s.Tc[s.currentUser.toKey()];
  if (i) {
    const t2 = i.get(e);
    t2 && (n ? t2.reject(n) : t2.resolve(), i = i.remove(e)), s.Tc[s.currentUser.toKey()] = i;
  }
}
function na(t, e, n = null) {
  t.sharedClientState.removeLocalQueryTarget(e);
  for (const s of t._c.get(e))
    t.wc.delete(s), n && t.dc.Pc(s, n);
  if (t._c.delete(e), t.isPrimaryClient) {
    t.Ic.Is(e).forEach((e2) => {
      t.Ic.containsKey(e2) || // We removed the last reference for this key
      sa(t, e2);
    });
  }
}
function sa(t, e) {
  t.mc.delete(e.path.canonicalString());
  const n = t.gc.get(e);
  null !== n && (Ju(t.remoteStore, n), t.gc = t.gc.remove(e), t.yc.delete(n), oa(t));
}
function ia(t, e, n) {
  for (const s of n)
    if (s instanceof Fc)
      t.Ic.addReference(s.key, e), ra(t, s);
    else if (s instanceof Bc) {
      N("SyncEngine", "Document no longer in limbo: " + s.key), t.Ic.removeReference(s.key, e);
      t.Ic.containsKey(s.key) || // We removed the last reference for this key
      sa(t, s.key);
    } else
      O();
}
function ra(t, e) {
  const n = e.key, s = n.path.canonicalString();
  t.gc.get(n) || t.mc.has(s) || (N("SyncEngine", "New document in limbo: " + n), t.mc.add(s), oa(t));
}
function oa(t) {
  for (; t.mc.size > 0 && t.gc.size < t.maxConcurrentLimboResolutions; ) {
    const e = t.mc.values().next().value;
    t.mc.delete(e);
    const n = new ht(ut.fromString(e)), s = t.Ac.next();
    t.yc.set(s, new Uc(n)), t.gc = t.gc.insert(n, s), Hu(t.remoteStore, new cr(Jn(Gn(n.path)), s, "TargetPurposeLimboResolution", Ot.ct));
  }
}
async function ua(t, e, n) {
  const s = L(t), i = [], r2 = [], o = [];
  s.wc.isEmpty() || (s.wc.forEach((t2, u) => {
    o.push(s.Rc(u, e, n).then((t3) => {
      if (
        // If there are changes, or we are handling a global snapshot, notify
        // secondary clients to update query state.
        (t3 || n) && s.isPrimaryClient && s.sharedClientState.updateQueryState(u.targetId, (null == t3 ? void 0 : t3.fromCache) ? "not-current" : "current"), t3
      ) {
        i.push(t3);
        const e2 = tu.Li(u.targetId, t3);
        r2.push(e2);
      }
    }));
  }), await Promise.all(o), s.dc.nu(i), await async function(t2, e2) {
    const n2 = L(t2);
    try {
      await n2.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (t3) => Rt.forEach(e2, (e3) => Rt.forEach(e3.Fi, (s2) => n2.persistence.referenceDelegate.addReference(t3, e3.targetId, s2)).next(() => Rt.forEach(e3.Bi, (s2) => n2.persistence.referenceDelegate.removeReference(t3, e3.targetId, s2)))));
    } catch (t3) {
      if (!Dt(t3))
        throw t3;
      N("LocalStore", "Failed to update sequence numbers: " + t3);
    }
    for (const t3 of e2) {
      const e3 = t3.targetId;
      if (!t3.fromCache) {
        const t4 = n2.Ji.get(e3), s2 = t4.snapshotVersion, i2 = t4.withLastLimboFreeSnapshotVersion(s2);
        n2.Ji = n2.Ji.insert(e3, i2);
      }
    }
  }(s.localStore, r2));
}
async function ca(t, e) {
  const n = L(t);
  if (!n.currentUser.isEqual(e)) {
    N("SyncEngine", "User change. New user:", e.toKey());
    const t2 = await iu(n.localStore, e);
    n.currentUser = e, // Fails tasks waiting for pending writes requested by previous user.
    function(t3, e2) {
      t3.Ec.forEach((t4) => {
        t4.forEach((t5) => {
          t5.reject(new U(q.CANCELLED, e2));
        });
      }), t3.Ec.clear();
    }(n, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    n.sharedClientState.handleUserChange(e, t2.removedBatchIds, t2.addedBatchIds), await ua(n, t2.er);
  }
}
function aa(t, e) {
  const n = L(t), s = n.yc.get(e);
  if (s && s.fc)
    return gs().add(s.key);
  {
    let t2 = gs();
    const s2 = n._c.get(e);
    if (!s2)
      return t2;
    for (const e2 of s2) {
      const s3 = n.wc.get(e2);
      t2 = t2.unionWith(s3.view.nc);
    }
    return t2;
  }
}
function pa(t) {
  const e = L(t);
  return e.remoteStore.remoteSyncer.applyRemoteEvent = Wc.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = aa.bind(null, e), e.remoteStore.remoteSyncer.rejectListen = Jc.bind(null, e), e.dc.nu = Dc.bind(null, e.eventManager), e.dc.Pc = Cc.bind(null, e.eventManager), e;
}
function Ia(t) {
  const e = L(t);
  return e.remoteStore.remoteSyncer.applySuccessfulWrite = Yc.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = Xc.bind(null, e), e;
}
class Ea {
  constructor() {
    this.synchronizeTabs = false;
  }
  async initialize(t) {
    this.serializer = Fu(t.databaseInfo.databaseId), this.sharedClientState = this.createSharedClientState(t), this.persistence = this.createPersistence(t), await this.persistence.start(), this.localStore = this.createLocalStore(t), this.gcScheduler = this.createGarbageCollectionScheduler(t, this.localStore), this.indexBackfillerScheduler = this.createIndexBackfillerScheduler(t, this.localStore);
  }
  createGarbageCollectionScheduler(t, e) {
    return null;
  }
  createIndexBackfillerScheduler(t, e) {
    return null;
  }
  createLocalStore(t) {
    return su(this.persistence, new eu(), t.initialUser, this.serializer);
  }
  createPersistence(t) {
    return new Ko(Qo.zs, this.serializer);
  }
  createSharedClientState(t) {
    return new bu();
  }
  async terminate() {
    this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
}
class Pa {
  async initialize(t, e) {
    this.localStore || (this.localStore = t.localStore, this.sharedClientState = t.sharedClientState, this.datastore = this.createDatastore(e), this.remoteStore = this.createRemoteStore(e), this.eventManager = this.createEventManager(e), this.syncEngine = this.createSyncEngine(
      e,
      /* startAsPrimary=*/
      !t.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (t2) => Hc(
      this.syncEngine,
      t2,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = ca.bind(null, this.syncEngine), await yc(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(t) {
    return new bc();
  }
  createDatastore(t) {
    const e = Fu(t.databaseInfo.databaseId), n = (s = t.databaseInfo, new Mu(s));
    var s;
    return function(t2, e2, n2, s2) {
      return new Ku(t2, e2, n2, s2);
    }(t.authCredentials, t.appCheckCredentials, n, e);
  }
  createRemoteStore(t) {
    return e = this.localStore, n = this.datastore, s = t.asyncQueue, i = (t2) => Hc(
      this.syncEngine,
      t2,
      0
      /* OnlineStateSource.RemoteStore */
    ), r2 = Su.D() ? new Su() : new Vu(), new ju(e, n, s, i, r2);
    var e, n, s, i, r2;
  }
  createSyncEngine(t, e) {
    return function(t2, e2, n, s, i, r2, o) {
      const u = new Kc(t2, e2, n, s, i, r2);
      return o && (u.vc = true), u;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t.initialUser, t.maxConcurrentLimboResolutions, e);
  }
  terminate() {
    return async function(t) {
      const e = L(t);
      N("RemoteStore", "RemoteStore shutting down."), e.vu.add(
        5
        /* OfflineCause.Shutdown */
      ), await Wu(e), e.Pu.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      e.bu.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    }(this.remoteStore);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Va {
  constructor(t) {
    this.observer = t, /**
     * When set to true, will not raise future events. Necessary to deal with
     * async detachment of listener.
     */
    this.muted = false;
  }
  next(t) {
    this.observer.next && this.Sc(this.observer.next, t);
  }
  error(t) {
    this.observer.error ? this.Sc(this.observer.error, t) : k("Uncaught Error in snapshot listener:", t.toString());
  }
  Dc() {
    this.muted = true;
  }
  Sc(t, e) {
    this.muted || setTimeout(() => {
      this.muted || t(e);
    }, 0);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class xa {
  constructor(t, e, n, s) {
    this.authCredentials = t, this.appCheckCredentials = e, this.asyncQueue = n, this.databaseInfo = s, this.user = V.UNAUTHENTICATED, this.clientId = tt.A(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this.authCredentials.start(n, async (t2) => {
      N("FirestoreClient", "Received user=", t2.uid), await this.authCredentialListener(t2), this.user = t2;
    }), this.appCheckCredentials.start(n, (t2) => (N("FirestoreClient", "Received new app check token=", t2), this.appCheckCredentialListener(t2, this.user)));
  }
  async getConfiguration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(t) {
    this.authCredentialListener = t;
  }
  setAppCheckTokenChangeListener(t) {
    this.appCheckCredentialListener = t;
  }
  /**
   * Checks that the client has not been terminated. Ensures that other methods on //
   * this class cannot be called after the client is terminated. //
   */
  verifyNotTerminated() {
    if (this.asyncQueue.isShuttingDown)
      throw new U(q.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const t = new K();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), t.resolve();
      } catch (e) {
        const n = Ec(e, "Failed to shutdown persistence");
        t.reject(n);
      }
    }), t.promise;
  }
}
async function Na(t, e) {
  t.asyncQueue.verifyOperationInProgress(), N("FirestoreClient", "Initializing OfflineComponentProvider");
  const n = await t.getConfiguration();
  await e.initialize(n);
  let s = n.initialUser;
  t.setCredentialChangeListener(async (t2) => {
    s.isEqual(t2) || (await iu(e.localStore, t2), s = t2);
  }), // When a user calls clearPersistence() in one client, all other clients
  // need to be terminated to allow the delete to succeed.
  e.persistence.setDatabaseDeletedListener(() => t.terminate()), t._offlineComponents = e;
}
async function ka(t, e) {
  t.asyncQueue.verifyOperationInProgress();
  const n = await $a(t);
  N("FirestoreClient", "Initializing OnlineComponentProvider");
  const s = await t.getConfiguration();
  await e.initialize(n, s), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  t.setCredentialChangeListener((t2) => gc(e.remoteStore, t2)), t.setAppCheckTokenChangeListener((t2, n2) => gc(e.remoteStore, n2)), t._onlineComponents = e;
}
function Ma(t) {
  return "FirebaseError" === t.name ? t.code === q.FAILED_PRECONDITION || t.code === q.UNIMPLEMENTED : !("undefined" != typeof DOMException && t instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
  // or an aborted error depending on whether the error happened during
  // schema migration.
  (22 === t.code || 20 === t.code || // Firefox Private Browsing mode disables IndexedDb and returns
  // INVALID_STATE for any usage.
  11 === t.code);
}
async function $a(t) {
  if (!t._offlineComponents)
    if (t._uninitializedComponentsProvider) {
      N("FirestoreClient", "Using user provided OfflineComponentProvider");
      try {
        await Na(t, t._uninitializedComponentsProvider._offline);
      } catch (e) {
        const n = e;
        if (!Ma(n))
          throw n;
        M("Error using user provided cache. Falling back to memory cache: " + n), await Na(t, new Ea());
      }
    } else
      N("FirestoreClient", "Using default OfflineComponentProvider"), await Na(t, new Ea());
  return t._offlineComponents;
}
async function Oa(t) {
  return t._onlineComponents || (t._uninitializedComponentsProvider ? (N("FirestoreClient", "Using user provided OnlineComponentProvider"), await ka(t, t._uninitializedComponentsProvider._online)) : (N("FirestoreClient", "Using default OnlineComponentProvider"), await ka(t, new Pa()))), t._onlineComponents;
}
function qa(t) {
  return Oa(t).then((t2) => t2.syncEngine);
}
async function Ka(t) {
  const e = await Oa(t), n = e.eventManager;
  return n.onListen = Gc.bind(null, e.syncEngine), n.onUnlisten = jc.bind(null, e.syncEngine), n;
}
function za(t, e, n = {}) {
  const s = new K();
  return t.asyncQueue.enqueueAndForget(async () => function(t2, e2, n2, s2, i) {
    const r2 = new Va({
      next: (r3) => {
        e2.enqueueAndForget(() => Sc(t2, o));
        const u = r3.docs.has(n2);
        !u && r3.fromCache ? (
          // TODO(dimond): If we're online and the document doesn't
          // exist then we resolve with a doc.exists set to false. If
          // we're offline however, we reject the Promise in this
          // case. Two options: 1) Cache the negative response from
          // the server so we can deliver that even when you're
          // offline 2) Actually reject the Promise in the online case
          // if the document doesn't exist.
          i.reject(new U(q.UNAVAILABLE, "Failed to get document because the client is offline."))
        ) : u && r3.fromCache && s2 && "server" === s2.source ? i.reject(new U(q.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : i.resolve(r3);
      },
      error: (t3) => i.reject(t3)
    }), o = new Nc(Gn(n2.path), r2, {
      includeMetadataChanges: true,
      Ku: true
    });
    return Vc(t2, o);
  }(await Ka(t), t.asyncQueue, e, n, s)), s.promise;
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function th(t) {
  const e = {};
  return void 0 !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const eh = /* @__PURE__ */ new Map();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function nh(t, e, n) {
  if (!n)
    throw new U(q.INVALID_ARGUMENT, `Function ${t}() cannot be called with an empty ${e}.`);
}
function sh(t, e, n, s) {
  if (true === e && true === s)
    throw new U(q.INVALID_ARGUMENT, `${t} and ${n} cannot be used together.`);
}
function ih(t) {
  if (!ht.isDocumentKey(t))
    throw new U(q.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`);
}
function rh(t) {
  if (ht.isDocumentKey(t))
    throw new U(q.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`);
}
function oh(t) {
  if (void 0 === t)
    return "undefined";
  if (null === t)
    return "null";
  if ("string" == typeof t)
    return t.length > 20 && (t = `${t.substring(0, 20)}...`), JSON.stringify(t);
  if ("number" == typeof t || "boolean" == typeof t)
    return "" + t;
  if ("object" == typeof t) {
    if (t instanceof Array)
      return "an array";
    {
      const e = (
        /** try to get the constructor name for an object. */
        function(t2) {
          if (t2.constructor)
            return t2.constructor.name;
          return null;
        }(t)
      );
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return "function" == typeof t ? "a function" : O();
}
function uh(t, e) {
  if ("_delegate" in t && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (t = t._delegate), !(t instanceof e)) {
    if (e.name === t.constructor.name)
      throw new U(q.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const n = oh(t);
      throw new U(q.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
    }
  }
  return t;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ah {
  constructor(t) {
    var e, n;
    if (void 0 === t.host) {
      if (void 0 !== t.ssl)
        throw new U(q.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = "firestore.googleapis.com", this.ssl = true;
    } else
      this.host = t.host, this.ssl = null === (e = t.ssl) || void 0 === e || e;
    if (this.credentials = t.credentials, this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties, this.cache = t.localCache, void 0 === t.cacheSizeBytes)
      this.cacheSizeBytes = 41943040;
    else {
      if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576)
        throw new U(q.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = t.cacheSizeBytes;
    }
    sh("experimentalForceLongPolling", t.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!t.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : void 0 === t.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!t.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = th(null !== (n = t.experimentalLongPollingOptions) && void 0 !== n ? n : {}), function(t2) {
      if (void 0 !== t2.timeoutSeconds) {
        if (isNaN(t2.timeoutSeconds))
          throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t2.timeoutSeconds} (must not be NaN)`);
        if (t2.timeoutSeconds < 5)
          throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t2.timeoutSeconds} (minimum allowed value is 5)`);
        if (t2.timeoutSeconds > 30)
          throw new U(q.INVALID_ARGUMENT, `invalid long polling timeout: ${t2.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!t.useFetchStreams;
  }
  isEqual(t) {
    return this.host === t.host && this.ssl === t.ssl && this.credentials === t.credentials && this.cacheSizeBytes === t.cacheSizeBytes && this.experimentalForceLongPolling === t.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t.experimentalAutoDetectLongPolling && (e = this.experimentalLongPollingOptions, n = t.experimentalLongPollingOptions, e.timeoutSeconds === n.timeoutSeconds) && this.ignoreUndefinedProperties === t.ignoreUndefinedProperties && this.useFetchStreams === t.useFetchStreams;
    var e, n;
  }
}
class hh {
  /** @hideconstructor */
  constructor(t, e, n, s) {
    this._authCredentials = t, this._appCheckCredentials = e, this._databaseId = n, this._app = s, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new ah({}), this._settingsFrozen = false;
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app)
      throw new U(q.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return void 0 !== this._terminateTask;
  }
  _setSettings(t) {
    if (this._settingsFrozen)
      throw new U(q.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new ah(t), void 0 !== t.credentials && (this._authCredentials = function(t2) {
      if (!t2)
        return new Q();
      switch (t2.type) {
        case "firstParty":
          return new H(t2.sessionIndex || "0", t2.iamToken || null, t2.authTokenFactory || null);
        case "provider":
          return t2.client;
        default:
          throw new U(q.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(t.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _freezeSettings() {
    return this._settingsFrozen = true, this._settings;
  }
  _delete() {
    return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function(t) {
      const e = eh.get(t);
      e && (N("ComponentProvider", "Removing Datastore"), eh.delete(t), e.terminate());
    }(this), Promise.resolve();
  }
}
function lh(t, e, n, s = {}) {
  var i;
  const r2 = (t = uh(t, hh))._getSettings(), o = `${e}:${n}`;
  if ("firestore.googleapis.com" !== r2.host && r2.host !== o && M("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), t._setSettings(Object.assign(Object.assign({}, r2), {
    host: o,
    ssl: false
  })), s.mockUserToken) {
    let e2, n2;
    if ("string" == typeof s.mockUserToken)
      e2 = s.mockUserToken, n2 = V.MOCK_USER;
    else {
      e2 = createMockUserToken(s.mockUserToken, null === (i = t._app) || void 0 === i ? void 0 : i.options.projectId);
      const r3 = s.mockUserToken.sub || s.mockUserToken.user_id;
      if (!r3)
        throw new U(q.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      n2 = new V(r3);
    }
    t._authCredentials = new j(new G(e2, n2));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class fh {
  /** @hideconstructor */
  constructor(t, e, n) {
    this.converter = e, this._key = n, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = t;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new wh(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(t) {
    return new fh(this.firestore, t, this._key);
  }
}
class dh {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(t, e, n) {
    this.converter = e, this._query = n, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = t;
  }
  withConverter(t) {
    return new dh(this.firestore, t, this._query);
  }
}
class wh extends dh {
  /** @hideconstructor */
  constructor(t, e, n) {
    super(t, e, Gn(n)), this._path = n, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const t = this._path.popLast();
    return t.isEmpty() ? null : new fh(
      this.firestore,
      /* converter= */
      null,
      new ht(t)
    );
  }
  withConverter(t) {
    return new wh(this.firestore, t, this._path);
  }
}
function _h(t, e, ...n) {
  if (t = getModularInstance(t), nh("collection", "path", e), t instanceof hh) {
    const s = ut.fromString(e, ...n);
    return rh(s), new wh(
      t,
      /* converter= */
      null,
      s
    );
  }
  {
    if (!(t instanceof fh || t instanceof wh))
      throw new U(q.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const s = t._path.child(ut.fromString(e, ...n));
    return rh(s), new wh(
      t.firestore,
      /* converter= */
      null,
      s
    );
  }
}
function gh(t, e, ...n) {
  if (t = getModularInstance(t), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  1 === arguments.length && (e = tt.A()), nh("doc", "path", e), t instanceof hh) {
    const s = ut.fromString(e, ...n);
    return ih(s), new fh(
      t,
      /* converter= */
      null,
      new ht(s)
    );
  }
  {
    if (!(t instanceof fh || t instanceof wh))
      throw new U(q.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const s = t._path.child(ut.fromString(e, ...n));
    return ih(s), new fh(t.firestore, t instanceof wh ? t.converter : null, new ht(s));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ih {
  constructor() {
    this.Gc = Promise.resolve(), // A list of retryable operations. Retryable operations are run in order and
    // retried with backoff.
    this.Qc = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.jc = false, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.zc = [], // visible for testing
    this.Wc = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.Hc = false, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.Jc = false, // List of TimerIds to fast-forward delays for.
    this.Yc = [], // Backoff timer used to schedule retries for retryable operations
    this.qo = new Bu(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.Xc = () => {
      const t2 = Ou();
      t2 && N("AsyncQueue", "Visibility state changed to " + t2.visibilityState), this.qo.Mo();
    };
    const t = Ou();
    t && "function" == typeof t.addEventListener && t.addEventListener("visibilitychange", this.Xc);
  }
  get isShuttingDown() {
    return this.jc;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(t) {
    this.enqueue(t);
  }
  enqueueAndForgetEvenWhileRestricted(t) {
    this.Zc(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.ta(t);
  }
  enterRestrictedMode(t) {
    if (!this.jc) {
      this.jc = true, this.Jc = t || false;
      const e = Ou();
      e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.Xc);
    }
  }
  enqueue(t) {
    if (this.Zc(), this.jc)
      return new Promise(() => {
      });
    const e = new K();
    return this.ta(() => this.jc && this.Jc ? Promise.resolve() : (t().then(e.resolve, e.reject), e.promise)).then(() => e.promise);
  }
  enqueueRetryable(t) {
    this.enqueueAndForget(() => (this.Qc.push(t), this.ea()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async ea() {
    if (0 !== this.Qc.length) {
      try {
        await this.Qc[0](), this.Qc.shift(), this.qo.reset();
      } catch (t) {
        if (!Dt(t))
          throw t;
        N("AsyncQueue", "Operation failed with retryable error: " + t);
      }
      this.Qc.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.qo.No(() => this.ea());
    }
  }
  ta(t) {
    const e = this.Gc.then(() => (this.Hc = true, t().catch((t2) => {
      this.Wc = t2, this.Hc = false;
      const e2 = (
        /**
        * Chrome includes Error.message in Error.stack. Other browsers do not.
        * This returns expected output of message + stack when available.
        * @param error - Error or FirestoreError
        */
        function(t3) {
          let e3 = t3.message || "";
          t3.stack && (e3 = t3.stack.includes(t3.message) ? t3.stack : t3.message + "\n" + t3.stack);
          return e3;
        }(t2)
      );
      throw k("INTERNAL UNHANDLED ERROR: ", e2), t2;
    }).then((t2) => (this.Hc = false, t2))));
    return this.Gc = e, e;
  }
  enqueueAfterDelay(t, e, n) {
    this.Zc(), // Fast-forward delays for timerIds that have been overriden.
    this.Yc.indexOf(t) > -1 && (e = 0);
    const s = Tc.createAndSchedule(this, t, e, n, (t2) => this.na(t2));
    return this.zc.push(s), s;
  }
  Zc() {
    this.Wc && O();
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async sa() {
    let t;
    do {
      t = this.Gc, await t;
    } while (t !== this.Gc);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  ia(t) {
    for (const e of this.zc)
      if (e.timerId === t)
        return true;
    return false;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  ra(t) {
    return this.sa().then(() => {
      this.zc.sort((t2, e) => t2.targetTimeMs - e.targetTimeMs);
      for (const e of this.zc)
        if (e.skipDelay(), "all" !== t && e.timerId === t)
          break;
      return this.sa();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  oa(t) {
    this.Yc.push(t);
  }
  /** Called once a DelayedOperation is run or canceled. */
  na(t) {
    const e = this.zc.indexOf(t);
    this.zc.splice(e, 1);
  }
}
function Th(t) {
  return function(t2, e) {
    if ("object" != typeof t2 || null === t2)
      return false;
    const n = t2;
    for (const t3 of e)
      if (t3 in n && "function" == typeof n[t3])
        return true;
    return false;
  }(t, ["next", "error", "complete"]);
}
class vh extends hh {
  /** @hideconstructor */
  constructor(t, e, n, s) {
    super(t, e, n, s), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new Ih(), this._persistenceKey = (null == s ? void 0 : s.name) || "[DEFAULT]";
  }
  _terminate() {
    return this._firestoreClient || // The client must be initialized to ensure that all subsequent API
    // usage throws an exception.
    Vh(this), this._firestoreClient.terminate();
  }
}
function Ph(e, n) {
  const s = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : n || "(default)", r2 = _getProvider(s, "firestore").getImmediate({
    identifier: i
  });
  if (!r2._initialized) {
    const t = getDefaultEmulatorHostnameAndPort("firestore");
    t && lh(r2, ...t);
  }
  return r2;
}
function bh(t) {
  return t._firestoreClient || Vh(t), t._firestoreClient.verifyNotTerminated(), t._firestoreClient;
}
function Vh(t) {
  var e, n, s;
  const i = t._freezeSettings(), r2 = function(t2, e2, n2, s2) {
    return new $e(t2, e2, n2, s2.host, s2.ssl, s2.experimentalForceLongPolling, s2.experimentalAutoDetectLongPolling, th(s2.experimentalLongPollingOptions), s2.useFetchStreams);
  }(t._databaseId, (null === (e = t._app) || void 0 === e ? void 0 : e.options.appId) || "", t._persistenceKey, i);
  t._firestoreClient = new xa(t._authCredentials, t._appCheckCredentials, t._queue, r2), (null === (n = i.cache) || void 0 === n ? void 0 : n._offlineComponentProvider) && (null === (s = i.cache) || void 0 === s ? void 0 : s._onlineComponentProvider) && (t._firestoreClient._uninitializedComponentsProvider = {
    _offlineKind: i.cache.kind,
    _offline: i.cache._offlineComponentProvider,
    _online: i.cache._onlineComponentProvider
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Uh {
  /** @hideconstructor */
  constructor(t) {
    this._byteString = t;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(t) {
    try {
      return new Uh(Ve.fromBase64String(t));
    } catch (t2) {
      throw new U(q.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t2);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(t) {
    return new Uh(Ve.fromUint8Array(t));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(t) {
    return this._byteString.isEqual(t._byteString);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Kh {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...t) {
    for (let e = 0; e < t.length; ++e)
      if (0 === t[e].length)
        throw new U(q.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new at(t);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(t) {
    return this._internalPath.isEqual(t._internalPath);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qh {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(t) {
    this._methodName = t;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class jh {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(t, e) {
    if (!isFinite(t) || t < -90 || t > 90)
      throw new U(q.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t);
    if (!isFinite(e) || e < -180 || e > 180)
      throw new U(q.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
    this._lat = t, this._long = e;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(t) {
    return this._lat === t._lat && this._long === t._long;
  }
  /** Returns a JSON-serializable representation of this GeoPoint. */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long
    };
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(t) {
    return et(this._lat, t._lat) || et(this._long, t._long);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const zh = /^__.*__$/;
class Wh {
  constructor(t, e, n) {
    this.data = t, this.fieldMask = e, this.fieldTransforms = n;
  }
  toMutation(t, e) {
    return null !== this.fieldMask ? new zs(t, this.data, this.fieldMask, e, this.fieldTransforms) : new js(t, this.data, e, this.fieldTransforms);
  }
}
class Hh {
  constructor(t, e, n) {
    this.data = t, this.fieldMask = e, this.fieldTransforms = n;
  }
  toMutation(t, e) {
    return new zs(t, this.data, this.fieldMask, e, this.fieldTransforms);
  }
}
function Jh(t) {
  switch (t) {
    case 0:
    case 2:
    case 1:
      return true;
    case 3:
    case 4:
      return false;
    default:
      throw O();
  }
}
class Yh {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(t, e, n, s, i, r2) {
    this.settings = t, this.databaseId = e, this.serializer = n, this.ignoreUndefinedProperties = s, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    void 0 === i && this.ua(), this.fieldTransforms = i || [], this.fieldMask = r2 || [];
  }
  get path() {
    return this.settings.path;
  }
  get ca() {
    return this.settings.ca;
  }
  /** Returns a new context with the specified settings overwritten. */
  aa(t) {
    return new Yh(Object.assign(Object.assign({}, this.settings), t), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  ha(t) {
    var e;
    const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.aa({
      path: n,
      la: false
    });
    return s.fa(t), s;
  }
  da(t) {
    var e;
    const n = null === (e = this.path) || void 0 === e ? void 0 : e.child(t), s = this.aa({
      path: n,
      la: false
    });
    return s.ua(), s;
  }
  wa(t) {
    return this.aa({
      path: void 0,
      la: true
    });
  }
  _a(t) {
    return gl(t, this.settings.methodName, this.settings.ma || false, this.path, this.settings.ga);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(t) {
    return void 0 !== this.fieldMask.find((e) => t.isPrefixOf(e)) || void 0 !== this.fieldTransforms.find((e) => t.isPrefixOf(e.field));
  }
  ua() {
    if (this.path)
      for (let t = 0; t < this.path.length; t++)
        this.fa(this.path.get(t));
  }
  fa(t) {
    if (0 === t.length)
      throw this._a("Document fields must not be empty");
    if (Jh(this.ca) && zh.test(t))
      throw this._a('Document fields cannot begin and end with "__"');
  }
}
class Xh {
  constructor(t, e, n) {
    this.databaseId = t, this.ignoreUndefinedProperties = e, this.serializer = n || Fu(t);
  }
  /** Creates a new top-level parse context. */
  ya(t, e, n, s = false) {
    return new Yh({
      ca: t,
      methodName: e,
      ga: n,
      path: at.emptyPath(),
      la: false,
      ma: s
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
}
function Zh(t) {
  const e = t._freezeSettings(), n = Fu(t._databaseId);
  return new Xh(t._databaseId, !!e.ignoreUndefinedProperties, n);
}
function tl(t, e, n, s, i, r2 = {}) {
  const o = t.ya(r2.merge || r2.mergeFields ? 2 : 0, e, n, i);
  dl("Data must be an object, but it was:", o, s);
  const u = ll(s, o);
  let c, a;
  if (r2.merge)
    c = new Re(o.fieldMask), a = o.fieldTransforms;
  else if (r2.mergeFields) {
    const t2 = [];
    for (const s2 of r2.mergeFields) {
      const i2 = wl(e, s2, n);
      if (!o.contains(i2))
        throw new U(q.INVALID_ARGUMENT, `Field '${i2}' is specified in your field mask but missing from your input data.`);
      yl(t2, i2) || t2.push(i2);
    }
    c = new Re(t2), a = o.fieldTransforms.filter((t3) => c.covers(t3.field));
  } else
    c = null, a = o.fieldTransforms;
  return new Wh(new un(u), c, a);
}
class el extends Qh {
  _toFieldTransform(t) {
    if (2 !== t.ca)
      throw 1 === t.ca ? t._a(`${this._methodName}() can only appear at the top level of your update data`) : t._a(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
    return t.fieldMask.push(t.path), null;
  }
  isEqual(t) {
    return t instanceof el;
  }
}
function nl(t, e, n) {
  return new Yh({
    ca: 3,
    ga: e.settings.ga,
    methodName: t._methodName,
    la: n
  }, e.databaseId, e.serializer, e.ignoreUndefinedProperties);
}
class il extends Qh {
  constructor(t, e) {
    super(t), this.pa = e;
  }
  _toFieldTransform(t) {
    const e = nl(
      this,
      t,
      /*array=*/
      true
    ), n = this.pa.map((t2) => hl(t2, e)), s = new Vs(n);
    return new Ms(t.path, s);
  }
  isEqual(t) {
    return this === t;
  }
}
class rl extends Qh {
  constructor(t, e) {
    super(t), this.pa = e;
  }
  _toFieldTransform(t) {
    const e = nl(
      this,
      t,
      /*array=*/
      true
    ), n = this.pa.map((t2) => hl(t2, e)), s = new Ds(n);
    return new Ms(t.path, s);
  }
  isEqual(t) {
    return this === t;
  }
}
function ul(t, e, n, s) {
  const i = t.ya(1, e, n);
  dl("Data must be an object, but it was:", i, s);
  const r2 = [], o = un.empty();
  ge(s, (t2, s2) => {
    const u2 = ml(e, t2, n);
    s2 = getModularInstance(s2);
    const c = i.da(u2);
    if (s2 instanceof el)
      r2.push(u2);
    else {
      const t3 = hl(s2, c);
      null != t3 && (r2.push(u2), o.set(u2, t3));
    }
  });
  const u = new Re(r2);
  return new Hh(o, u, i.fieldTransforms);
}
function cl(t, e, n, s, i, r2) {
  const o = t.ya(1, e, n), u = [wl(e, s, n)], c = [i];
  if (r2.length % 2 != 0)
    throw new U(q.INVALID_ARGUMENT, `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);
  for (let t2 = 0; t2 < r2.length; t2 += 2)
    u.push(wl(e, r2[t2])), c.push(r2[t2 + 1]);
  const a = [], h = un.empty();
  for (let t2 = u.length - 1; t2 >= 0; --t2)
    if (!yl(a, u[t2])) {
      const e2 = u[t2];
      let n2 = c[t2];
      n2 = getModularInstance(n2);
      const s2 = o.da(e2);
      if (n2 instanceof el)
        a.push(e2);
      else {
        const t3 = hl(n2, s2);
        null != t3 && (a.push(e2), h.set(e2, t3));
      }
    }
  const l2 = new Re(a);
  return new Hh(h, l2, o.fieldTransforms);
}
function hl(t, e) {
  if (fl(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    t = getModularInstance(t)
  ))
    return dl("Unsupported field value:", e, t), ll(t, e);
  if (t instanceof Qh)
    return function(t2, e2) {
      if (!Jh(e2.ca))
        throw e2._a(`${t2._methodName}() can only be used with update() and set()`);
      if (!e2.path)
        throw e2._a(`${t2._methodName}() is not currently supported inside arrays`);
      const n = t2._toFieldTransform(e2);
      n && e2.fieldTransforms.push(n);
    }(t, e), null;
  if (void 0 === t && e.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), t instanceof Array
  ) {
    if (e.settings.la && 4 !== e.ca)
      throw e._a("Nested arrays are not supported");
    return function(t2, e2) {
      const n = [];
      let s = 0;
      for (const i of t2) {
        let t3 = hl(i, e2.wa(s));
        null == t3 && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (t3 = {
          nullValue: "NULL_VALUE"
        }), n.push(t3), s++;
      }
      return {
        arrayValue: {
          values: n
        }
      };
    }(t, e);
  }
  return function(t2, e2) {
    if (null === (t2 = getModularInstance(t2)))
      return {
        nullValue: "NULL_VALUE"
      };
    if ("number" == typeof t2)
      return Es(e2.serializer, t2);
    if ("boolean" == typeof t2)
      return {
        booleanValue: t2
      };
    if ("string" == typeof t2)
      return {
        stringValue: t2
      };
    if (t2 instanceof Date) {
      const n = it.fromDate(t2);
      return {
        timestampValue: Di(e2.serializer, n)
      };
    }
    if (t2 instanceof it) {
      const n = new it(t2.seconds, 1e3 * Math.floor(t2.nanoseconds / 1e3));
      return {
        timestampValue: Di(e2.serializer, n)
      };
    }
    if (t2 instanceof jh)
      return {
        geoPointValue: {
          latitude: t2.latitude,
          longitude: t2.longitude
        }
      };
    if (t2 instanceof Uh)
      return {
        bytesValue: Ci(e2.serializer, t2._byteString)
      };
    if (t2 instanceof fh) {
      const n = e2.databaseId, s = t2.firestore._databaseId;
      if (!s.isEqual(n))
        throw e2._a(`Document reference is for database ${s.projectId}/${s.database} but should be for database ${n.projectId}/${n.database}`);
      return {
        referenceValue: ki(t2.firestore._databaseId || e2.databaseId, t2._key.path)
      };
    }
    throw e2._a(`Unsupported field value: ${oh(t2)}`);
  }(t, e);
}
function ll(t, e) {
  const n = {};
  return ye(t) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path)
  ) : ge(t, (t2, s) => {
    const i = hl(s, e.ha(t2));
    null != i && (n[t2] = i);
  }), {
    mapValue: {
      fields: n
    }
  };
}
function fl(t) {
  return !("object" != typeof t || null === t || t instanceof Array || t instanceof Date || t instanceof it || t instanceof jh || t instanceof Uh || t instanceof fh || t instanceof Qh);
}
function dl(t, e, n) {
  if (!fl(n) || !function(t2) {
    return "object" == typeof t2 && null !== t2 && (Object.getPrototypeOf(t2) === Object.prototype || null === Object.getPrototypeOf(t2));
  }(n)) {
    const s = oh(n);
    throw "an object" === s ? e._a(t + " a custom object") : e._a(t + " " + s);
  }
}
function wl(t, e, n) {
  if (
    // If required, replace the FieldPath Compat class with with the firestore-exp
    // FieldPath.
    (e = getModularInstance(e)) instanceof Kh
  )
    return e._internalPath;
  if ("string" == typeof e)
    return ml(t, e);
  throw gl(
    "Field path arguments must be of type string or ",
    t,
    /* hasConverter= */
    false,
    /* path= */
    void 0,
    n
  );
}
const _l = new RegExp("[~\\*/\\[\\]]");
function ml(t, e, n) {
  if (e.search(_l) >= 0)
    throw gl(
      `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
      t,
      /* hasConverter= */
      false,
      /* path= */
      void 0,
      n
    );
  try {
    return new Kh(...e.split("."))._internalPath;
  } catch (s) {
    throw gl(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      t,
      /* hasConverter= */
      false,
      /* path= */
      void 0,
      n
    );
  }
}
function gl(t, e, n, s, i) {
  const r2 = s && !s.isEmpty(), o = void 0 !== i;
  let u = `Function ${e}() called with invalid data`;
  n && (u += " (via `toFirestore()`)"), u += ". ";
  let c = "";
  return (r2 || o) && (c += " (found", r2 && (c += ` in field ${s}`), o && (c += ` in document ${i}`), c += ")"), new U(q.INVALID_ARGUMENT, u + t + c);
}
function yl(t, e) {
  return t.some((t2) => t2.isEqual(e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class pl {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(t, e, n, s, i) {
    this._firestore = t, this._userDataWriter = e, this._key = n, this._document = s, this._converter = i;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new fh(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return null !== this._document;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const t = new Il(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(t);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(t) {
    if (this._document) {
      const e = this._document.data.field(Tl("DocumentSnapshot.get", t));
      if (null !== e)
        return this._userDataWriter.convertValue(e);
    }
  }
}
class Il extends pl {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
}
function Tl(t, e) {
  return "string" == typeof e ? ml(t, e) : e instanceof Kh ? e._internalPath : e._delegate._internalPath;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function El(t) {
  if ("L" === t.limitType && 0 === t.explicitOrderBy.length)
    throw new U(q.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
class Wl {
  convertValue(t, e = "none") {
    switch (Le(t)) {
      case 0:
        return null;
      case 1:
        return t.booleanValue;
      case 2:
        return Ce(t.integerValue || t.doubleValue);
      case 3:
        return this.convertTimestamp(t.timestampValue);
      case 4:
        return this.convertServerTimestamp(t, e);
      case 5:
        return t.stringValue;
      case 6:
        return this.convertBytes(xe(t.bytesValue));
      case 7:
        return this.convertReference(t.referenceValue);
      case 8:
        return this.convertGeoPoint(t.geoPointValue);
      case 9:
        return this.convertArray(t.arrayValue, e);
      case 10:
        return this.convertObject(t.mapValue, e);
      default:
        throw O();
    }
  }
  convertObject(t, e) {
    return this.convertObjectMap(t.fields, e);
  }
  /**
   * @internal
   */
  convertObjectMap(t, e = "none") {
    const n = {};
    return ge(t, (t2, s) => {
      n[t2] = this.convertValue(s, e);
    }), n;
  }
  convertGeoPoint(t) {
    return new jh(Ce(t.latitude), Ce(t.longitude));
  }
  convertArray(t, e) {
    return (t.values || []).map((t2) => this.convertValue(t2, e));
  }
  convertServerTimestamp(t, e) {
    switch (e) {
      case "previous":
        const n = ke(t);
        return null == n ? null : this.convertValue(n, e);
      case "estimate":
        return this.convertTimestamp(Me(t));
      default:
        return null;
    }
  }
  convertTimestamp(t) {
    const e = De(t);
    return new it(e.seconds, e.nanos);
  }
  convertDocumentKey(t, e) {
    const n = ut.fromString(t);
    F(ur(n));
    const s = new Oe(n.get(1), n.get(3)), i = new ht(n.popFirst(5));
    return s.isEqual(e) || // TODO(b/64130202): Somehow support foreign references.
    k(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), i;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Hl(t, e, n) {
  let s;
  return s = t ? n && (n.merge || n.mergeFields) ? t.toFirestore(e, n) : t.toFirestore(e) : e, s;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class nf {
  /** @hideconstructor */
  constructor(t, e) {
    this.hasPendingWrites = t, this.fromCache = e;
  }
  /**
   * Returns true if this `SnapshotMetadata` is equal to the provided one.
   *
   * @param other - The `SnapshotMetadata` to compare against.
   * @returns true if this `SnapshotMetadata` is equal to the provided one.
   */
  isEqual(t) {
    return this.hasPendingWrites === t.hasPendingWrites && this.fromCache === t.fromCache;
  }
}
class sf extends pl {
  /** @hideconstructor protected */
  constructor(t, e, n, s, i, r2) {
    super(t, e, n, s, r2), this._firestore = t, this._firestoreImpl = t, this.metadata = i;
  }
  /**
   * Returns whether or not the data exists. True if the document exists.
   */
  exists() {
    return super.exists();
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document or `undefined` if
   * the document doesn't exist.
   */
  data(t = {}) {
    if (this._document) {
      if (this._converter) {
        const e = new rf(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e, t);
      }
      return this._userDataWriter.convertValue(this._document.data.value, t.serverTimestamps);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @param options - An options object to configure how the field is retrieved
   * from the snapshot (for example the desired behavior for server timestamps
   * that have not yet been set to their final value).
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(t, e = {}) {
    if (this._document) {
      const n = this._document.data.field(Tl("DocumentSnapshot.get", t));
      if (null !== n)
        return this._userDataWriter.convertValue(n, e.serverTimestamps);
    }
  }
}
class rf extends sf {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document.
   */
  data(t = {}) {
    return super.data(t);
  }
}
class of {
  /** @hideconstructor */
  constructor(t, e, n, s) {
    this._firestore = t, this._userDataWriter = e, this._snapshot = s, this.metadata = new nf(s.hasPendingWrites, s.fromCache), this.query = n;
  }
  /** An array of all the documents in the `QuerySnapshot`. */
  get docs() {
    const t = [];
    return this.forEach((e) => t.push(e)), t;
  }
  /** The number of documents in the `QuerySnapshot`. */
  get size() {
    return this._snapshot.docs.size;
  }
  /** True if there are no documents in the `QuerySnapshot`. */
  get empty() {
    return 0 === this.size;
  }
  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg - The `this` binding for the callback.
   */
  forEach(t, e) {
    this._snapshot.docs.forEach((n) => {
      t.call(e, new rf(this._firestore, this._userDataWriter, n.key, n, new nf(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
    });
  }
  /**
   * Returns an array of the documents changes since the last snapshot. If this
   * is the first snapshot, all documents will be in the list as 'added'
   * changes.
   *
   * @param options - `SnapshotListenOptions` that control whether metadata-only
   * changes (i.e. only `DocumentSnapshot.metadata` changed) should trigger
   * snapshot events.
   */
  docChanges(t = {}) {
    const e = !!t.includeMetadataChanges;
    if (e && this._snapshot.excludesMetadataChanges)
      throw new U(q.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
    return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = /** Calculates the array of `DocumentChange`s for a given `ViewSnapshot`. */
    function(t2, e2) {
      if (t2._snapshot.oldDocs.isEmpty()) {
        let e3 = 0;
        return t2._snapshot.docChanges.map((n) => {
          const s = new rf(t2._firestore, t2._userDataWriter, n.doc.key, n.doc, new nf(t2._snapshot.mutatedKeys.has(n.doc.key), t2._snapshot.fromCache), t2.query.converter);
          return n.doc, {
            type: "added",
            doc: s,
            oldIndex: -1,
            newIndex: e3++
          };
        });
      }
      {
        let n = t2._snapshot.oldDocs;
        return t2._snapshot.docChanges.filter((t3) => e2 || 3 !== t3.type).map((e3) => {
          const s = new rf(t2._firestore, t2._userDataWriter, e3.doc.key, e3.doc, new nf(t2._snapshot.mutatedKeys.has(e3.doc.key), t2._snapshot.fromCache), t2.query.converter);
          let i = -1, r2 = -1;
          return 0 !== e3.type && (i = n.indexOf(e3.doc.key), n = n.delete(e3.doc.key)), 1 !== e3.type && (n = n.add(e3.doc), r2 = n.indexOf(e3.doc.key)), {
            type: uf(e3.type),
            doc: s,
            oldIndex: i,
            newIndex: r2
          };
        });
      }
    }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
  }
}
function uf(t) {
  switch (t) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return O();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function af(t) {
  t = uh(t, fh);
  const e = uh(t.firestore, vh);
  return za(bh(e), t._key).then((n) => Af(e, t, n));
}
class hf extends Wl {
  constructor(t) {
    super(), this.firestore = t;
  }
  convertBytes(t) {
    return new Uh(t);
  }
  convertReference(t) {
    const e = this.convertDocumentKey(t, this.firestore._databaseId);
    return new fh(
      this.firestore,
      /* converter= */
      null,
      e
    );
  }
}
function gf(t, e, n, ...s) {
  t = uh(t, fh);
  const i = uh(t.firestore, vh), r2 = Zh(i);
  let o;
  o = "string" == typeof // For Compat types, we have to "extract" the underlying types before
  // performing validation.
  (e = getModularInstance(e)) || e instanceof Kh ? cl(r2, "updateDoc", t._key, e, n, s) : ul(r2, "updateDoc", t._key, e);
  return Ef(i, [o.toMutation(t._key, Fs.exists(true))]);
}
function yf(t) {
  return Ef(uh(t.firestore, vh), [new Ys(t._key, Fs.none())]);
}
function pf(t, e) {
  const n = uh(t.firestore, vh), s = gh(t), i = Hl(t.converter, e);
  return Ef(n, [tl(Zh(t.firestore), "addDoc", s._key, i, null !== t.converter, {}).toMutation(s._key, Fs.exists(false))]).then(() => s);
}
function If(t, ...e) {
  var n, s, i;
  t = getModularInstance(t);
  let r2 = {
    includeMetadataChanges: false
  }, o = 0;
  "object" != typeof e[o] || Th(e[o]) || (r2 = e[o], o++);
  const u = {
    includeMetadataChanges: r2.includeMetadataChanges
  };
  if (Th(e[o])) {
    const t2 = e[o];
    e[o] = null === (n = t2.next) || void 0 === n ? void 0 : n.bind(t2), e[o + 1] = null === (s = t2.error) || void 0 === s ? void 0 : s.bind(t2), e[o + 2] = null === (i = t2.complete) || void 0 === i ? void 0 : i.bind(t2);
  }
  let c, a, h;
  if (t instanceof fh)
    a = uh(t.firestore, vh), h = Gn(t._key.path), c = {
      next: (n2) => {
        e[o] && e[o](Af(a, t, n2));
      },
      error: e[o + 1],
      complete: e[o + 2]
    };
  else {
    const n2 = uh(t, dh);
    a = uh(n2.firestore, vh), h = n2._query;
    const s2 = new hf(a);
    c = {
      next: (t2) => {
        e[o] && e[o](new of(a, s2, n2, t2));
      },
      error: e[o + 1],
      complete: e[o + 2]
    }, El(t._query);
  }
  return function(t2, e2, n2, s2) {
    const i2 = new Va(s2), r3 = new Nc(e2, i2, n2);
    return t2.asyncQueue.enqueueAndForget(async () => Vc(await Ka(t2), r3)), () => {
      i2.Dc(), t2.asyncQueue.enqueueAndForget(async () => Sc(await Ka(t2), r3));
    };
  }(bh(a), h, u, c);
}
function Ef(t, e) {
  return function(t2, e2) {
    const n = new K();
    return t2.asyncQueue.enqueueAndForget(async () => zc(await qa(t2), e2, n)), n.promise;
  }(bh(t), e);
}
function Af(t, e, n) {
  const s = n.docs.get(e._key), i = new hf(t);
  return new sf(t, i, e._key, s, new nf(n.hasPendingWrites, n.fromCache), e.converter);
}
function Qf(...t) {
  return new il("arrayUnion", t);
}
function jf(...t) {
  return new rl("arrayRemove", t);
}
!function(t, e = true) {
  !function(t2) {
    S = t2;
  }(SDK_VERSION), _registerComponent(new Component("firestore", (t2, { instanceIdentifier: n, options: s }) => {
    const i = t2.getProvider("app").getImmediate(), r2 = new vh(new z(t2.getProvider("auth-internal")), new Y(t2.getProvider("app-check-internal")), function(t3, e2) {
      if (!Object.prototype.hasOwnProperty.apply(t3.options, ["projectId"]))
        throw new U(q.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new Oe(t3.options.projectId, e2);
    }(i, n), i);
    return s = Object.assign({
      useFetchStreams: e
    }, s), r2._setSettings(s), r2;
  }, "PUBLIC").setMultipleInstances(true)), registerVersion(b, "3.13.0", t), // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
  registerVersion(b, "3.13.0", "esm2017");
}();
function __rest(s, e) {
  var t = {};
  for (var p2 in s)
    if (Object.prototype.hasOwnProperty.call(s, p2) && e.indexOf(p2) < 0)
      t[p2] = s[p2];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p2 = Object.getOwnPropertySymbols(s); i < p2.length; i++) {
      if (e.indexOf(p2[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p2[i]))
        t[p2[i]] = s[p2[i]];
    }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function _prodErrorMap() {
  return {
    [
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    ]: "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."
  };
}
const prodErrorMap = _prodErrorMap;
const _DEFAULT_AUTH_ERROR_FACTORY = new ErrorFactory("auth", "Firebase", _prodErrorMap());
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const logClient = new Logger("@firebase/auth");
function _logWarn(msg, ...args) {
  if (logClient.logLevel <= LogLevel.WARN) {
    logClient.warn(`Auth (${SDK_VERSION}): ${msg}`, ...args);
  }
}
function _logError(msg, ...args) {
  if (logClient.logLevel <= LogLevel.ERROR) {
    logClient.error(`Auth (${SDK_VERSION}): ${msg}`, ...args);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _fail(authOrCode, ...rest) {
  throw createErrorInternal(authOrCode, ...rest);
}
function _createError(authOrCode, ...rest) {
  return createErrorInternal(authOrCode, ...rest);
}
function _errorWithCustomMessage(auth2, code, message) {
  const errorMap = Object.assign(Object.assign({}, prodErrorMap()), { [code]: message });
  const factory = new ErrorFactory("auth", "Firebase", errorMap);
  return factory.create(code, {
    appName: auth2.name
  });
}
function _assertInstanceOf(auth2, object, instance) {
  const constructorInstance = instance;
  if (!(object instanceof constructorInstance)) {
    if (constructorInstance.name !== object.constructor.name) {
      _fail(
        auth2,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      );
    }
    throw _errorWithCustomMessage(auth2, "argument-error", `Type of ${object.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`);
  }
}
function createErrorInternal(authOrCode, ...rest) {
  if (typeof authOrCode !== "string") {
    const code = rest[0];
    const fullParams = [...rest.slice(1)];
    if (fullParams[0]) {
      fullParams[0].appName = authOrCode.name;
    }
    return authOrCode._errorFactory.create(code, ...fullParams);
  }
  return _DEFAULT_AUTH_ERROR_FACTORY.create(authOrCode, ...rest);
}
function _assert(assertion, authOrCode, ...rest) {
  if (!assertion) {
    throw createErrorInternal(authOrCode, ...rest);
  }
}
function debugFail(failure) {
  const message = `INTERNAL ASSERTION FAILED: ` + failure;
  _logError(message);
  throw new Error(message);
}
function debugAssert(assertion, message) {
  if (!assertion) {
    debugFail(message);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _getCurrentUrl() {
  var _a;
  return typeof self !== "undefined" && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.href) || "";
}
function _isHttpOrHttps() {
  return _getCurrentScheme() === "http:" || _getCurrentScheme() === "https:";
}
function _getCurrentScheme() {
  var _a;
  return typeof self !== "undefined" && ((_a = self.location) === null || _a === void 0 ? void 0 : _a.protocol) || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _isOnline() {
  if (typeof navigator !== "undefined" && navigator && "onLine" in navigator && typeof navigator.onLine === "boolean" && // Apply only for traditional web apps and Chrome extensions.
  // This is especially true for Cordova apps which have unreliable
  // navigator.onLine behavior unless cordova-plugin-network-information is
  // installed which overwrites the native navigator.onLine value and
  // defines navigator.connection.
  (_isHttpOrHttps() || isBrowserExtension() || "connection" in navigator)) {
    return navigator.onLine;
  }
  return true;
}
function _getUserLanguage() {
  if (typeof navigator === "undefined") {
    return null;
  }
  const navigatorLanguage = navigator;
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    navigatorLanguage.languages && navigatorLanguage.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    navigatorLanguage.language || // Couldn't determine language.
    null
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Delay {
  constructor(shortDelay, longDelay) {
    this.shortDelay = shortDelay;
    this.longDelay = longDelay;
    debugAssert(longDelay > shortDelay, "Short delay should be less than long delay!");
    this.isMobile = isMobileCordova() || isReactNative();
  }
  get() {
    if (!_isOnline()) {
      return Math.min(5e3, this.shortDelay);
    }
    return this.isMobile ? this.longDelay : this.shortDelay;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _emulatorUrl(config, path) {
  debugAssert(config.emulator, "Emulator should always be set here");
  const { url } = config.emulator;
  if (!path) {
    return url;
  }
  return `${url}${path.startsWith("/") ? path.slice(1) : path}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FetchProvider {
  static initialize(fetchImpl, headersImpl, responseImpl) {
    this.fetchImpl = fetchImpl;
    if (headersImpl) {
      this.headersImpl = headersImpl;
    }
    if (responseImpl) {
      this.responseImpl = responseImpl;
    }
  }
  static fetch() {
    if (this.fetchImpl) {
      return this.fetchImpl;
    }
    if (typeof self !== "undefined" && "fetch" in self) {
      return self.fetch;
    }
    debugFail("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static headers() {
    if (this.headersImpl) {
      return this.headersImpl;
    }
    if (typeof self !== "undefined" && "Headers" in self) {
      return self.Headers;
    }
    debugFail("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static response() {
    if (this.responseImpl) {
      return this.responseImpl;
    }
    if (typeof self !== "undefined" && "Response" in self) {
      return self.Response;
    }
    debugFail("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const SERVER_ERROR_MAP = {
  // Custom token errors.
  [
    "CREDENTIAL_MISMATCH"
    /* ServerError.CREDENTIAL_MISMATCH */
  ]: "custom-token-mismatch",
  // This can only happen if the SDK sends a bad request.
  [
    "MISSING_CUSTOM_TOKEN"
    /* ServerError.MISSING_CUSTOM_TOKEN */
  ]: "internal-error",
  // Create Auth URI errors.
  [
    "INVALID_IDENTIFIER"
    /* ServerError.INVALID_IDENTIFIER */
  ]: "invalid-email",
  // This can only happen if the SDK sends a bad request.
  [
    "MISSING_CONTINUE_URI"
    /* ServerError.MISSING_CONTINUE_URI */
  ]: "internal-error",
  // Sign in with email and password errors (some apply to sign up too).
  [
    "INVALID_PASSWORD"
    /* ServerError.INVALID_PASSWORD */
  ]: "wrong-password",
  // This can only happen if the SDK sends a bad request.
  [
    "MISSING_PASSWORD"
    /* ServerError.MISSING_PASSWORD */
  ]: "missing-password",
  // Sign up with email and password errors.
  [
    "EMAIL_EXISTS"
    /* ServerError.EMAIL_EXISTS */
  ]: "email-already-in-use",
  [
    "PASSWORD_LOGIN_DISABLED"
    /* ServerError.PASSWORD_LOGIN_DISABLED */
  ]: "operation-not-allowed",
  // Verify assertion for sign in with credential errors:
  [
    "INVALID_IDP_RESPONSE"
    /* ServerError.INVALID_IDP_RESPONSE */
  ]: "invalid-credential",
  [
    "INVALID_PENDING_TOKEN"
    /* ServerError.INVALID_PENDING_TOKEN */
  ]: "invalid-credential",
  [
    "FEDERATED_USER_ID_ALREADY_LINKED"
    /* ServerError.FEDERATED_USER_ID_ALREADY_LINKED */
  ]: "credential-already-in-use",
  // This can only happen if the SDK sends a bad request.
  [
    "MISSING_REQ_TYPE"
    /* ServerError.MISSING_REQ_TYPE */
  ]: "internal-error",
  // Send Password reset email errors:
  [
    "EMAIL_NOT_FOUND"
    /* ServerError.EMAIL_NOT_FOUND */
  ]: "user-not-found",
  [
    "RESET_PASSWORD_EXCEED_LIMIT"
    /* ServerError.RESET_PASSWORD_EXCEED_LIMIT */
  ]: "too-many-requests",
  [
    "EXPIRED_OOB_CODE"
    /* ServerError.EXPIRED_OOB_CODE */
  ]: "expired-action-code",
  [
    "INVALID_OOB_CODE"
    /* ServerError.INVALID_OOB_CODE */
  ]: "invalid-action-code",
  // This can only happen if the SDK sends a bad request.
  [
    "MISSING_OOB_CODE"
    /* ServerError.MISSING_OOB_CODE */
  ]: "internal-error",
  // Operations that require ID token in request:
  [
    "CREDENTIAL_TOO_OLD_LOGIN_AGAIN"
    /* ServerError.CREDENTIAL_TOO_OLD_LOGIN_AGAIN */
  ]: "requires-recent-login",
  [
    "INVALID_ID_TOKEN"
    /* ServerError.INVALID_ID_TOKEN */
  ]: "invalid-user-token",
  [
    "TOKEN_EXPIRED"
    /* ServerError.TOKEN_EXPIRED */
  ]: "user-token-expired",
  [
    "USER_NOT_FOUND"
    /* ServerError.USER_NOT_FOUND */
  ]: "user-token-expired",
  // Other errors.
  [
    "TOO_MANY_ATTEMPTS_TRY_LATER"
    /* ServerError.TOO_MANY_ATTEMPTS_TRY_LATER */
  ]: "too-many-requests",
  // Phone Auth related errors.
  [
    "INVALID_CODE"
    /* ServerError.INVALID_CODE */
  ]: "invalid-verification-code",
  [
    "INVALID_SESSION_INFO"
    /* ServerError.INVALID_SESSION_INFO */
  ]: "invalid-verification-id",
  [
    "INVALID_TEMPORARY_PROOF"
    /* ServerError.INVALID_TEMPORARY_PROOF */
  ]: "invalid-credential",
  [
    "MISSING_SESSION_INFO"
    /* ServerError.MISSING_SESSION_INFO */
  ]: "missing-verification-id",
  [
    "SESSION_EXPIRED"
    /* ServerError.SESSION_EXPIRED */
  ]: "code-expired",
  // Other action code errors when additional settings passed.
  // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
  // This is OK as this error will be caught by client side validation.
  [
    "MISSING_ANDROID_PACKAGE_NAME"
    /* ServerError.MISSING_ANDROID_PACKAGE_NAME */
  ]: "missing-android-pkg-name",
  [
    "UNAUTHORIZED_DOMAIN"
    /* ServerError.UNAUTHORIZED_DOMAIN */
  ]: "unauthorized-continue-uri",
  // getProjectConfig errors when clientId is passed.
  [
    "INVALID_OAUTH_CLIENT_ID"
    /* ServerError.INVALID_OAUTH_CLIENT_ID */
  ]: "invalid-oauth-client-id",
  // User actions (sign-up or deletion) disabled errors.
  [
    "ADMIN_ONLY_OPERATION"
    /* ServerError.ADMIN_ONLY_OPERATION */
  ]: "admin-restricted-operation",
  // Multi factor related errors.
  [
    "INVALID_MFA_PENDING_CREDENTIAL"
    /* ServerError.INVALID_MFA_PENDING_CREDENTIAL */
  ]: "invalid-multi-factor-session",
  [
    "MFA_ENROLLMENT_NOT_FOUND"
    /* ServerError.MFA_ENROLLMENT_NOT_FOUND */
  ]: "multi-factor-info-not-found",
  [
    "MISSING_MFA_ENROLLMENT_ID"
    /* ServerError.MISSING_MFA_ENROLLMENT_ID */
  ]: "missing-multi-factor-info",
  [
    "MISSING_MFA_PENDING_CREDENTIAL"
    /* ServerError.MISSING_MFA_PENDING_CREDENTIAL */
  ]: "missing-multi-factor-session",
  [
    "SECOND_FACTOR_EXISTS"
    /* ServerError.SECOND_FACTOR_EXISTS */
  ]: "second-factor-already-in-use",
  [
    "SECOND_FACTOR_LIMIT_EXCEEDED"
    /* ServerError.SECOND_FACTOR_LIMIT_EXCEEDED */
  ]: "maximum-second-factor-count-exceeded",
  // Blocking functions related errors.
  [
    "BLOCKING_FUNCTION_ERROR_RESPONSE"
    /* ServerError.BLOCKING_FUNCTION_ERROR_RESPONSE */
  ]: "internal-error",
  // Recaptcha related errors.
  [
    "RECAPTCHA_NOT_ENABLED"
    /* ServerError.RECAPTCHA_NOT_ENABLED */
  ]: "recaptcha-not-enabled",
  [
    "MISSING_RECAPTCHA_TOKEN"
    /* ServerError.MISSING_RECAPTCHA_TOKEN */
  ]: "missing-recaptcha-token",
  [
    "INVALID_RECAPTCHA_TOKEN"
    /* ServerError.INVALID_RECAPTCHA_TOKEN */
  ]: "invalid-recaptcha-token",
  [
    "INVALID_RECAPTCHA_ACTION"
    /* ServerError.INVALID_RECAPTCHA_ACTION */
  ]: "invalid-recaptcha-action",
  [
    "MISSING_CLIENT_TYPE"
    /* ServerError.MISSING_CLIENT_TYPE */
  ]: "missing-client-type",
  [
    "MISSING_RECAPTCHA_VERSION"
    /* ServerError.MISSING_RECAPTCHA_VERSION */
  ]: "missing-recaptcha-version",
  [
    "INVALID_RECAPTCHA_VERSION"
    /* ServerError.INVALID_RECAPTCHA_VERSION */
  ]: "invalid-recaptcha-version",
  [
    "INVALID_REQ_TYPE"
    /* ServerError.INVALID_REQ_TYPE */
  ]: "invalid-req-type"
  /* AuthErrorCode.INVALID_REQ_TYPE */
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_API_TIMEOUT_MS = new Delay(3e4, 6e4);
function _addTidIfNecessary(auth2, request) {
  if (auth2.tenantId && !request.tenantId) {
    return Object.assign(Object.assign({}, request), { tenantId: auth2.tenantId });
  }
  return request;
}
async function _performApiRequest(auth2, method, path, request, customErrorMap = {}) {
  return _performFetchWithErrorHandling(auth2, customErrorMap, async () => {
    let body = {};
    let params = {};
    if (request) {
      if (method === "GET") {
        params = request;
      } else {
        body = {
          body: JSON.stringify(request)
        };
      }
    }
    const query = querystring(Object.assign({ key: auth2.config.apiKey }, params)).slice(1);
    const headers = await auth2._getAdditionalHeaders();
    headers[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/json";
    if (auth2.languageCode) {
      headers[
        "X-Firebase-Locale"
        /* HttpHeader.X_FIREBASE_LOCALE */
      ] = auth2.languageCode;
    }
    return FetchProvider.fetch()(_getFinalTarget(auth2, auth2.config.apiHost, path, query), Object.assign({
      method,
      headers,
      referrerPolicy: "no-referrer"
    }, body));
  });
}
async function _performFetchWithErrorHandling(auth2, customErrorMap, fetchFn) {
  auth2._canInitEmulator = false;
  const errorMap = Object.assign(Object.assign({}, SERVER_ERROR_MAP), customErrorMap);
  try {
    const networkTimeout = new NetworkTimeout(auth2);
    const response = await Promise.race([
      fetchFn(),
      networkTimeout.promise
    ]);
    networkTimeout.clearNetworkTimeout();
    const json = await response.json();
    if ("needConfirmation" in json) {
      throw _makeTaggedError(auth2, "account-exists-with-different-credential", json);
    }
    if (response.ok && !("errorMessage" in json)) {
      return json;
    } else {
      const errorMessage = response.ok ? json.errorMessage : json.error.message;
      const [serverErrorCode, serverErrorMessage] = errorMessage.split(" : ");
      if (serverErrorCode === "FEDERATED_USER_ID_ALREADY_LINKED") {
        throw _makeTaggedError(auth2, "credential-already-in-use", json);
      } else if (serverErrorCode === "EMAIL_EXISTS") {
        throw _makeTaggedError(auth2, "email-already-in-use", json);
      } else if (serverErrorCode === "USER_DISABLED") {
        throw _makeTaggedError(auth2, "user-disabled", json);
      }
      const authError = errorMap[serverErrorCode] || serverErrorCode.toLowerCase().replace(/[_\s]+/g, "-");
      if (serverErrorMessage) {
        throw _errorWithCustomMessage(auth2, authError, serverErrorMessage);
      } else {
        _fail(auth2, authError);
      }
    }
  } catch (e) {
    if (e instanceof FirebaseError) {
      throw e;
    }
    _fail(auth2, "network-request-failed", { "message": String(e) });
  }
}
async function _performSignInRequest(auth2, method, path, request, customErrorMap = {}) {
  const serverResponse = await _performApiRequest(auth2, method, path, request, customErrorMap);
  if ("mfaPendingCredential" in serverResponse) {
    _fail(auth2, "multi-factor-auth-required", {
      _serverResponse: serverResponse
    });
  }
  return serverResponse;
}
function _getFinalTarget(auth2, host, path, query) {
  const base = `${host}${path}?${query}`;
  if (!auth2.config.emulator) {
    return `${auth2.config.apiScheme}://${base}`;
  }
  return _emulatorUrl(auth2.config, base);
}
class NetworkTimeout {
  constructor(auth2) {
    this.auth = auth2;
    this.timer = null;
    this.promise = new Promise((_, reject) => {
      this.timer = setTimeout(() => {
        return reject(_createError(
          this.auth,
          "network-request-failed"
          /* AuthErrorCode.NETWORK_REQUEST_FAILED */
        ));
      }, DEFAULT_API_TIMEOUT_MS.get());
    });
  }
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
}
function _makeTaggedError(auth2, code, response) {
  const errorParams = {
    appName: auth2.name
  };
  if (response.email) {
    errorParams.email = response.email;
  }
  if (response.phoneNumber) {
    errorParams.phoneNumber = response.phoneNumber;
  }
  const error = _createError(auth2, code, errorParams);
  error.customData._tokenResponse = response;
  return error;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function deleteAccount(auth2, request) {
  return _performApiRequest(auth2, "POST", "/v1/accounts:delete", request);
}
async function getAccountInfo(auth2, request) {
  return _performApiRequest(auth2, "POST", "/v1/accounts:lookup", request);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function utcTimestampToDateString(utcTimestamp) {
  if (!utcTimestamp) {
    return void 0;
  }
  try {
    const date = new Date(Number(utcTimestamp));
    if (!isNaN(date.getTime())) {
      return date.toUTCString();
    }
  } catch (e) {
  }
  return void 0;
}
async function getIdTokenResult(user, forceRefresh = false) {
  const userInternal = getModularInstance(user);
  const token = await userInternal.getIdToken(forceRefresh);
  const claims = _parseToken(token);
  _assert(
    claims && claims.exp && claims.auth_time && claims.iat,
    userInternal.auth,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const firebase = typeof claims.firebase === "object" ? claims.firebase : void 0;
  const signInProvider = firebase === null || firebase === void 0 ? void 0 : firebase["sign_in_provider"];
  return {
    claims,
    token,
    authTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.auth_time)),
    issuedAtTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.iat)),
    expirationTime: utcTimestampToDateString(secondsStringToMilliseconds(claims.exp)),
    signInProvider: signInProvider || null,
    signInSecondFactor: (firebase === null || firebase === void 0 ? void 0 : firebase["sign_in_second_factor"]) || null
  };
}
function secondsStringToMilliseconds(seconds) {
  return Number(seconds) * 1e3;
}
function _parseToken(token) {
  const [algorithm, payload, signature] = token.split(".");
  if (algorithm === void 0 || payload === void 0 || signature === void 0) {
    _logError("JWT malformed, contained fewer than 3 sections");
    return null;
  }
  try {
    const decoded = base64Decode(payload);
    if (!decoded) {
      _logError("Failed to decode base64 JWT payload");
      return null;
    }
    return JSON.parse(decoded);
  } catch (e) {
    _logError("Caught error parsing JWT payload as JSON", e === null || e === void 0 ? void 0 : e.toString());
    return null;
  }
}
function _tokenExpiresIn(token) {
  const parsedToken = _parseToken(token);
  _assert(
    parsedToken,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  _assert(
    typeof parsedToken.exp !== "undefined",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  _assert(
    typeof parsedToken.iat !== "undefined",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  return Number(parsedToken.exp) - Number(parsedToken.iat);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _logoutIfInvalidated(user, promise, bypassAuthState = false) {
  if (bypassAuthState) {
    return promise;
  }
  try {
    return await promise;
  } catch (e) {
    if (e instanceof FirebaseError && isUserInvalidated(e)) {
      if (user.auth.currentUser === user) {
        await user.auth.signOut();
      }
    }
    throw e;
  }
}
function isUserInvalidated({ code }) {
  return code === `auth/${"user-disabled"}` || code === `auth/${"user-token-expired"}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ProactiveRefresh {
  constructor(user) {
    this.user = user;
    this.isRunning = false;
    this.timerId = null;
    this.errorBackoff = 3e4;
  }
  _start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.schedule();
  }
  _stop() {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
    }
  }
  getInterval(wasError) {
    var _a;
    if (wasError) {
      const interval = this.errorBackoff;
      this.errorBackoff = Math.min(
        this.errorBackoff * 2,
        96e4
        /* Duration.RETRY_BACKOFF_MAX */
      );
      return interval;
    } else {
      this.errorBackoff = 3e4;
      const expTime = (_a = this.user.stsTokenManager.expirationTime) !== null && _a !== void 0 ? _a : 0;
      const interval = expTime - Date.now() - 3e5;
      return Math.max(0, interval);
    }
  }
  schedule(wasError = false) {
    if (!this.isRunning) {
      return;
    }
    const interval = this.getInterval(wasError);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, interval);
  }
  async iteration() {
    try {
      await this.user.getIdToken(true);
    } catch (e) {
      if ((e === null || e === void 0 ? void 0 : e.code) === `auth/${"network-request-failed"}`) {
        this.schedule(
          /* wasError */
          true
        );
      }
      return;
    }
    this.schedule();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class UserMetadata {
  constructor(createdAt, lastLoginAt) {
    this.createdAt = createdAt;
    this.lastLoginAt = lastLoginAt;
    this._initializeTime();
  }
  _initializeTime() {
    this.lastSignInTime = utcTimestampToDateString(this.lastLoginAt);
    this.creationTime = utcTimestampToDateString(this.createdAt);
  }
  _copy(metadata) {
    this.createdAt = metadata.createdAt;
    this.lastLoginAt = metadata.lastLoginAt;
    this._initializeTime();
  }
  toJSON() {
    return {
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _reloadWithoutSaving(user) {
  var _a;
  const auth2 = user.auth;
  const idToken = await user.getIdToken();
  const response = await _logoutIfInvalidated(user, getAccountInfo(auth2, { idToken }));
  _assert(
    response === null || response === void 0 ? void 0 : response.users.length,
    auth2,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const coreAccount = response.users[0];
  user._notifyReloadListener(coreAccount);
  const newProviderData = ((_a = coreAccount.providerUserInfo) === null || _a === void 0 ? void 0 : _a.length) ? extractProviderData(coreAccount.providerUserInfo) : [];
  const providerData = mergeProviderData(user.providerData, newProviderData);
  const oldIsAnonymous = user.isAnonymous;
  const newIsAnonymous = !(user.email && coreAccount.passwordHash) && !(providerData === null || providerData === void 0 ? void 0 : providerData.length);
  const isAnonymous = !oldIsAnonymous ? false : newIsAnonymous;
  const updates = {
    uid: coreAccount.localId,
    displayName: coreAccount.displayName || null,
    photoURL: coreAccount.photoUrl || null,
    email: coreAccount.email || null,
    emailVerified: coreAccount.emailVerified || false,
    phoneNumber: coreAccount.phoneNumber || null,
    tenantId: coreAccount.tenantId || null,
    providerData,
    metadata: new UserMetadata(coreAccount.createdAt, coreAccount.lastLoginAt),
    isAnonymous
  };
  Object.assign(user, updates);
}
async function reload(user) {
  const userInternal = getModularInstance(user);
  await _reloadWithoutSaving(userInternal);
  await userInternal.auth._persistUserIfCurrent(userInternal);
  userInternal.auth._notifyListenersIfCurrent(userInternal);
}
function mergeProviderData(original, newData) {
  const deduped = original.filter((o) => !newData.some((n) => n.providerId === o.providerId));
  return [...deduped, ...newData];
}
function extractProviderData(providers) {
  return providers.map((_a) => {
    var { providerId } = _a, provider2 = __rest(_a, ["providerId"]);
    return {
      providerId,
      uid: provider2.rawId || "",
      displayName: provider2.displayName || null,
      email: provider2.email || null,
      phoneNumber: provider2.phoneNumber || null,
      photoURL: provider2.photoUrl || null
    };
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function requestStsToken(auth2, refreshToken) {
  const response = await _performFetchWithErrorHandling(auth2, {}, async () => {
    const body = querystring({
      "grant_type": "refresh_token",
      "refresh_token": refreshToken
    }).slice(1);
    const { tokenApiHost, apiKey } = auth2.config;
    const url = _getFinalTarget(auth2, tokenApiHost, "/v1/token", `key=${apiKey}`);
    const headers = await auth2._getAdditionalHeaders();
    headers[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/x-www-form-urlencoded";
    return FetchProvider.fetch()(url, {
      method: "POST",
      headers,
      body
    });
  });
  return {
    accessToken: response.access_token,
    expiresIn: response.expires_in,
    refreshToken: response.refresh_token
  };
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class StsTokenManager {
  constructor() {
    this.refreshToken = null;
    this.accessToken = null;
    this.expirationTime = null;
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(response) {
    _assert(
      response.idToken,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    _assert(
      typeof response.idToken !== "undefined",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    _assert(
      typeof response.refreshToken !== "undefined",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const expiresIn = "expiresIn" in response && typeof response.expiresIn !== "undefined" ? Number(response.expiresIn) : _tokenExpiresIn(response.idToken);
    this.updateTokensAndExpiration(response.idToken, response.refreshToken, expiresIn);
  }
  async getToken(auth2, forceRefresh = false) {
    _assert(
      !this.accessToken || this.refreshToken,
      auth2,
      "user-token-expired"
      /* AuthErrorCode.TOKEN_EXPIRED */
    );
    if (!forceRefresh && this.accessToken && !this.isExpired) {
      return this.accessToken;
    }
    if (this.refreshToken) {
      await this.refresh(auth2, this.refreshToken);
      return this.accessToken;
    }
    return null;
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(auth2, oldToken) {
    const { accessToken, refreshToken, expiresIn } = await requestStsToken(auth2, oldToken);
    this.updateTokensAndExpiration(accessToken, refreshToken, Number(expiresIn));
  }
  updateTokensAndExpiration(accessToken, refreshToken, expiresInSec) {
    this.refreshToken = refreshToken || null;
    this.accessToken = accessToken || null;
    this.expirationTime = Date.now() + expiresInSec * 1e3;
  }
  static fromJSON(appName, object) {
    const { refreshToken, accessToken, expirationTime } = object;
    const manager = new StsTokenManager();
    if (refreshToken) {
      _assert(typeof refreshToken === "string", "internal-error", {
        appName
      });
      manager.refreshToken = refreshToken;
    }
    if (accessToken) {
      _assert(typeof accessToken === "string", "internal-error", {
        appName
      });
      manager.accessToken = accessToken;
    }
    if (expirationTime) {
      _assert(typeof expirationTime === "number", "internal-error", {
        appName
      });
      manager.expirationTime = expirationTime;
    }
    return manager;
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime
    };
  }
  _assign(stsTokenManager) {
    this.accessToken = stsTokenManager.accessToken;
    this.refreshToken = stsTokenManager.refreshToken;
    this.expirationTime = stsTokenManager.expirationTime;
  }
  _clone() {
    return Object.assign(new StsTokenManager(), this.toJSON());
  }
  _performRefresh() {
    return debugFail("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function assertStringOrUndefined(assertion, appName) {
  _assert(typeof assertion === "string" || typeof assertion === "undefined", "internal-error", { appName });
}
class UserImpl {
  constructor(_a) {
    var { uid, auth: auth2, stsTokenManager } = _a, opt = __rest(_a, ["uid", "auth", "stsTokenManager"]);
    this.providerId = "firebase";
    this.proactiveRefresh = new ProactiveRefresh(this);
    this.reloadUserInfo = null;
    this.reloadListener = null;
    this.uid = uid;
    this.auth = auth2;
    this.stsTokenManager = stsTokenManager;
    this.accessToken = stsTokenManager.accessToken;
    this.displayName = opt.displayName || null;
    this.email = opt.email || null;
    this.emailVerified = opt.emailVerified || false;
    this.phoneNumber = opt.phoneNumber || null;
    this.photoURL = opt.photoURL || null;
    this.isAnonymous = opt.isAnonymous || false;
    this.tenantId = opt.tenantId || null;
    this.providerData = opt.providerData ? [...opt.providerData] : [];
    this.metadata = new UserMetadata(opt.createdAt || void 0, opt.lastLoginAt || void 0);
  }
  async getIdToken(forceRefresh) {
    const accessToken = await _logoutIfInvalidated(this, this.stsTokenManager.getToken(this.auth, forceRefresh));
    _assert(
      accessToken,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    if (this.accessToken !== accessToken) {
      this.accessToken = accessToken;
      await this.auth._persistUserIfCurrent(this);
      this.auth._notifyListenersIfCurrent(this);
    }
    return accessToken;
  }
  getIdTokenResult(forceRefresh) {
    return getIdTokenResult(this, forceRefresh);
  }
  reload() {
    return reload(this);
  }
  _assign(user) {
    if (this === user) {
      return;
    }
    _assert(
      this.uid === user.uid,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    this.displayName = user.displayName;
    this.photoURL = user.photoURL;
    this.email = user.email;
    this.emailVerified = user.emailVerified;
    this.phoneNumber = user.phoneNumber;
    this.isAnonymous = user.isAnonymous;
    this.tenantId = user.tenantId;
    this.providerData = user.providerData.map((userInfo) => Object.assign({}, userInfo));
    this.metadata._copy(user.metadata);
    this.stsTokenManager._assign(user.stsTokenManager);
  }
  _clone(auth2) {
    const newUser = new UserImpl(Object.assign(Object.assign({}, this), { auth: auth2, stsTokenManager: this.stsTokenManager._clone() }));
    newUser.metadata._copy(this.metadata);
    return newUser;
  }
  _onReload(callback) {
    _assert(
      !this.reloadListener,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    this.reloadListener = callback;
    if (this.reloadUserInfo) {
      this._notifyReloadListener(this.reloadUserInfo);
      this.reloadUserInfo = null;
    }
  }
  _notifyReloadListener(userInfo) {
    if (this.reloadListener) {
      this.reloadListener(userInfo);
    } else {
      this.reloadUserInfo = userInfo;
    }
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(response, reload2 = false) {
    let tokensRefreshed = false;
    if (response.idToken && response.idToken !== this.stsTokenManager.accessToken) {
      this.stsTokenManager.updateFromServerResponse(response);
      tokensRefreshed = true;
    }
    if (reload2) {
      await _reloadWithoutSaving(this);
    }
    await this.auth._persistUserIfCurrent(this);
    if (tokensRefreshed) {
      this.auth._notifyListenersIfCurrent(this);
    }
  }
  async delete() {
    const idToken = await this.getIdToken();
    await _logoutIfInvalidated(this, deleteAccount(this.auth, { idToken }));
    this.stsTokenManager.clearRefreshToken();
    return this.auth.signOut();
  }
  toJSON() {
    return Object.assign(Object.assign({
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((userInfo) => Object.assign({}, userInfo)),
      stsTokenManager: this.stsTokenManager.toJSON(),
      // Redirect event ID must be maintained in case there is a pending
      // redirect event.
      _redirectEventId: this._redirectEventId
    }, this.metadata.toJSON()), {
      // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name
    });
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(auth2, object) {
    var _a, _b, _c2, _d, _e, _f, _g, _h2;
    const displayName = (_a = object.displayName) !== null && _a !== void 0 ? _a : void 0;
    const email = (_b = object.email) !== null && _b !== void 0 ? _b : void 0;
    const phoneNumber = (_c2 = object.phoneNumber) !== null && _c2 !== void 0 ? _c2 : void 0;
    const photoURL = (_d = object.photoURL) !== null && _d !== void 0 ? _d : void 0;
    const tenantId = (_e = object.tenantId) !== null && _e !== void 0 ? _e : void 0;
    const _redirectEventId = (_f = object._redirectEventId) !== null && _f !== void 0 ? _f : void 0;
    const createdAt = (_g = object.createdAt) !== null && _g !== void 0 ? _g : void 0;
    const lastLoginAt = (_h2 = object.lastLoginAt) !== null && _h2 !== void 0 ? _h2 : void 0;
    const { uid, emailVerified, isAnonymous, providerData, stsTokenManager: plainObjectTokenManager } = object;
    _assert(
      uid && plainObjectTokenManager,
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const stsTokenManager = StsTokenManager.fromJSON(this.name, plainObjectTokenManager);
    _assert(
      typeof uid === "string",
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    assertStringOrUndefined(displayName, auth2.name);
    assertStringOrUndefined(email, auth2.name);
    _assert(
      typeof emailVerified === "boolean",
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    _assert(
      typeof isAnonymous === "boolean",
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    assertStringOrUndefined(phoneNumber, auth2.name);
    assertStringOrUndefined(photoURL, auth2.name);
    assertStringOrUndefined(tenantId, auth2.name);
    assertStringOrUndefined(_redirectEventId, auth2.name);
    assertStringOrUndefined(createdAt, auth2.name);
    assertStringOrUndefined(lastLoginAt, auth2.name);
    const user = new UserImpl({
      uid,
      auth: auth2,
      email,
      emailVerified,
      displayName,
      isAnonymous,
      photoURL,
      phoneNumber,
      tenantId,
      stsTokenManager,
      createdAt,
      lastLoginAt
    });
    if (providerData && Array.isArray(providerData)) {
      user.providerData = providerData.map((userInfo) => Object.assign({}, userInfo));
    }
    if (_redirectEventId) {
      user._redirectEventId = _redirectEventId;
    }
    return user;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromIdTokenResponse(auth2, idTokenResponse, isAnonymous = false) {
    const stsTokenManager = new StsTokenManager();
    stsTokenManager.updateFromServerResponse(idTokenResponse);
    const user = new UserImpl({
      uid: idTokenResponse.localId,
      auth: auth2,
      stsTokenManager,
      isAnonymous
    });
    await _reloadWithoutSaving(user);
    return user;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const instanceCache = /* @__PURE__ */ new Map();
function _getInstance(cls) {
  debugAssert(cls instanceof Function, "Expected a class definition");
  let instance = instanceCache.get(cls);
  if (instance) {
    debugAssert(instance instanceof cls, "Instance stored in cache mismatched with class");
    return instance;
  }
  instance = new cls();
  instanceCache.set(cls, instance);
  return instance;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class InMemoryPersistence {
  constructor() {
    this.type = "NONE";
    this.storage = {};
  }
  async _isAvailable() {
    return true;
  }
  async _set(key, value) {
    this.storage[key] = value;
  }
  async _get(key) {
    const value = this.storage[key];
    return value === void 0 ? null : value;
  }
  async _remove(key) {
    delete this.storage[key];
  }
  _addListener(_key, _listener) {
    return;
  }
  _removeListener(_key, _listener) {
    return;
  }
}
InMemoryPersistence.type = "NONE";
const inMemoryPersistence = InMemoryPersistence;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _persistenceKeyName(key, apiKey, appName) {
  return `${"firebase"}:${key}:${apiKey}:${appName}`;
}
class PersistenceUserManager {
  constructor(persistence, auth2, userKey) {
    this.persistence = persistence;
    this.auth = auth2;
    this.userKey = userKey;
    const { config, name: name2 } = this.auth;
    this.fullUserKey = _persistenceKeyName(this.userKey, config.apiKey, name2);
    this.fullPersistenceKey = _persistenceKeyName("persistence", config.apiKey, name2);
    this.boundEventHandler = auth2._onStorageEvent.bind(auth2);
    this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
  }
  setCurrentUser(user) {
    return this.persistence._set(this.fullUserKey, user.toJSON());
  }
  async getCurrentUser() {
    const blob = await this.persistence._get(this.fullUserKey);
    return blob ? UserImpl._fromJSON(this.auth, blob) : null;
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(newPersistence) {
    if (this.persistence === newPersistence) {
      return;
    }
    const currentUser = await this.getCurrentUser();
    await this.removeCurrentUser();
    this.persistence = newPersistence;
    if (currentUser) {
      return this.setCurrentUser(currentUser);
    }
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(auth2, persistenceHierarchy, userKey = "authUser") {
    if (!persistenceHierarchy.length) {
      return new PersistenceUserManager(_getInstance(inMemoryPersistence), auth2, userKey);
    }
    const availablePersistences = (await Promise.all(persistenceHierarchy.map(async (persistence) => {
      if (await persistence._isAvailable()) {
        return persistence;
      }
      return void 0;
    }))).filter((persistence) => persistence);
    let selectedPersistence = availablePersistences[0] || _getInstance(inMemoryPersistence);
    const key = _persistenceKeyName(userKey, auth2.config.apiKey, auth2.name);
    let userToMigrate = null;
    for (const persistence of persistenceHierarchy) {
      try {
        const blob = await persistence._get(key);
        if (blob) {
          const user = UserImpl._fromJSON(auth2, blob);
          if (persistence !== selectedPersistence) {
            userToMigrate = user;
          }
          selectedPersistence = persistence;
          break;
        }
      } catch (_a) {
      }
    }
    const migrationHierarchy = availablePersistences.filter((p2) => p2._shouldAllowMigration);
    if (!selectedPersistence._shouldAllowMigration || !migrationHierarchy.length) {
      return new PersistenceUserManager(selectedPersistence, auth2, userKey);
    }
    selectedPersistence = migrationHierarchy[0];
    if (userToMigrate) {
      await selectedPersistence._set(key, userToMigrate.toJSON());
    }
    await Promise.all(persistenceHierarchy.map(async (persistence) => {
      if (persistence !== selectedPersistence) {
        try {
          await persistence._remove(key);
        } catch (_a) {
        }
      }
    }));
    return new PersistenceUserManager(selectedPersistence, auth2, userKey);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _getBrowserName(userAgent) {
  const ua2 = userAgent.toLowerCase();
  if (ua2.includes("opera/") || ua2.includes("opr/") || ua2.includes("opios/")) {
    return "Opera";
  } else if (_isIEMobile(ua2)) {
    return "IEMobile";
  } else if (ua2.includes("msie") || ua2.includes("trident/")) {
    return "IE";
  } else if (ua2.includes("edge/")) {
    return "Edge";
  } else if (_isFirefox(ua2)) {
    return "Firefox";
  } else if (ua2.includes("silk/")) {
    return "Silk";
  } else if (_isBlackBerry(ua2)) {
    return "Blackberry";
  } else if (_isWebOS(ua2)) {
    return "Webos";
  } else if (_isSafari(ua2)) {
    return "Safari";
  } else if ((ua2.includes("chrome/") || _isChromeIOS(ua2)) && !ua2.includes("edge/")) {
    return "Chrome";
  } else if (_isAndroid(ua2)) {
    return "Android";
  } else {
    const re = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/;
    const matches = userAgent.match(re);
    if ((matches === null || matches === void 0 ? void 0 : matches.length) === 2) {
      return matches[1];
    }
  }
  return "Other";
}
function _isFirefox(ua2 = getUA()) {
  return /firefox\//i.test(ua2);
}
function _isSafari(userAgent = getUA()) {
  const ua2 = userAgent.toLowerCase();
  return ua2.includes("safari/") && !ua2.includes("chrome/") && !ua2.includes("crios/") && !ua2.includes("android");
}
function _isChromeIOS(ua2 = getUA()) {
  return /crios\//i.test(ua2);
}
function _isIEMobile(ua2 = getUA()) {
  return /iemobile/i.test(ua2);
}
function _isAndroid(ua2 = getUA()) {
  return /android/i.test(ua2);
}
function _isBlackBerry(ua2 = getUA()) {
  return /blackberry/i.test(ua2);
}
function _isWebOS(ua2 = getUA()) {
  return /webos/i.test(ua2);
}
function _isIOS(ua2 = getUA()) {
  return /iphone|ipad|ipod/i.test(ua2) || /macintosh/i.test(ua2) && /mobile/i.test(ua2);
}
function _isIOSStandalone(ua2 = getUA()) {
  var _a;
  return _isIOS(ua2) && !!((_a = window.navigator) === null || _a === void 0 ? void 0 : _a.standalone);
}
function _isIE10() {
  return isIE() && document.documentMode === 10;
}
function _isMobileBrowser(ua2 = getUA()) {
  return _isIOS(ua2) || _isAndroid(ua2) || _isWebOS(ua2) || _isBlackBerry(ua2) || /windows phone/i.test(ua2) || _isIEMobile(ua2);
}
function _isIframe() {
  try {
    return !!(window && window !== window.top);
  } catch (e) {
    return false;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _getClientVersion(clientPlatform, frameworks = []) {
  let reportedPlatform;
  switch (clientPlatform) {
    case "Browser":
      reportedPlatform = _getBrowserName(getUA());
      break;
    case "Worker":
      reportedPlatform = `${_getBrowserName(getUA())}-${clientPlatform}`;
      break;
    default:
      reportedPlatform = clientPlatform;
  }
  const reportedFrameworks = frameworks.length ? frameworks.join(",") : "FirebaseCore-web";
  return `${reportedPlatform}/${"JsCore"}/${SDK_VERSION}/${reportedFrameworks}`;
}
async function getRecaptchaConfig(auth2, request) {
  return _performApiRequest(auth2, "GET", "/v2/recaptchaConfig", _addTidIfNecessary(auth2, request));
}
function isEnterprise(grecaptcha) {
  return grecaptcha !== void 0 && grecaptcha.enterprise !== void 0;
}
class RecaptchaConfig {
  constructor(response) {
    this.siteKey = "";
    this.emailPasswordEnabled = false;
    if (response.recaptchaKey === void 0) {
      throw new Error("recaptchaKey undefined");
    }
    this.siteKey = response.recaptchaKey.split("/")[3];
    this.emailPasswordEnabled = response.recaptchaEnforcementState.some((enforcementState) => enforcementState.provider === "EMAIL_PASSWORD_PROVIDER" && enforcementState.enforcementState !== "OFF");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getScriptParentElement() {
  var _a, _b;
  return (_b = (_a = document.getElementsByTagName("head")) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : document;
}
function _loadJS(url) {
  return new Promise((resolve, reject) => {
    const el2 = document.createElement("script");
    el2.setAttribute("src", url);
    el2.onload = resolve;
    el2.onerror = (e) => {
      const error = _createError(
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
      error.customData = e;
      reject(error);
    };
    el2.type = "text/javascript";
    el2.charset = "UTF-8";
    getScriptParentElement().appendChild(el2);
  });
}
function _generateCallbackName(prefix) {
  return `__${prefix}${Math.floor(Math.random() * 1e6)}`;
}
const RECAPTCHA_ENTERPRISE_URL = "https://www.google.com/recaptcha/enterprise.js?render=";
const RECAPTCHA_ENTERPRISE_VERIFIER_TYPE = "recaptcha-enterprise";
const FAKE_TOKEN = "NO_RECAPTCHA";
class RecaptchaEnterpriseVerifier {
  /**
   *
   * @param authExtern - The corresponding Firebase {@link Auth} instance.
   *
   */
  constructor(authExtern) {
    this.type = RECAPTCHA_ENTERPRISE_VERIFIER_TYPE;
    this.auth = _castAuth(authExtern);
  }
  /**
   * Executes the verification process.
   *
   * @returns A Promise for a token that can be used to assert the validity of a request.
   */
  async verify(action = "verify", forceRefresh = false) {
    async function retrieveSiteKey(auth2) {
      if (!forceRefresh) {
        if (auth2.tenantId == null && auth2._agentRecaptchaConfig != null) {
          return auth2._agentRecaptchaConfig.siteKey;
        }
        if (auth2.tenantId != null && auth2._tenantRecaptchaConfigs[auth2.tenantId] !== void 0) {
          return auth2._tenantRecaptchaConfigs[auth2.tenantId].siteKey;
        }
      }
      return new Promise(async (resolve, reject) => {
        getRecaptchaConfig(auth2, {
          clientType: "CLIENT_TYPE_WEB",
          version: "RECAPTCHA_ENTERPRISE"
          /* RecaptchaVersion.ENTERPRISE */
        }).then((response) => {
          if (response.recaptchaKey === void 0) {
            reject(new Error("recaptcha Enterprise site key undefined"));
          } else {
            const config = new RecaptchaConfig(response);
            if (auth2.tenantId == null) {
              auth2._agentRecaptchaConfig = config;
            } else {
              auth2._tenantRecaptchaConfigs[auth2.tenantId] = config;
            }
            return resolve(config.siteKey);
          }
        }).catch((error) => {
          reject(error);
        });
      });
    }
    function retrieveRecaptchaToken(siteKey, resolve, reject) {
      const grecaptcha = window.grecaptcha;
      if (isEnterprise(grecaptcha)) {
        grecaptcha.enterprise.ready(() => {
          grecaptcha.enterprise.execute(siteKey, { action }).then((token) => {
            resolve(token);
          }).catch(() => {
            resolve(FAKE_TOKEN);
          });
        });
      } else {
        reject(Error("No reCAPTCHA enterprise script loaded."));
      }
    }
    return new Promise((resolve, reject) => {
      retrieveSiteKey(this.auth).then((siteKey) => {
        if (!forceRefresh && isEnterprise(window.grecaptcha)) {
          retrieveRecaptchaToken(siteKey, resolve, reject);
        } else {
          if (typeof window === "undefined") {
            reject(new Error("RecaptchaVerifier is only supported in browser"));
            return;
          }
          _loadJS(RECAPTCHA_ENTERPRISE_URL + siteKey).then(() => {
            retrieveRecaptchaToken(siteKey, resolve, reject);
          }).catch((error) => {
            reject(error);
          });
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }
}
async function injectRecaptchaFields(auth2, request, action, captchaResp = false) {
  const verifier = new RecaptchaEnterpriseVerifier(auth2);
  let captchaResponse;
  try {
    captchaResponse = await verifier.verify(action);
  } catch (error) {
    captchaResponse = await verifier.verify(action, true);
  }
  const newRequest = Object.assign({}, request);
  if (!captchaResp) {
    Object.assign(newRequest, { captchaResponse });
  } else {
    Object.assign(newRequest, { "captchaResp": captchaResponse });
  }
  Object.assign(newRequest, {
    "clientType": "CLIENT_TYPE_WEB"
    /* RecaptchaClientType.WEB */
  });
  Object.assign(newRequest, {
    "recaptchaVersion": "RECAPTCHA_ENTERPRISE"
    /* RecaptchaVersion.ENTERPRISE */
  });
  return newRequest;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthMiddlewareQueue {
  constructor(auth2) {
    this.auth = auth2;
    this.queue = [];
  }
  pushCallback(callback, onAbort) {
    const wrappedCallback = (user) => new Promise((resolve, reject) => {
      try {
        const result = callback(user);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    wrappedCallback.onAbort = onAbort;
    this.queue.push(wrappedCallback);
    const index = this.queue.length - 1;
    return () => {
      this.queue[index] = () => Promise.resolve();
    };
  }
  async runMiddleware(nextUser) {
    if (this.auth.currentUser === nextUser) {
      return;
    }
    const onAbortStack = [];
    try {
      for (const beforeStateCallback of this.queue) {
        await beforeStateCallback(nextUser);
        if (beforeStateCallback.onAbort) {
          onAbortStack.push(beforeStateCallback.onAbort);
        }
      }
    } catch (e) {
      onAbortStack.reverse();
      for (const onAbort of onAbortStack) {
        try {
          onAbort();
        } catch (_) {
        }
      }
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: e === null || e === void 0 ? void 0 : e.message
      });
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthImpl {
  constructor(app2, heartbeatServiceProvider, appCheckServiceProvider, config) {
    this.app = app2;
    this.heartbeatServiceProvider = heartbeatServiceProvider;
    this.appCheckServiceProvider = appCheckServiceProvider;
    this.config = config;
    this.currentUser = null;
    this.emulatorConfig = null;
    this.operations = Promise.resolve();
    this.authStateSubscription = new Subscription(this);
    this.idTokenSubscription = new Subscription(this);
    this.beforeStateQueue = new AuthMiddlewareQueue(this);
    this.redirectUser = null;
    this.isProactiveRefreshEnabled = false;
    this._canInitEmulator = true;
    this._isInitialized = false;
    this._deleted = false;
    this._initializationPromise = null;
    this._popupRedirectResolver = null;
    this._errorFactory = _DEFAULT_AUTH_ERROR_FACTORY;
    this._agentRecaptchaConfig = null;
    this._tenantRecaptchaConfigs = {};
    this.lastNotifiedUid = void 0;
    this.languageCode = null;
    this.tenantId = null;
    this.settings = { appVerificationDisabledForTesting: false };
    this.frameworks = [];
    this.name = app2.name;
    this.clientVersion = config.sdkClientVersion;
  }
  _initializeWithPersistence(persistenceHierarchy, popupRedirectResolver) {
    if (popupRedirectResolver) {
      this._popupRedirectResolver = _getInstance(popupRedirectResolver);
    }
    this._initializationPromise = this.queue(async () => {
      var _a, _b;
      if (this._deleted) {
        return;
      }
      this.persistenceManager = await PersistenceUserManager.create(this, persistenceHierarchy);
      if (this._deleted) {
        return;
      }
      if ((_a = this._popupRedirectResolver) === null || _a === void 0 ? void 0 : _a._shouldInitProactively) {
        try {
          await this._popupRedirectResolver._initialize(this);
        } catch (e) {
        }
      }
      await this.initializeCurrentUser(popupRedirectResolver);
      this.lastNotifiedUid = ((_b = this.currentUser) === null || _b === void 0 ? void 0 : _b.uid) || null;
      if (this._deleted) {
        return;
      }
      this._isInitialized = true;
    });
    return this._initializationPromise;
  }
  /**
   * If the persistence is changed in another window, the user manager will let us know
   */
  async _onStorageEvent() {
    if (this._deleted) {
      return;
    }
    const user = await this.assertedPersistence.getCurrentUser();
    if (!this.currentUser && !user) {
      return;
    }
    if (this.currentUser && user && this.currentUser.uid === user.uid) {
      this._currentUser._assign(user);
      await this.currentUser.getIdToken();
      return;
    }
    await this._updateCurrentUser(
      user,
      /* skipBeforeStateCallbacks */
      true
    );
  }
  async initializeCurrentUser(popupRedirectResolver) {
    var _a;
    const previouslyStoredUser = await this.assertedPersistence.getCurrentUser();
    let futureCurrentUser = previouslyStoredUser;
    let needsTocheckMiddleware = false;
    if (popupRedirectResolver && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const redirectUserEventId = (_a = this.redirectUser) === null || _a === void 0 ? void 0 : _a._redirectEventId;
      const storedUserEventId = futureCurrentUser === null || futureCurrentUser === void 0 ? void 0 : futureCurrentUser._redirectEventId;
      const result = await this.tryRedirectSignIn(popupRedirectResolver);
      if ((!redirectUserEventId || redirectUserEventId === storedUserEventId) && (result === null || result === void 0 ? void 0 : result.user)) {
        futureCurrentUser = result.user;
        needsTocheckMiddleware = true;
      }
    }
    if (!futureCurrentUser) {
      return this.directlySetCurrentUser(null);
    }
    if (!futureCurrentUser._redirectEventId) {
      if (needsTocheckMiddleware) {
        try {
          await this.beforeStateQueue.runMiddleware(futureCurrentUser);
        } catch (e) {
          futureCurrentUser = previouslyStoredUser;
          this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(e));
        }
      }
      if (futureCurrentUser) {
        return this.reloadAndSetCurrentUserOrClear(futureCurrentUser);
      } else {
        return this.directlySetCurrentUser(null);
      }
    }
    _assert(
      this._popupRedirectResolver,
      this,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    );
    await this.getOrInitRedirectPersistenceManager();
    if (this.redirectUser && this.redirectUser._redirectEventId === futureCurrentUser._redirectEventId) {
      return this.directlySetCurrentUser(futureCurrentUser);
    }
    return this.reloadAndSetCurrentUserOrClear(futureCurrentUser);
  }
  async tryRedirectSignIn(redirectResolver) {
    let result = null;
    try {
      result = await this._popupRedirectResolver._completeRedirectFn(this, redirectResolver, true);
    } catch (e) {
      await this._setRedirectUser(null);
    }
    return result;
  }
  async reloadAndSetCurrentUserOrClear(user) {
    try {
      await _reloadWithoutSaving(user);
    } catch (e) {
      if ((e === null || e === void 0 ? void 0 : e.code) !== `auth/${"network-request-failed"}`) {
        return this.directlySetCurrentUser(null);
      }
    }
    return this.directlySetCurrentUser(user);
  }
  useDeviceLanguage() {
    this.languageCode = _getUserLanguage();
  }
  async _delete() {
    this._deleted = true;
  }
  async updateCurrentUser(userExtern) {
    const user = userExtern ? getModularInstance(userExtern) : null;
    if (user) {
      _assert(
        user.auth.config.apiKey === this.config.apiKey,
        this,
        "invalid-user-token"
        /* AuthErrorCode.INVALID_AUTH */
      );
    }
    return this._updateCurrentUser(user && user._clone(this));
  }
  async _updateCurrentUser(user, skipBeforeStateCallbacks = false) {
    if (this._deleted) {
      return;
    }
    if (user) {
      _assert(
        this.tenantId === user.tenantId,
        this,
        "tenant-id-mismatch"
        /* AuthErrorCode.TENANT_ID_MISMATCH */
      );
    }
    if (!skipBeforeStateCallbacks) {
      await this.beforeStateQueue.runMiddleware(user);
    }
    return this.queue(async () => {
      await this.directlySetCurrentUser(user);
      this.notifyAuthListeners();
    });
  }
  async signOut() {
    await this.beforeStateQueue.runMiddleware(null);
    if (this.redirectPersistenceManager || this._popupRedirectResolver) {
      await this._setRedirectUser(null);
    }
    return this._updateCurrentUser(
      null,
      /* skipBeforeStateCallbacks */
      true
    );
  }
  setPersistence(persistence) {
    return this.queue(async () => {
      await this.assertedPersistence.setPersistence(_getInstance(persistence));
    });
  }
  async initializeRecaptchaConfig() {
    const response = await getRecaptchaConfig(this, {
      clientType: "CLIENT_TYPE_WEB",
      version: "RECAPTCHA_ENTERPRISE"
      /* RecaptchaVersion.ENTERPRISE */
    });
    const config = new RecaptchaConfig(response);
    if (this.tenantId == null) {
      this._agentRecaptchaConfig = config;
    } else {
      this._tenantRecaptchaConfigs[this.tenantId] = config;
    }
    if (config.emailPasswordEnabled) {
      const verifier = new RecaptchaEnterpriseVerifier(this);
      void verifier.verify();
    }
  }
  _getRecaptchaConfig() {
    if (this.tenantId == null) {
      return this._agentRecaptchaConfig;
    } else {
      return this._tenantRecaptchaConfigs[this.tenantId];
    }
  }
  _getPersistence() {
    return this.assertedPersistence.persistence.type;
  }
  _updateErrorMap(errorMap) {
    this._errorFactory = new ErrorFactory("auth", "Firebase", errorMap());
  }
  onAuthStateChanged(nextOrObserver, error, completed) {
    return this.registerStateListener(this.authStateSubscription, nextOrObserver, error, completed);
  }
  beforeAuthStateChanged(callback, onAbort) {
    return this.beforeStateQueue.pushCallback(callback, onAbort);
  }
  onIdTokenChanged(nextOrObserver, error, completed) {
    return this.registerStateListener(this.idTokenSubscription, nextOrObserver, error, completed);
  }
  toJSON() {
    var _a;
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: (_a = this._currentUser) === null || _a === void 0 ? void 0 : _a.toJSON()
    };
  }
  async _setRedirectUser(user, popupRedirectResolver) {
    const redirectManager = await this.getOrInitRedirectPersistenceManager(popupRedirectResolver);
    return user === null ? redirectManager.removeCurrentUser() : redirectManager.setCurrentUser(user);
  }
  async getOrInitRedirectPersistenceManager(popupRedirectResolver) {
    if (!this.redirectPersistenceManager) {
      const resolver = popupRedirectResolver && _getInstance(popupRedirectResolver) || this._popupRedirectResolver;
      _assert(
        resolver,
        this,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      );
      this.redirectPersistenceManager = await PersistenceUserManager.create(
        this,
        [_getInstance(resolver._redirectPersistence)],
        "redirectUser"
        /* KeyName.REDIRECT_USER */
      );
      this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(id2) {
    var _a, _b;
    if (this._isInitialized) {
      await this.queue(async () => {
      });
    }
    if (((_a = this._currentUser) === null || _a === void 0 ? void 0 : _a._redirectEventId) === id2) {
      return this._currentUser;
    }
    if (((_b = this.redirectUser) === null || _b === void 0 ? void 0 : _b._redirectEventId) === id2) {
      return this.redirectUser;
    }
    return null;
  }
  async _persistUserIfCurrent(user) {
    if (user === this.currentUser) {
      return this.queue(async () => this.directlySetCurrentUser(user));
    }
  }
  /** Notifies listeners only if the user is current */
  _notifyListenersIfCurrent(user) {
    if (user === this.currentUser) {
      this.notifyAuthListeners();
    }
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    this.isProactiveRefreshEnabled = true;
    if (this.currentUser) {
      this._currentUser._startProactiveRefresh();
    }
  }
  _stopProactiveRefresh() {
    this.isProactiveRefreshEnabled = false;
    if (this.currentUser) {
      this._currentUser._stopProactiveRefresh();
    }
  }
  /** Returns the current user cast as the internal type */
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    var _a, _b;
    if (!this._isInitialized) {
      return;
    }
    this.idTokenSubscription.next(this.currentUser);
    const currentUid = (_b = (_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : null;
    if (this.lastNotifiedUid !== currentUid) {
      this.lastNotifiedUid = currentUid;
      this.authStateSubscription.next(this.currentUser);
    }
  }
  registerStateListener(subscription, nextOrObserver, error, completed) {
    if (this._deleted) {
      return () => {
      };
    }
    const cb2 = typeof nextOrObserver === "function" ? nextOrObserver : nextOrObserver.next.bind(nextOrObserver);
    const promise = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    _assert(
      promise,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    promise.then(() => cb2(this.currentUser));
    if (typeof nextOrObserver === "function") {
      return subscription.addObserver(nextOrObserver, error, completed);
    } else {
      return subscription.addObserver(nextOrObserver);
    }
  }
  /**
   * Unprotected (from race conditions) method to set the current user. This
   * should only be called from within a queued callback. This is necessary
   * because the queue shouldn't rely on another queued callback.
   */
  async directlySetCurrentUser(user) {
    if (this.currentUser && this.currentUser !== user) {
      this._currentUser._stopProactiveRefresh();
    }
    if (user && this.isProactiveRefreshEnabled) {
      user._startProactiveRefresh();
    }
    this.currentUser = user;
    if (user) {
      await this.assertedPersistence.setCurrentUser(user);
    } else {
      await this.assertedPersistence.removeCurrentUser();
    }
  }
  queue(action) {
    this.operations = this.operations.then(action, action);
    return this.operations;
  }
  get assertedPersistence() {
    _assert(
      this.persistenceManager,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    return this.persistenceManager;
  }
  _logFramework(framework) {
    if (!framework || this.frameworks.includes(framework)) {
      return;
    }
    this.frameworks.push(framework);
    this.frameworks.sort();
    this.clientVersion = _getClientVersion(this.config.clientPlatform, this._getFrameworks());
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    var _a;
    const headers = {
      [
        "X-Client-Version"
        /* HttpHeader.X_CLIENT_VERSION */
      ]: this.clientVersion
    };
    if (this.app.options.appId) {
      headers[
        "X-Firebase-gmpid"
        /* HttpHeader.X_FIREBASE_GMPID */
      ] = this.app.options.appId;
    }
    const heartbeatsHeader = await ((_a = this.heartbeatServiceProvider.getImmediate({
      optional: true
    })) === null || _a === void 0 ? void 0 : _a.getHeartbeatsHeader());
    if (heartbeatsHeader) {
      headers[
        "X-Firebase-Client"
        /* HttpHeader.X_FIREBASE_CLIENT */
      ] = heartbeatsHeader;
    }
    const appCheckToken = await this._getAppCheckToken();
    if (appCheckToken) {
      headers[
        "X-Firebase-AppCheck"
        /* HttpHeader.X_FIREBASE_APP_CHECK */
      ] = appCheckToken;
    }
    return headers;
  }
  async _getAppCheckToken() {
    var _a;
    const appCheckTokenResult = await ((_a = this.appCheckServiceProvider.getImmediate({ optional: true })) === null || _a === void 0 ? void 0 : _a.getToken());
    if (appCheckTokenResult === null || appCheckTokenResult === void 0 ? void 0 : appCheckTokenResult.error) {
      _logWarn(`Error while retrieving App Check token: ${appCheckTokenResult.error}`);
    }
    return appCheckTokenResult === null || appCheckTokenResult === void 0 ? void 0 : appCheckTokenResult.token;
  }
}
function _castAuth(auth2) {
  return getModularInstance(auth2);
}
class Subscription {
  constructor(auth2) {
    this.auth = auth2;
    this.observer = null;
    this.addObserver = createSubscribe((observer2) => this.observer = observer2);
  }
  get next() {
    _assert(
      this.observer,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    return this.observer.next.bind(this.observer);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function initializeAuth(app2, deps) {
  const provider2 = _getProvider(app2, "auth");
  if (provider2.isInitialized()) {
    const auth3 = provider2.getImmediate();
    const initialOptions = provider2.getOptions();
    if (deepEqual(initialOptions, deps !== null && deps !== void 0 ? deps : {})) {
      return auth3;
    } else {
      _fail(
        auth3,
        "already-initialized"
        /* AuthErrorCode.ALREADY_INITIALIZED */
      );
    }
  }
  const auth2 = provider2.initialize({ options: deps });
  return auth2;
}
function _initializeAuthInstance(auth2, deps) {
  const persistence = (deps === null || deps === void 0 ? void 0 : deps.persistence) || [];
  const hierarchy = (Array.isArray(persistence) ? persistence : [persistence]).map(_getInstance);
  if (deps === null || deps === void 0 ? void 0 : deps.errorMap) {
    auth2._updateErrorMap(deps.errorMap);
  }
  auth2._initializeWithPersistence(hierarchy, deps === null || deps === void 0 ? void 0 : deps.popupRedirectResolver);
}
function connectAuthEmulator(auth2, url, options) {
  const authInternal = _castAuth(auth2);
  _assert(
    authInternal._canInitEmulator,
    authInternal,
    "emulator-config-failed"
    /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
  );
  _assert(
    /^https?:\/\//.test(url),
    authInternal,
    "invalid-emulator-scheme"
    /* AuthErrorCode.INVALID_EMULATOR_SCHEME */
  );
  const disableWarnings = !!(options === null || options === void 0 ? void 0 : options.disableWarnings);
  const protocol = extractProtocol(url);
  const { host, port } = extractHostAndPort(url);
  const portStr = port === null ? "" : `:${port}`;
  authInternal.config.emulator = { url: `${protocol}//${host}${portStr}/` };
  authInternal.settings.appVerificationDisabledForTesting = true;
  authInternal.emulatorConfig = Object.freeze({
    host,
    port,
    protocol: protocol.replace(":", ""),
    options: Object.freeze({ disableWarnings })
  });
  if (!disableWarnings) {
    emitEmulatorWarning();
  }
}
function extractProtocol(url) {
  const protocolEnd = url.indexOf(":");
  return protocolEnd < 0 ? "" : url.substr(0, protocolEnd + 1);
}
function extractHostAndPort(url) {
  const protocol = extractProtocol(url);
  const authority = /(\/\/)?([^?#/]+)/.exec(url.substr(protocol.length));
  if (!authority) {
    return { host: "", port: null };
  }
  const hostAndPort = authority[2].split("@").pop() || "";
  const bracketedIPv6 = /^(\[[^\]]+\])(:|$)/.exec(hostAndPort);
  if (bracketedIPv6) {
    const host = bracketedIPv6[1];
    return { host, port: parsePort(hostAndPort.substr(host.length + 1)) };
  } else {
    const [host, port] = hostAndPort.split(":");
    return { host, port: parsePort(port) };
  }
}
function parsePort(portStr) {
  if (!portStr) {
    return null;
  }
  const port = Number(portStr);
  if (isNaN(port)) {
    return null;
  }
  return port;
}
function emitEmulatorWarning() {
  function attachBanner() {
    const el2 = document.createElement("p");
    const sty = el2.style;
    el2.innerText = "Running in emulator mode. Do not use with production credentials.";
    sty.position = "fixed";
    sty.width = "100%";
    sty.backgroundColor = "#ffffff";
    sty.border = ".1em solid #000000";
    sty.color = "#b50000";
    sty.bottom = "0px";
    sty.left = "0px";
    sty.margin = "0px";
    sty.zIndex = "10000";
    sty.textAlign = "center";
    el2.classList.add("firebase-emulator-warning");
    document.body.appendChild(el2);
  }
  if (typeof console !== "undefined" && typeof console.info === "function") {
    console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", attachBanner);
    } else {
      attachBanner();
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthCredential {
  /** @internal */
  constructor(providerId, signInMethod) {
    this.providerId = providerId;
    this.signInMethod = signInMethod;
  }
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns a JSON-serializable representation of this object.
   */
  toJSON() {
    return debugFail("not implemented");
  }
  /** @internal */
  _getIdTokenResponse(_auth) {
    return debugFail("not implemented");
  }
  /** @internal */
  _linkToIdToken(_auth, _idToken) {
    return debugFail("not implemented");
  }
  /** @internal */
  _getReauthenticationResolver(_auth) {
    return debugFail("not implemented");
  }
}
async function updateEmailPassword(auth2, request) {
  return _performApiRequest(auth2, "POST", "/v1/accounts:update", request);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signInWithPassword(auth2, request) {
  return _performSignInRequest(auth2, "POST", "/v1/accounts:signInWithPassword", _addTidIfNecessary(auth2, request));
}
async function sendOobCode(auth2, request) {
  return _performApiRequest(auth2, "POST", "/v1/accounts:sendOobCode", _addTidIfNecessary(auth2, request));
}
async function sendEmailVerification$1(auth2, request) {
  return sendOobCode(auth2, request);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signInWithEmailLink$1(auth2, request) {
  return _performSignInRequest(auth2, "POST", "/v1/accounts:signInWithEmailLink", _addTidIfNecessary(auth2, request));
}
async function signInWithEmailLinkForLinking(auth2, request) {
  return _performSignInRequest(auth2, "POST", "/v1/accounts:signInWithEmailLink", _addTidIfNecessary(auth2, request));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class EmailAuthCredential extends AuthCredential {
  /** @internal */
  constructor(_email, _password, signInMethod, _tenantId = null) {
    super("password", signInMethod);
    this._email = _email;
    this._password = _password;
    this._tenantId = _tenantId;
  }
  /** @internal */
  static _fromEmailAndPassword(email, password) {
    return new EmailAuthCredential(
      email,
      password,
      "password"
      /* SignInMethod.EMAIL_PASSWORD */
    );
  }
  /** @internal */
  static _fromEmailAndCode(email, oobCode, tenantId = null) {
    return new EmailAuthCredential(email, oobCode, "emailLink", tenantId);
  }
  /** {@inheritdoc AuthCredential.toJSON} */
  toJSON() {
    return {
      email: this._email,
      password: this._password,
      signInMethod: this.signInMethod,
      tenantId: this._tenantId
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an {@link  AuthCredential}.
   *
   * @param json - Either `object` or the stringified representation of the object. When string is
   * provided, `JSON.parse` would be called first.
   *
   * @returns If the JSON input does not represent an {@link AuthCredential}, null is returned.
   */
  static fromJSON(json) {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    if ((obj === null || obj === void 0 ? void 0 : obj.email) && (obj === null || obj === void 0 ? void 0 : obj.password)) {
      if (obj.signInMethod === "password") {
        return this._fromEmailAndPassword(obj.email, obj.password);
      } else if (obj.signInMethod === "emailLink") {
        return this._fromEmailAndCode(obj.email, obj.password, obj.tenantId);
      }
    }
    return null;
  }
  /** @internal */
  async _getIdTokenResponse(auth2) {
    var _a;
    switch (this.signInMethod) {
      case "password":
        const request = {
          returnSecureToken: true,
          email: this._email,
          password: this._password,
          clientType: "CLIENT_TYPE_WEB"
          /* RecaptchaClientType.WEB */
        };
        if ((_a = auth2._getRecaptchaConfig()) === null || _a === void 0 ? void 0 : _a.emailPasswordEnabled) {
          const requestWithRecaptcha = await injectRecaptchaFields(
            auth2,
            request,
            "signInWithPassword"
            /* RecaptchaActionName.SIGN_IN_WITH_PASSWORD */
          );
          return signInWithPassword(auth2, requestWithRecaptcha);
        } else {
          return signInWithPassword(auth2, request).catch(async (error) => {
            if (error.code === `auth/${"missing-recaptcha-token"}`) {
              console.log("Sign-in with email address and password is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-in flow.");
              const requestWithRecaptcha = await injectRecaptchaFields(
                auth2,
                request,
                "signInWithPassword"
                /* RecaptchaActionName.SIGN_IN_WITH_PASSWORD */
              );
              return signInWithPassword(auth2, requestWithRecaptcha);
            } else {
              return Promise.reject(error);
            }
          });
        }
      case "emailLink":
        return signInWithEmailLink$1(auth2, {
          email: this._email,
          oobCode: this._password
        });
      default:
        _fail(
          auth2,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  async _linkToIdToken(auth2, idToken) {
    switch (this.signInMethod) {
      case "password":
        return updateEmailPassword(auth2, {
          idToken,
          returnSecureToken: true,
          email: this._email,
          password: this._password
        });
      case "emailLink":
        return signInWithEmailLinkForLinking(auth2, {
          idToken,
          email: this._email,
          oobCode: this._password
        });
      default:
        _fail(
          auth2,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  _getReauthenticationResolver(auth2) {
    return this._getIdTokenResponse(auth2);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signInWithIdp(auth2, request) {
  return _performSignInRequest(auth2, "POST", "/v1/accounts:signInWithIdp", _addTidIfNecessary(auth2, request));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IDP_REQUEST_URI$1 = "http://localhost";
class OAuthCredential extends AuthCredential {
  constructor() {
    super(...arguments);
    this.pendingToken = null;
  }
  /** @internal */
  static _fromParams(params) {
    const cred = new OAuthCredential(params.providerId, params.signInMethod);
    if (params.idToken || params.accessToken) {
      if (params.idToken) {
        cred.idToken = params.idToken;
      }
      if (params.accessToken) {
        cred.accessToken = params.accessToken;
      }
      if (params.nonce && !params.pendingToken) {
        cred.nonce = params.nonce;
      }
      if (params.pendingToken) {
        cred.pendingToken = params.pendingToken;
      }
    } else if (params.oauthToken && params.oauthTokenSecret) {
      cred.accessToken = params.oauthToken;
      cred.secret = params.oauthTokenSecret;
    } else {
      _fail(
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      );
    }
    return cred;
  }
  /** {@inheritdoc AuthCredential.toJSON}  */
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an
   * {@link  AuthCredential}.
   *
   * @param json - Input can be either Object or the stringified representation of the object.
   * When string is provided, JSON.parse would be called first.
   *
   * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
   */
  static fromJSON(json) {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    const { providerId, signInMethod } = obj, rest = __rest(obj, ["providerId", "signInMethod"]);
    if (!providerId || !signInMethod) {
      return null;
    }
    const cred = new OAuthCredential(providerId, signInMethod);
    cred.idToken = rest.idToken || void 0;
    cred.accessToken = rest.accessToken || void 0;
    cred.secret = rest.secret;
    cred.nonce = rest.nonce;
    cred.pendingToken = rest.pendingToken || null;
    return cred;
  }
  /** @internal */
  _getIdTokenResponse(auth2) {
    const request = this.buildRequest();
    return signInWithIdp(auth2, request);
  }
  /** @internal */
  _linkToIdToken(auth2, idToken) {
    const request = this.buildRequest();
    request.idToken = idToken;
    return signInWithIdp(auth2, request);
  }
  /** @internal */
  _getReauthenticationResolver(auth2) {
    const request = this.buildRequest();
    request.autoCreate = false;
    return signInWithIdp(auth2, request);
  }
  buildRequest() {
    const request = {
      requestUri: IDP_REQUEST_URI$1,
      returnSecureToken: true
    };
    if (this.pendingToken) {
      request.pendingToken = this.pendingToken;
    } else {
      const postBody = {};
      if (this.idToken) {
        postBody["id_token"] = this.idToken;
      }
      if (this.accessToken) {
        postBody["access_token"] = this.accessToken;
      }
      if (this.secret) {
        postBody["oauth_token_secret"] = this.secret;
      }
      postBody["providerId"] = this.providerId;
      if (this.nonce && !this.pendingToken) {
        postBody["nonce"] = this.nonce;
      }
      request.postBody = querystring(postBody);
    }
    return request;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function parseMode(mode) {
  switch (mode) {
    case "recoverEmail":
      return "RECOVER_EMAIL";
    case "resetPassword":
      return "PASSWORD_RESET";
    case "signIn":
      return "EMAIL_SIGNIN";
    case "verifyEmail":
      return "VERIFY_EMAIL";
    case "verifyAndChangeEmail":
      return "VERIFY_AND_CHANGE_EMAIL";
    case "revertSecondFactorAddition":
      return "REVERT_SECOND_FACTOR_ADDITION";
    default:
      return null;
  }
}
function parseDeepLink(url) {
  const link = querystringDecode(extractQuerystring(url))["link"];
  const doubleDeepLink = link ? querystringDecode(extractQuerystring(link))["deep_link_id"] : null;
  const iOSDeepLink = querystringDecode(extractQuerystring(url))["deep_link_id"];
  const iOSDoubleDeepLink = iOSDeepLink ? querystringDecode(extractQuerystring(iOSDeepLink))["link"] : null;
  return iOSDoubleDeepLink || iOSDeepLink || doubleDeepLink || link || url;
}
class ActionCodeURL {
  /**
   * @param actionLink - The link from which to extract the URL.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @internal
   */
  constructor(actionLink) {
    var _a, _b, _c2, _d, _e, _f;
    const searchParams = querystringDecode(extractQuerystring(actionLink));
    const apiKey = (_a = searchParams[
      "apiKey"
      /* QueryField.API_KEY */
    ]) !== null && _a !== void 0 ? _a : null;
    const code = (_b = searchParams[
      "oobCode"
      /* QueryField.CODE */
    ]) !== null && _b !== void 0 ? _b : null;
    const operation = parseMode((_c2 = searchParams[
      "mode"
      /* QueryField.MODE */
    ]) !== null && _c2 !== void 0 ? _c2 : null);
    _assert(
      apiKey && code && operation,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    );
    this.apiKey = apiKey;
    this.operation = operation;
    this.code = code;
    this.continueUrl = (_d = searchParams[
      "continueUrl"
      /* QueryField.CONTINUE_URL */
    ]) !== null && _d !== void 0 ? _d : null;
    this.languageCode = (_e = searchParams[
      "languageCode"
      /* QueryField.LANGUAGE_CODE */
    ]) !== null && _e !== void 0 ? _e : null;
    this.tenantId = (_f = searchParams[
      "tenantId"
      /* QueryField.TENANT_ID */
    ]) !== null && _f !== void 0 ? _f : null;
  }
  /**
   * Parses the email action link string and returns an {@link ActionCodeURL} if the link is valid,
   * otherwise returns null.
   *
   * @param link  - The email action link string.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @public
   */
  static parseLink(link) {
    const actionLink = parseDeepLink(link);
    try {
      return new ActionCodeURL(actionLink);
    } catch (_a) {
      return null;
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class EmailAuthProvider {
  constructor() {
    this.providerId = EmailAuthProvider.PROVIDER_ID;
  }
  /**
   * Initialize an {@link AuthCredential} using an email and password.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credential(email, password);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * const userCredential = await signInWithEmailAndPassword(auth, email, password);
   * ```
   *
   * @param email - Email address.
   * @param password - User account password.
   * @returns The auth provider credential.
   */
  static credential(email, password) {
    return EmailAuthCredential._fromEmailAndPassword(email, password);
  }
  /**
   * Initialize an {@link AuthCredential} using an email and an email link after a sign in with
   * email link operation.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credentialWithLink(auth, email, emailLink);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * await sendSignInLinkToEmail(auth, email);
   * // Obtain emailLink from user.
   * const userCredential = await signInWithEmailLink(auth, email, emailLink);
   * ```
   *
   * @param auth - The {@link Auth} instance used to verify the link.
   * @param email - Email address.
   * @param emailLink - Sign-in email link.
   * @returns - The auth provider credential.
   */
  static credentialWithLink(email, emailLink) {
    const actionCodeUrl = ActionCodeURL.parseLink(emailLink);
    _assert(
      actionCodeUrl,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    );
    return EmailAuthCredential._fromEmailAndCode(email, actionCodeUrl.code, actionCodeUrl.tenantId);
  }
}
EmailAuthProvider.PROVIDER_ID = "password";
EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD = "password";
EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FederatedAuthProvider {
  /**
   * Constructor for generic OAuth providers.
   *
   * @param providerId - Provider for which credentials should be generated.
   */
  constructor(providerId) {
    this.providerId = providerId;
    this.defaultLanguageCode = null;
    this.customParameters = {};
  }
  /**
   * Set the language gode.
   *
   * @param languageCode - language code
   */
  setDefaultLanguage(languageCode) {
    this.defaultLanguageCode = languageCode;
  }
  /**
   * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
   * operations.
   *
   * @remarks
   * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
   * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
   *
   * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
   */
  setCustomParameters(customOAuthParameters) {
    this.customParameters = customOAuthParameters;
    return this;
  }
  /**
   * Retrieve the current list of {@link CustomParameters}.
   */
  getCustomParameters() {
    return this.customParameters;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class BaseOAuthProvider extends FederatedAuthProvider {
  constructor() {
    super(...arguments);
    this.scopes = [];
  }
  /**
   * Add an OAuth scope to the credential.
   *
   * @param scope - Provider OAuth scope to add.
   */
  addScope(scope) {
    if (!this.scopes.includes(scope)) {
      this.scopes.push(scope);
    }
    return this;
  }
  /**
   * Retrieve the current list of OAuth scopes.
   */
  getScopes() {
    return [...this.scopes];
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class FacebookAuthProvider extends BaseOAuthProvider {
  constructor() {
    super(
      "facebook.com"
      /* ProviderId.FACEBOOK */
    );
  }
  /**
   * Creates a credential for Facebook.
   *
   * @example
   * ```javascript
   * // `event` from the Facebook auth.authResponseChange callback.
   * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param accessToken - Facebook access token.
   */
  static credential(accessToken) {
    return OAuthCredential._fromParams({
      providerId: FacebookAuthProvider.PROVIDER_ID,
      signInMethod: FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD,
      accessToken
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(userCredential) {
    return FacebookAuthProvider.credentialFromTaggedObject(userCredential);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(error) {
    return FacebookAuthProvider.credentialFromTaggedObject(error.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
    if (!tokenResponse || !("oauthAccessToken" in tokenResponse)) {
      return null;
    }
    if (!tokenResponse.oauthAccessToken) {
      return null;
    }
    try {
      return FacebookAuthProvider.credential(tokenResponse.oauthAccessToken);
    } catch (_a) {
      return null;
    }
  }
}
FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
FacebookAuthProvider.PROVIDER_ID = "facebook.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class GoogleAuthProvider extends BaseOAuthProvider {
  constructor() {
    super(
      "google.com"
      /* ProviderId.GOOGLE */
    );
    this.addScope("profile");
  }
  /**
   * Creates a credential for Google. At least one of ID token and access token is required.
   *
   * @example
   * ```javascript
   * // \`googleUser\` from the onsuccess Google Sign In callback.
   * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param idToken - Google ID token.
   * @param accessToken - Google access token.
   */
  static credential(idToken, accessToken) {
    return OAuthCredential._fromParams({
      providerId: GoogleAuthProvider.PROVIDER_ID,
      signInMethod: GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD,
      idToken,
      accessToken
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(userCredential) {
    return GoogleAuthProvider.credentialFromTaggedObject(userCredential);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(error) {
    return GoogleAuthProvider.credentialFromTaggedObject(error.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
    if (!tokenResponse) {
      return null;
    }
    const { oauthIdToken, oauthAccessToken } = tokenResponse;
    if (!oauthIdToken && !oauthAccessToken) {
      return null;
    }
    try {
      return GoogleAuthProvider.credential(oauthIdToken, oauthAccessToken);
    } catch (_a) {
      return null;
    }
  }
}
GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD = "google.com";
GoogleAuthProvider.PROVIDER_ID = "google.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class GithubAuthProvider extends BaseOAuthProvider {
  constructor() {
    super(
      "github.com"
      /* ProviderId.GITHUB */
    );
  }
  /**
   * Creates a credential for Github.
   *
   * @param accessToken - Github access token.
   */
  static credential(accessToken) {
    return OAuthCredential._fromParams({
      providerId: GithubAuthProvider.PROVIDER_ID,
      signInMethod: GithubAuthProvider.GITHUB_SIGN_IN_METHOD,
      accessToken
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(userCredential) {
    return GithubAuthProvider.credentialFromTaggedObject(userCredential);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(error) {
    return GithubAuthProvider.credentialFromTaggedObject(error.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
    if (!tokenResponse || !("oauthAccessToken" in tokenResponse)) {
      return null;
    }
    if (!tokenResponse.oauthAccessToken) {
      return null;
    }
    try {
      return GithubAuthProvider.credential(tokenResponse.oauthAccessToken);
    } catch (_a) {
      return null;
    }
  }
}
GithubAuthProvider.GITHUB_SIGN_IN_METHOD = "github.com";
GithubAuthProvider.PROVIDER_ID = "github.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class TwitterAuthProvider extends BaseOAuthProvider {
  constructor() {
    super(
      "twitter.com"
      /* ProviderId.TWITTER */
    );
  }
  /**
   * Creates a credential for Twitter.
   *
   * @param token - Twitter access token.
   * @param secret - Twitter secret.
   */
  static credential(token, secret) {
    return OAuthCredential._fromParams({
      providerId: TwitterAuthProvider.PROVIDER_ID,
      signInMethod: TwitterAuthProvider.TWITTER_SIGN_IN_METHOD,
      oauthToken: token,
      oauthTokenSecret: secret
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(userCredential) {
    return TwitterAuthProvider.credentialFromTaggedObject(userCredential);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(error) {
    return TwitterAuthProvider.credentialFromTaggedObject(error.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: tokenResponse }) {
    if (!tokenResponse) {
      return null;
    }
    const { oauthAccessToken, oauthTokenSecret } = tokenResponse;
    if (!oauthAccessToken || !oauthTokenSecret) {
      return null;
    }
    try {
      return TwitterAuthProvider.credential(oauthAccessToken, oauthTokenSecret);
    } catch (_a) {
      return null;
    }
  }
}
TwitterAuthProvider.TWITTER_SIGN_IN_METHOD = "twitter.com";
TwitterAuthProvider.PROVIDER_ID = "twitter.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function signUp(auth2, request) {
  return _performSignInRequest(auth2, "POST", "/v1/accounts:signUp", _addTidIfNecessary(auth2, request));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class UserCredentialImpl {
  constructor(params) {
    this.user = params.user;
    this.providerId = params.providerId;
    this._tokenResponse = params._tokenResponse;
    this.operationType = params.operationType;
  }
  static async _fromIdTokenResponse(auth2, operationType, idTokenResponse, isAnonymous = false) {
    const user = await UserImpl._fromIdTokenResponse(auth2, idTokenResponse, isAnonymous);
    const providerId = providerIdForResponse(idTokenResponse);
    const userCred = new UserCredentialImpl({
      user,
      providerId,
      _tokenResponse: idTokenResponse,
      operationType
    });
    return userCred;
  }
  static async _forOperation(user, operationType, response) {
    await user._updateTokensIfNecessary(
      response,
      /* reload */
      true
    );
    const providerId = providerIdForResponse(response);
    return new UserCredentialImpl({
      user,
      providerId,
      _tokenResponse: response,
      operationType
    });
  }
}
function providerIdForResponse(response) {
  if (response.providerId) {
    return response.providerId;
  }
  if ("phoneNumber" in response) {
    return "phone";
  }
  return null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class MultiFactorError extends FirebaseError {
  constructor(auth2, error, operationType, user) {
    var _a;
    super(error.code, error.message);
    this.operationType = operationType;
    this.user = user;
    Object.setPrototypeOf(this, MultiFactorError.prototype);
    this.customData = {
      appName: auth2.name,
      tenantId: (_a = auth2.tenantId) !== null && _a !== void 0 ? _a : void 0,
      _serverResponse: error.customData._serverResponse,
      operationType
    };
  }
  static _fromErrorAndOperation(auth2, error, operationType, user) {
    return new MultiFactorError(auth2, error, operationType, user);
  }
}
function _processCredentialSavingMfaContextIfNecessary(auth2, operationType, credential, user) {
  const idTokenProvider = operationType === "reauthenticate" ? credential._getReauthenticationResolver(auth2) : credential._getIdTokenResponse(auth2);
  return idTokenProvider.catch((error) => {
    if (error.code === `auth/${"multi-factor-auth-required"}`) {
      throw MultiFactorError._fromErrorAndOperation(auth2, error, operationType, user);
    }
    throw error;
  });
}
async function _link$1(user, credential, bypassAuthState = false) {
  const response = await _logoutIfInvalidated(user, credential._linkToIdToken(user.auth, await user.getIdToken()), bypassAuthState);
  return UserCredentialImpl._forOperation(user, "link", response);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _reauthenticate(user, credential, bypassAuthState = false) {
  const { auth: auth2 } = user;
  const operationType = "reauthenticate";
  try {
    const response = await _logoutIfInvalidated(user, _processCredentialSavingMfaContextIfNecessary(auth2, operationType, credential, user), bypassAuthState);
    _assert(
      response.idToken,
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const parsed = _parseToken(response.idToken);
    _assert(
      parsed,
      auth2,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const { sub: localId } = parsed;
    _assert(
      user.uid === localId,
      auth2,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    );
    return UserCredentialImpl._forOperation(user, operationType, response);
  } catch (e) {
    if ((e === null || e === void 0 ? void 0 : e.code) === `auth/${"user-not-found"}`) {
      _fail(
        auth2,
        "user-mismatch"
        /* AuthErrorCode.USER_MISMATCH */
      );
    }
    throw e;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _signInWithCredential(auth2, credential, bypassAuthState = false) {
  const operationType = "signIn";
  const response = await _processCredentialSavingMfaContextIfNecessary(auth2, operationType, credential);
  const userCredential = await UserCredentialImpl._fromIdTokenResponse(auth2, operationType, response);
  if (!bypassAuthState) {
    await auth2._updateCurrentUser(userCredential.user);
  }
  return userCredential;
}
async function signInWithCredential(auth2, credential) {
  return _signInWithCredential(_castAuth(auth2), credential);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _setActionCodeSettingsOnRequest(auth2, request, actionCodeSettings) {
  var _a;
  _assert(
    ((_a = actionCodeSettings.url) === null || _a === void 0 ? void 0 : _a.length) > 0,
    auth2,
    "invalid-continue-uri"
    /* AuthErrorCode.INVALID_CONTINUE_URI */
  );
  _assert(
    typeof actionCodeSettings.dynamicLinkDomain === "undefined" || actionCodeSettings.dynamicLinkDomain.length > 0,
    auth2,
    "invalid-dynamic-link-domain"
    /* AuthErrorCode.INVALID_DYNAMIC_LINK_DOMAIN */
  );
  request.continueUrl = actionCodeSettings.url;
  request.dynamicLinkDomain = actionCodeSettings.dynamicLinkDomain;
  request.canHandleCodeInApp = actionCodeSettings.handleCodeInApp;
  if (actionCodeSettings.iOS) {
    _assert(
      actionCodeSettings.iOS.bundleId.length > 0,
      auth2,
      "missing-ios-bundle-id"
      /* AuthErrorCode.MISSING_IOS_BUNDLE_ID */
    );
    request.iOSBundleId = actionCodeSettings.iOS.bundleId;
  }
  if (actionCodeSettings.android) {
    _assert(
      actionCodeSettings.android.packageName.length > 0,
      auth2,
      "missing-android-pkg-name"
      /* AuthErrorCode.MISSING_ANDROID_PACKAGE_NAME */
    );
    request.androidInstallApp = actionCodeSettings.android.installApp;
    request.androidMinimumVersionCode = actionCodeSettings.android.minimumVersion;
    request.androidPackageName = actionCodeSettings.android.packageName;
  }
}
async function createUserWithEmailAndPassword(auth2, email, password) {
  var _a;
  const authInternal = _castAuth(auth2);
  const request = {
    returnSecureToken: true,
    email,
    password,
    clientType: "CLIENT_TYPE_WEB"
    /* RecaptchaClientType.WEB */
  };
  let signUpResponse;
  if ((_a = authInternal._getRecaptchaConfig()) === null || _a === void 0 ? void 0 : _a.emailPasswordEnabled) {
    const requestWithRecaptcha = await injectRecaptchaFields(
      authInternal,
      request,
      "signUpPassword"
      /* RecaptchaActionName.SIGN_UP_PASSWORD */
    );
    signUpResponse = signUp(authInternal, requestWithRecaptcha);
  } else {
    signUpResponse = signUp(authInternal, request).catch(async (error) => {
      if (error.code === `auth/${"missing-recaptcha-token"}`) {
        console.log("Sign-up is protected by reCAPTCHA for this project. Automatically triggering the reCAPTCHA flow and restarting the sign-up flow.");
        const requestWithRecaptcha = await injectRecaptchaFields(
          authInternal,
          request,
          "signUpPassword"
          /* RecaptchaActionName.SIGN_UP_PASSWORD */
        );
        return signUp(authInternal, requestWithRecaptcha);
      } else {
        return Promise.reject(error);
      }
    });
  }
  const response = await signUpResponse.catch((error) => {
    return Promise.reject(error);
  });
  const userCredential = await UserCredentialImpl._fromIdTokenResponse(authInternal, "signIn", response);
  await authInternal._updateCurrentUser(userCredential.user);
  return userCredential;
}
function signInWithEmailAndPassword(auth2, email, password) {
  return signInWithCredential(getModularInstance(auth2), EmailAuthProvider.credential(email, password));
}
async function sendEmailVerification(user, actionCodeSettings) {
  const userInternal = getModularInstance(user);
  const idToken = await user.getIdToken();
  const request = {
    requestType: "VERIFY_EMAIL",
    idToken
  };
  if (actionCodeSettings) {
    _setActionCodeSettingsOnRequest(userInternal.auth, request, actionCodeSettings);
  }
  const { email } = await sendEmailVerification$1(userInternal.auth, request);
  if (email !== user.email) {
    await user.reload();
  }
}
function onIdTokenChanged(auth2, nextOrObserver, error, completed) {
  return getModularInstance(auth2).onIdTokenChanged(nextOrObserver, error, completed);
}
function beforeAuthStateChanged(auth2, callback, onAbort) {
  return getModularInstance(auth2).beforeAuthStateChanged(callback, onAbort);
}
function onAuthStateChanged(auth2, nextOrObserver, error, completed) {
  return getModularInstance(auth2).onAuthStateChanged(nextOrObserver, error, completed);
}
function signOut(auth2) {
  return getModularInstance(auth2).signOut();
}
const STORAGE_AVAILABLE_KEY = "__sak";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class BrowserPersistenceClass {
  constructor(storageRetriever, type) {
    this.storageRetriever = storageRetriever;
    this.type = type;
  }
  _isAvailable() {
    try {
      if (!this.storage) {
        return Promise.resolve(false);
      }
      this.storage.setItem(STORAGE_AVAILABLE_KEY, "1");
      this.storage.removeItem(STORAGE_AVAILABLE_KEY);
      return Promise.resolve(true);
    } catch (_a) {
      return Promise.resolve(false);
    }
  }
  _set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }
  _get(key) {
    const json = this.storage.getItem(key);
    return Promise.resolve(json ? JSON.parse(json) : null);
  }
  _remove(key) {
    this.storage.removeItem(key);
    return Promise.resolve();
  }
  get storage() {
    return this.storageRetriever();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _iframeCannotSyncWebStorage() {
  const ua2 = getUA();
  return _isSafari(ua2) || _isIOS(ua2);
}
const _POLLING_INTERVAL_MS$1 = 1e3;
const IE10_LOCAL_STORAGE_SYNC_DELAY = 10;
class BrowserLocalPersistence extends BrowserPersistenceClass {
  constructor() {
    super(
      () => window.localStorage,
      "LOCAL"
      /* PersistenceType.LOCAL */
    );
    this.boundEventHandler = (event, poll) => this.onStorageEvent(event, poll);
    this.listeners = {};
    this.localCache = {};
    this.pollTimer = null;
    this.safariLocalStorageNotSynced = _iframeCannotSyncWebStorage() && _isIframe();
    this.fallbackToPolling = _isMobileBrowser();
    this._shouldAllowMigration = true;
  }
  forAllChangedKeys(cb2) {
    for (const key of Object.keys(this.listeners)) {
      const newValue = this.storage.getItem(key);
      const oldValue = this.localCache[key];
      if (newValue !== oldValue) {
        cb2(key, oldValue, newValue);
      }
    }
  }
  onStorageEvent(event, poll = false) {
    if (!event.key) {
      this.forAllChangedKeys((key2, _oldValue, newValue) => {
        this.notifyListeners(key2, newValue);
      });
      return;
    }
    const key = event.key;
    if (poll) {
      this.detachListener();
    } else {
      this.stopPolling();
    }
    if (this.safariLocalStorageNotSynced) {
      const storedValue2 = this.storage.getItem(key);
      if (event.newValue !== storedValue2) {
        if (event.newValue !== null) {
          this.storage.setItem(key, event.newValue);
        } else {
          this.storage.removeItem(key);
        }
      } else if (this.localCache[key] === event.newValue && !poll) {
        return;
      }
    }
    const triggerListeners = () => {
      const storedValue2 = this.storage.getItem(key);
      if (!poll && this.localCache[key] === storedValue2) {
        return;
      }
      this.notifyListeners(key, storedValue2);
    };
    const storedValue = this.storage.getItem(key);
    if (_isIE10() && storedValue !== event.newValue && event.newValue !== event.oldValue) {
      setTimeout(triggerListeners, IE10_LOCAL_STORAGE_SYNC_DELAY);
    } else {
      triggerListeners();
    }
  }
  notifyListeners(key, value) {
    this.localCache[key] = value;
    const listeners = this.listeners[key];
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        listener(value ? JSON.parse(value) : value);
      }
    }
  }
  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      this.forAllChangedKeys((key, oldValue, newValue) => {
        this.onStorageEvent(
          new StorageEvent("storage", {
            key,
            oldValue,
            newValue
          }),
          /* poll */
          true
        );
      });
    }, _POLLING_INTERVAL_MS$1);
  }
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(key, listener) {
    if (Object.keys(this.listeners).length === 0) {
      if (this.fallbackToPolling) {
        this.startPolling();
      } else {
        this.attachListener();
      }
    }
    if (!this.listeners[key]) {
      this.listeners[key] = /* @__PURE__ */ new Set();
      this.localCache[key] = this.storage.getItem(key);
    }
    this.listeners[key].add(listener);
  }
  _removeListener(key, listener) {
    if (this.listeners[key]) {
      this.listeners[key].delete(listener);
      if (this.listeners[key].size === 0) {
        delete this.listeners[key];
      }
    }
    if (Object.keys(this.listeners).length === 0) {
      this.detachListener();
      this.stopPolling();
    }
  }
  // Update local cache on base operations:
  async _set(key, value) {
    await super._set(key, value);
    this.localCache[key] = JSON.stringify(value);
  }
  async _get(key) {
    const value = await super._get(key);
    this.localCache[key] = JSON.stringify(value);
    return value;
  }
  async _remove(key) {
    await super._remove(key);
    delete this.localCache[key];
  }
}
BrowserLocalPersistence.type = "LOCAL";
const browserLocalPersistence = BrowserLocalPersistence;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class BrowserSessionPersistence extends BrowserPersistenceClass {
  constructor() {
    super(
      () => window.sessionStorage,
      "SESSION"
      /* PersistenceType.SESSION */
    );
  }
  _addListener(_key, _listener) {
    return;
  }
  _removeListener(_key, _listener) {
    return;
  }
}
BrowserSessionPersistence.type = "SESSION";
const browserSessionPersistence = BrowserSessionPersistence;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _allSettled(promises) {
  return Promise.all(promises.map(async (promise) => {
    try {
      const value = await promise;
      return {
        fulfilled: true,
        value
      };
    } catch (reason) {
      return {
        fulfilled: false,
        reason
      };
    }
  }));
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Receiver {
  constructor(eventTarget) {
    this.eventTarget = eventTarget;
    this.handlersMap = {};
    this.boundEventHandler = this.handleEvent.bind(this);
  }
  /**
   * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
   *
   * @param eventTarget - An event target (such as window or self) through which the underlying
   * messages will be received.
   */
  static _getInstance(eventTarget) {
    const existingInstance = this.receivers.find((receiver) => receiver.isListeningto(eventTarget));
    if (existingInstance) {
      return existingInstance;
    }
    const newInstance = new Receiver(eventTarget);
    this.receivers.push(newInstance);
    return newInstance;
  }
  isListeningto(eventTarget) {
    return this.eventTarget === eventTarget;
  }
  /**
   * Fans out a MessageEvent to the appropriate listeners.
   *
   * @remarks
   * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
   * finished processing.
   *
   * @param event - The MessageEvent.
   *
   */
  async handleEvent(event) {
    const messageEvent = event;
    const { eventId, eventType, data } = messageEvent.data;
    const handlers = this.handlersMap[eventType];
    if (!(handlers === null || handlers === void 0 ? void 0 : handlers.size)) {
      return;
    }
    messageEvent.ports[0].postMessage({
      status: "ack",
      eventId,
      eventType
    });
    const promises = Array.from(handlers).map(async (handler) => handler(messageEvent.origin, data));
    const response = await _allSettled(promises);
    messageEvent.ports[0].postMessage({
      status: "done",
      eventId,
      eventType,
      response
    });
  }
  /**
   * Subscribe an event handler for a particular event.
   *
   * @param eventType - Event name to subscribe to.
   * @param eventHandler - The event handler which should receive the events.
   *
   */
  _subscribe(eventType, eventHandler) {
    if (Object.keys(this.handlersMap).length === 0) {
      this.eventTarget.addEventListener("message", this.boundEventHandler);
    }
    if (!this.handlersMap[eventType]) {
      this.handlersMap[eventType] = /* @__PURE__ */ new Set();
    }
    this.handlersMap[eventType].add(eventHandler);
  }
  /**
   * Unsubscribe an event handler from a particular event.
   *
   * @param eventType - Event name to unsubscribe from.
   * @param eventHandler - Optinoal event handler, if none provided, unsubscribe all handlers on this event.
   *
   */
  _unsubscribe(eventType, eventHandler) {
    if (this.handlersMap[eventType] && eventHandler) {
      this.handlersMap[eventType].delete(eventHandler);
    }
    if (!eventHandler || this.handlersMap[eventType].size === 0) {
      delete this.handlersMap[eventType];
    }
    if (Object.keys(this.handlersMap).length === 0) {
      this.eventTarget.removeEventListener("message", this.boundEventHandler);
    }
  }
}
Receiver.receivers = [];
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _generateEventId(prefix = "", digits = 10) {
  let random = "";
  for (let i = 0; i < digits; i++) {
    random += Math.floor(Math.random() * 10);
  }
  return prefix + random;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Sender {
  constructor(target) {
    this.target = target;
    this.handlers = /* @__PURE__ */ new Set();
  }
  /**
   * Unsubscribe the handler and remove it from our tracking Set.
   *
   * @param handler - The handler to unsubscribe.
   */
  removeMessageHandler(handler) {
    if (handler.messageChannel) {
      handler.messageChannel.port1.removeEventListener("message", handler.onMessage);
      handler.messageChannel.port1.close();
    }
    this.handlers.delete(handler);
  }
  /**
   * Send a message to the Receiver located at {@link target}.
   *
   * @remarks
   * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
   * receiver has had a chance to fully process the event.
   *
   * @param eventType - Type of event to send.
   * @param data - The payload of the event.
   * @param timeout - Timeout for waiting on an ACK from the receiver.
   *
   * @returns An array of settled promises from all the handlers that were listening on the receiver.
   */
  async _send(eventType, data, timeout = 50) {
    const messageChannel = typeof MessageChannel !== "undefined" ? new MessageChannel() : null;
    if (!messageChannel) {
      throw new Error(
        "connection_unavailable"
        /* _MessageError.CONNECTION_UNAVAILABLE */
      );
    }
    let completionTimer;
    let handler;
    return new Promise((resolve, reject) => {
      const eventId = _generateEventId("", 20);
      messageChannel.port1.start();
      const ackTimer = setTimeout(() => {
        reject(new Error(
          "unsupported_event"
          /* _MessageError.UNSUPPORTED_EVENT */
        ));
      }, timeout);
      handler = {
        messageChannel,
        onMessage(event) {
          const messageEvent = event;
          if (messageEvent.data.eventId !== eventId) {
            return;
          }
          switch (messageEvent.data.status) {
            case "ack":
              clearTimeout(ackTimer);
              completionTimer = setTimeout(
                () => {
                  reject(new Error(
                    "timeout"
                    /* _MessageError.TIMEOUT */
                  ));
                },
                3e3
                /* _TimeoutDuration.COMPLETION */
              );
              break;
            case "done":
              clearTimeout(completionTimer);
              resolve(messageEvent.data.response);
              break;
            default:
              clearTimeout(ackTimer);
              clearTimeout(completionTimer);
              reject(new Error(
                "invalid_response"
                /* _MessageError.INVALID_RESPONSE */
              ));
              break;
          }
        }
      };
      this.handlers.add(handler);
      messageChannel.port1.addEventListener("message", handler.onMessage);
      this.target.postMessage({
        eventType,
        eventId,
        data
      }, [messageChannel.port2]);
    }).finally(() => {
      if (handler) {
        this.removeMessageHandler(handler);
      }
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _window() {
  return window;
}
function _setWindowLocation(url) {
  _window().location.href = url;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _isWorker() {
  return typeof _window()["WorkerGlobalScope"] !== "undefined" && typeof _window()["importScripts"] === "function";
}
async function _getActiveServiceWorker() {
  if (!(navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    return registration.active;
  } catch (_a) {
    return null;
  }
}
function _getServiceWorkerController() {
  var _a;
  return ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.controller) || null;
}
function _getWorkerGlobalScope() {
  return _isWorker() ? self : null;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DB_NAME = "firebaseLocalStorageDb";
const DB_VERSION = 1;
const DB_OBJECTSTORE_NAME = "firebaseLocalStorage";
const DB_DATA_KEYPATH = "fbase_key";
class DBPromise {
  constructor(request) {
    this.request = request;
  }
  toPromise() {
    return new Promise((resolve, reject) => {
      this.request.addEventListener("success", () => {
        resolve(this.request.result);
      });
      this.request.addEventListener("error", () => {
        reject(this.request.error);
      });
    });
  }
}
function getObjectStore(db2, isReadWrite) {
  return db2.transaction([DB_OBJECTSTORE_NAME], isReadWrite ? "readwrite" : "readonly").objectStore(DB_OBJECTSTORE_NAME);
}
function _deleteDatabase() {
  const request = indexedDB.deleteDatabase(DB_NAME);
  return new DBPromise(request).toPromise();
}
function _openDatabase() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  return new Promise((resolve, reject) => {
    request.addEventListener("error", () => {
      reject(request.error);
    });
    request.addEventListener("upgradeneeded", () => {
      const db2 = request.result;
      try {
        db2.createObjectStore(DB_OBJECTSTORE_NAME, { keyPath: DB_DATA_KEYPATH });
      } catch (e) {
        reject(e);
      }
    });
    request.addEventListener("success", async () => {
      const db2 = request.result;
      if (!db2.objectStoreNames.contains(DB_OBJECTSTORE_NAME)) {
        db2.close();
        await _deleteDatabase();
        resolve(await _openDatabase());
      } else {
        resolve(db2);
      }
    });
  });
}
async function _putObject(db2, key, value) {
  const request = getObjectStore(db2, true).put({
    [DB_DATA_KEYPATH]: key,
    value
  });
  return new DBPromise(request).toPromise();
}
async function getObject(db2, key) {
  const request = getObjectStore(db2, false).get(key);
  const data = await new DBPromise(request).toPromise();
  return data === void 0 ? null : data.value;
}
function _deleteObject(db2, key) {
  const request = getObjectStore(db2, true).delete(key);
  return new DBPromise(request).toPromise();
}
const _POLLING_INTERVAL_MS = 800;
const _TRANSACTION_RETRY_COUNT = 3;
class IndexedDBLocalPersistence {
  constructor() {
    this.type = "LOCAL";
    this._shouldAllowMigration = true;
    this.listeners = {};
    this.localCache = {};
    this.pollTimer = null;
    this.pendingWrites = 0;
    this.receiver = null;
    this.sender = null;
    this.serviceWorkerReceiverAvailable = false;
    this.activeServiceWorker = null;
    this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {
    }, () => {
    });
  }
  async _openDb() {
    if (this.db) {
      return this.db;
    }
    this.db = await _openDatabase();
    return this.db;
  }
  async _withRetries(op) {
    let numAttempts = 0;
    while (true) {
      try {
        const db2 = await this._openDb();
        return await op(db2);
      } catch (e) {
        if (numAttempts++ > _TRANSACTION_RETRY_COUNT) {
          throw e;
        }
        if (this.db) {
          this.db.close();
          this.db = void 0;
        }
      }
    }
  }
  /**
   * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
   * postMessage interface to send these events to the worker ourselves.
   */
  async initializeServiceWorkerMessaging() {
    return _isWorker() ? this.initializeReceiver() : this.initializeSender();
  }
  /**
   * As the worker we should listen to events from the main window.
   */
  async initializeReceiver() {
    this.receiver = Receiver._getInstance(_getWorkerGlobalScope());
    this.receiver._subscribe("keyChanged", async (_origin, data) => {
      const keys = await this._poll();
      return {
        keyProcessed: keys.includes(data.key)
      };
    });
    this.receiver._subscribe("ping", async (_origin, _data) => {
      return [
        "keyChanged"
        /* _EventType.KEY_CHANGED */
      ];
    });
  }
  /**
   * As the main window, we should let the worker know when keys change (set and remove).
   *
   * @remarks
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
   * may not resolve.
   */
  async initializeSender() {
    var _a, _b;
    this.activeServiceWorker = await _getActiveServiceWorker();
    if (!this.activeServiceWorker) {
      return;
    }
    this.sender = new Sender(this.activeServiceWorker);
    const results = await this.sender._send(
      "ping",
      {},
      800
      /* _TimeoutDuration.LONG_ACK */
    );
    if (!results) {
      return;
    }
    if (((_a = results[0]) === null || _a === void 0 ? void 0 : _a.fulfilled) && ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.value.includes(
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ))) {
      this.serviceWorkerReceiverAvailable = true;
    }
  }
  /**
   * Let the worker know about a changed key, the exact key doesn't technically matter since the
   * worker will just trigger a full sync anyway.
   *
   * @remarks
   * For now, we only support one service worker per page.
   *
   * @param key - Storage key which changed.
   */
  async notifyServiceWorker(key) {
    if (!this.sender || !this.activeServiceWorker || _getServiceWorkerController() !== this.activeServiceWorker) {
      return;
    }
    try {
      await this.sender._send(
        "keyChanged",
        { key },
        // Use long timeout if receiver has previously responded to a ping from us.
        this.serviceWorkerReceiverAvailable ? 800 : 50
        /* _TimeoutDuration.ACK */
      );
    } catch (_a) {
    }
  }
  async _isAvailable() {
    try {
      if (!indexedDB) {
        return false;
      }
      const db2 = await _openDatabase();
      await _putObject(db2, STORAGE_AVAILABLE_KEY, "1");
      await _deleteObject(db2, STORAGE_AVAILABLE_KEY);
      return true;
    } catch (_a) {
    }
    return false;
  }
  async _withPendingWrite(write) {
    this.pendingWrites++;
    try {
      await write();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(key, value) {
    return this._withPendingWrite(async () => {
      await this._withRetries((db2) => _putObject(db2, key, value));
      this.localCache[key] = value;
      return this.notifyServiceWorker(key);
    });
  }
  async _get(key) {
    const obj = await this._withRetries((db2) => getObject(db2, key));
    this.localCache[key] = obj;
    return obj;
  }
  async _remove(key) {
    return this._withPendingWrite(async () => {
      await this._withRetries((db2) => _deleteObject(db2, key));
      delete this.localCache[key];
      return this.notifyServiceWorker(key);
    });
  }
  async _poll() {
    const result = await this._withRetries((db2) => {
      const getAllRequest = getObjectStore(db2, false).getAll();
      return new DBPromise(getAllRequest).toPromise();
    });
    if (!result) {
      return [];
    }
    if (this.pendingWrites !== 0) {
      return [];
    }
    const keys = [];
    const keysInResult = /* @__PURE__ */ new Set();
    for (const { fbase_key: key, value } of result) {
      keysInResult.add(key);
      if (JSON.stringify(this.localCache[key]) !== JSON.stringify(value)) {
        this.notifyListeners(key, value);
        keys.push(key);
      }
    }
    for (const localKey of Object.keys(this.localCache)) {
      if (this.localCache[localKey] && !keysInResult.has(localKey)) {
        this.notifyListeners(localKey, null);
        keys.push(localKey);
      }
    }
    return keys;
  }
  notifyListeners(key, newValue) {
    this.localCache[key] = newValue;
    const listeners = this.listeners[key];
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        listener(newValue);
      }
    }
  }
  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(async () => this._poll(), _POLLING_INTERVAL_MS);
  }
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
  _addListener(key, listener) {
    if (Object.keys(this.listeners).length === 0) {
      this.startPolling();
    }
    if (!this.listeners[key]) {
      this.listeners[key] = /* @__PURE__ */ new Set();
      void this._get(key);
    }
    this.listeners[key].add(listener);
  }
  _removeListener(key, listener) {
    if (this.listeners[key]) {
      this.listeners[key].delete(listener);
      if (this.listeners[key].size === 0) {
        delete this.listeners[key];
      }
    }
    if (Object.keys(this.listeners).length === 0) {
      this.stopPolling();
    }
  }
}
IndexedDBLocalPersistence.type = "LOCAL";
const indexedDBLocalPersistence = IndexedDBLocalPersistence;
new Delay(3e4, 6e4);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _withDefaultResolver(auth2, resolverOverride) {
  if (resolverOverride) {
    return _getInstance(resolverOverride);
  }
  _assert(
    auth2._popupRedirectResolver,
    auth2,
    "argument-error"
    /* AuthErrorCode.ARGUMENT_ERROR */
  );
  return auth2._popupRedirectResolver;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class IdpCredential extends AuthCredential {
  constructor(params) {
    super(
      "custom",
      "custom"
      /* ProviderId.CUSTOM */
    );
    this.params = params;
  }
  _getIdTokenResponse(auth2) {
    return signInWithIdp(auth2, this._buildIdpRequest());
  }
  _linkToIdToken(auth2, idToken) {
    return signInWithIdp(auth2, this._buildIdpRequest(idToken));
  }
  _getReauthenticationResolver(auth2) {
    return signInWithIdp(auth2, this._buildIdpRequest());
  }
  _buildIdpRequest(idToken) {
    const request = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: true,
      returnIdpCredential: true
    };
    if (idToken) {
      request.idToken = idToken;
    }
    return request;
  }
}
function _signIn(params) {
  return _signInWithCredential(params.auth, new IdpCredential(params), params.bypassAuthState);
}
function _reauth(params) {
  const { auth: auth2, user } = params;
  _assert(
    user,
    auth2,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  return _reauthenticate(user, new IdpCredential(params), params.bypassAuthState);
}
async function _link(params) {
  const { auth: auth2, user } = params;
  _assert(
    user,
    auth2,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  return _link$1(user, new IdpCredential(params), params.bypassAuthState);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AbstractPopupRedirectOperation {
  constructor(auth2, filter, resolver, user, bypassAuthState = false) {
    this.auth = auth2;
    this.resolver = resolver;
    this.user = user;
    this.bypassAuthState = bypassAuthState;
    this.pendingPromise = null;
    this.eventManager = null;
    this.filter = Array.isArray(filter) ? filter : [filter];
  }
  execute() {
    return new Promise(async (resolve, reject) => {
      this.pendingPromise = { resolve, reject };
      try {
        this.eventManager = await this.resolver._initialize(this.auth);
        await this.onExecution();
        this.eventManager.registerConsumer(this);
      } catch (e) {
        this.reject(e);
      }
    });
  }
  async onAuthEvent(event) {
    const { urlResponse, sessionId, postBody, tenantId, error, type } = event;
    if (error) {
      this.reject(error);
      return;
    }
    const params = {
      auth: this.auth,
      requestUri: urlResponse,
      sessionId,
      tenantId: tenantId || void 0,
      postBody: postBody || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState
    };
    try {
      this.resolve(await this.getIdpTask(type)(params));
    } catch (e) {
      this.reject(e);
    }
  }
  onError(error) {
    this.reject(error);
  }
  getIdpTask(type) {
    switch (type) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return _signIn;
      case "linkViaPopup":
      case "linkViaRedirect":
        return _link;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return _reauth;
      default:
        _fail(
          this.auth,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  resolve(cred) {
    debugAssert(this.pendingPromise, "Pending promise was never set");
    this.pendingPromise.resolve(cred);
    this.unregisterAndCleanUp();
  }
  reject(error) {
    debugAssert(this.pendingPromise, "Pending promise was never set");
    this.pendingPromise.reject(error);
    this.unregisterAndCleanUp();
  }
  unregisterAndCleanUp() {
    if (this.eventManager) {
      this.eventManager.unregisterConsumer(this);
    }
    this.pendingPromise = null;
    this.cleanUp();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _POLL_WINDOW_CLOSE_TIMEOUT = new Delay(2e3, 1e4);
async function signInWithPopup(auth2, provider2, resolver) {
  const authInternal = _castAuth(auth2);
  _assertInstanceOf(auth2, provider2, FederatedAuthProvider);
  const resolverInternal = _withDefaultResolver(authInternal, resolver);
  const action = new PopupOperation(authInternal, "signInViaPopup", provider2, resolverInternal);
  return action.executeNotNull();
}
class PopupOperation extends AbstractPopupRedirectOperation {
  constructor(auth2, filter, provider2, resolver, user) {
    super(auth2, filter, resolver, user);
    this.provider = provider2;
    this.authWindow = null;
    this.pollId = null;
    if (PopupOperation.currentPopupAction) {
      PopupOperation.currentPopupAction.cancel();
    }
    PopupOperation.currentPopupAction = this;
  }
  async executeNotNull() {
    const result = await this.execute();
    _assert(
      result,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    return result;
  }
  async onExecution() {
    debugAssert(this.filter.length === 1, "Popup operations only handle one event");
    const eventId = _generateEventId();
    this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      // There's always one, see constructor
      eventId
    );
    this.authWindow.associatedEvent = eventId;
    this.resolver._originValidation(this.auth).catch((e) => {
      this.reject(e);
    });
    this.resolver._isIframeWebStorageSupported(this.auth, (isSupported) => {
      if (!isSupported) {
        this.reject(_createError(
          this.auth,
          "web-storage-unsupported"
          /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */
        ));
      }
    });
    this.pollUserCancellation();
  }
  get eventId() {
    var _a;
    return ((_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.associatedEvent) || null;
  }
  cancel() {
    this.reject(_createError(
      this.auth,
      "cancelled-popup-request"
      /* AuthErrorCode.EXPIRED_POPUP_REQUEST */
    ));
  }
  cleanUp() {
    if (this.authWindow) {
      this.authWindow.close();
    }
    if (this.pollId) {
      window.clearTimeout(this.pollId);
    }
    this.authWindow = null;
    this.pollId = null;
    PopupOperation.currentPopupAction = null;
  }
  pollUserCancellation() {
    const poll = () => {
      var _a, _b;
      if ((_b = (_a = this.authWindow) === null || _a === void 0 ? void 0 : _a.window) === null || _b === void 0 ? void 0 : _b.closed) {
        this.pollId = window.setTimeout(
          () => {
            this.pollId = null;
            this.reject(_createError(
              this.auth,
              "popup-closed-by-user"
              /* AuthErrorCode.POPUP_CLOSED_BY_USER */
            ));
          },
          8e3
          /* _Timeout.AUTH_EVENT */
        );
        return;
      }
      this.pollId = window.setTimeout(poll, _POLL_WINDOW_CLOSE_TIMEOUT.get());
    };
    poll();
  }
}
PopupOperation.currentPopupAction = null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PENDING_REDIRECT_KEY = "pendingRedirect";
const redirectOutcomeMap = /* @__PURE__ */ new Map();
class RedirectAction extends AbstractPopupRedirectOperation {
  constructor(auth2, resolver, bypassAuthState = false) {
    super(auth2, [
      "signInViaRedirect",
      "linkViaRedirect",
      "reauthViaRedirect",
      "unknown"
      /* AuthEventType.UNKNOWN */
    ], resolver, void 0, bypassAuthState);
    this.eventId = null;
  }
  /**
   * Override the execute function; if we already have a redirect result, then
   * just return it.
   */
  async execute() {
    let readyOutcome = redirectOutcomeMap.get(this.auth._key());
    if (!readyOutcome) {
      try {
        const hasPendingRedirect = await _getAndClearPendingRedirectStatus(this.resolver, this.auth);
        const result = hasPendingRedirect ? await super.execute() : null;
        readyOutcome = () => Promise.resolve(result);
      } catch (e) {
        readyOutcome = () => Promise.reject(e);
      }
      redirectOutcomeMap.set(this.auth._key(), readyOutcome);
    }
    if (!this.bypassAuthState) {
      redirectOutcomeMap.set(this.auth._key(), () => Promise.resolve(null));
    }
    return readyOutcome();
  }
  async onAuthEvent(event) {
    if (event.type === "signInViaRedirect") {
      return super.onAuthEvent(event);
    } else if (event.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (event.eventId) {
      const user = await this.auth._redirectUserForId(event.eventId);
      if (user) {
        this.user = user;
        return super.onAuthEvent(event);
      } else {
        this.resolve(null);
      }
    }
  }
  async onExecution() {
  }
  cleanUp() {
  }
}
async function _getAndClearPendingRedirectStatus(resolver, auth2) {
  const key = pendingRedirectKey(auth2);
  const persistence = resolverPersistence(resolver);
  if (!await persistence._isAvailable()) {
    return false;
  }
  const hasPendingRedirect = await persistence._get(key) === "true";
  await persistence._remove(key);
  return hasPendingRedirect;
}
function _overrideRedirectResult(auth2, result) {
  redirectOutcomeMap.set(auth2._key(), result);
}
function resolverPersistence(resolver) {
  return _getInstance(resolver._redirectPersistence);
}
function pendingRedirectKey(auth2) {
  return _persistenceKeyName(PENDING_REDIRECT_KEY, auth2.config.apiKey, auth2.name);
}
async function _getRedirectResult(auth2, resolverExtern, bypassAuthState = false) {
  const authInternal = _castAuth(auth2);
  const resolver = _withDefaultResolver(authInternal, resolverExtern);
  const action = new RedirectAction(authInternal, resolver, bypassAuthState);
  const result = await action.execute();
  if (result && !bypassAuthState) {
    delete result.user._redirectEventId;
    await authInternal._persistUserIfCurrent(result.user);
    await authInternal._setRedirectUser(null, resolverExtern);
  }
  return result;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const EVENT_DUPLICATION_CACHE_DURATION_MS = 10 * 60 * 1e3;
class AuthEventManager {
  constructor(auth2) {
    this.auth = auth2;
    this.cachedEventUids = /* @__PURE__ */ new Set();
    this.consumers = /* @__PURE__ */ new Set();
    this.queuedRedirectEvent = null;
    this.hasHandledPotentialRedirect = false;
    this.lastProcessedEventTime = Date.now();
  }
  registerConsumer(authEventConsumer) {
    this.consumers.add(authEventConsumer);
    if (this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, authEventConsumer)) {
      this.sendToConsumer(this.queuedRedirectEvent, authEventConsumer);
      this.saveEventToCache(this.queuedRedirectEvent);
      this.queuedRedirectEvent = null;
    }
  }
  unregisterConsumer(authEventConsumer) {
    this.consumers.delete(authEventConsumer);
  }
  onEvent(event) {
    if (this.hasEventBeenHandled(event)) {
      return false;
    }
    let handled = false;
    this.consumers.forEach((consumer) => {
      if (this.isEventForConsumer(event, consumer)) {
        handled = true;
        this.sendToConsumer(event, consumer);
        this.saveEventToCache(event);
      }
    });
    if (this.hasHandledPotentialRedirect || !isRedirectEvent(event)) {
      return handled;
    }
    this.hasHandledPotentialRedirect = true;
    if (!handled) {
      this.queuedRedirectEvent = event;
      handled = true;
    }
    return handled;
  }
  sendToConsumer(event, consumer) {
    var _a;
    if (event.error && !isNullRedirectEvent(event)) {
      const code = ((_a = event.error.code) === null || _a === void 0 ? void 0 : _a.split("auth/")[1]) || "internal-error";
      consumer.onError(_createError(this.auth, code));
    } else {
      consumer.onAuthEvent(event);
    }
  }
  isEventForConsumer(event, consumer) {
    const eventIdMatches = consumer.eventId === null || !!event.eventId && event.eventId === consumer.eventId;
    return consumer.filter.includes(event.type) && eventIdMatches;
  }
  hasEventBeenHandled(event) {
    if (Date.now() - this.lastProcessedEventTime >= EVENT_DUPLICATION_CACHE_DURATION_MS) {
      this.cachedEventUids.clear();
    }
    return this.cachedEventUids.has(eventUid(event));
  }
  saveEventToCache(event) {
    this.cachedEventUids.add(eventUid(event));
    this.lastProcessedEventTime = Date.now();
  }
}
function eventUid(e) {
  return [e.type, e.eventId, e.sessionId, e.tenantId].filter((v2) => v2).join("-");
}
function isNullRedirectEvent({ type, error }) {
  return type === "unknown" && (error === null || error === void 0 ? void 0 : error.code) === `auth/${"no-auth-event"}`;
}
function isRedirectEvent(event) {
  switch (event.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return true;
    case "unknown":
      return isNullRedirectEvent(event);
    default:
      return false;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function _getProjectConfig(auth2, request = {}) {
  return _performApiRequest(auth2, "GET", "/v1/projects", request);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IP_ADDRESS_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const HTTP_REGEX = /^https?/;
async function _validateOrigin(auth2) {
  if (auth2.config.emulator) {
    return;
  }
  const { authorizedDomains } = await _getProjectConfig(auth2);
  for (const domain of authorizedDomains) {
    try {
      if (matchDomain(domain)) {
        return;
      }
    } catch (_a) {
    }
  }
  _fail(
    auth2,
    "unauthorized-domain"
    /* AuthErrorCode.INVALID_ORIGIN */
  );
}
function matchDomain(expected) {
  const currentUrl = _getCurrentUrl();
  const { protocol, hostname } = new URL(currentUrl);
  if (expected.startsWith("chrome-extension://")) {
    const ceUrl = new URL(expected);
    if (ceUrl.hostname === "" && hostname === "") {
      return protocol === "chrome-extension:" && expected.replace("chrome-extension://", "") === currentUrl.replace("chrome-extension://", "");
    }
    return protocol === "chrome-extension:" && ceUrl.hostname === hostname;
  }
  if (!HTTP_REGEX.test(protocol)) {
    return false;
  }
  if (IP_ADDRESS_REGEX.test(expected)) {
    return hostname === expected;
  }
  const escapedDomainPattern = expected.replace(/\./g, "\\.");
  const re = new RegExp("^(.+\\." + escapedDomainPattern + "|" + escapedDomainPattern + ")$", "i");
  return re.test(hostname);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const NETWORK_TIMEOUT = new Delay(3e4, 6e4);
function resetUnloadedGapiModules() {
  const beacon = _window().___jsl;
  if (beacon === null || beacon === void 0 ? void 0 : beacon.H) {
    for (const hint of Object.keys(beacon.H)) {
      beacon.H[hint].r = beacon.H[hint].r || [];
      beacon.H[hint].L = beacon.H[hint].L || [];
      beacon.H[hint].r = [...beacon.H[hint].L];
      if (beacon.CP) {
        for (let i = 0; i < beacon.CP.length; i++) {
          beacon.CP[i] = null;
        }
      }
    }
  }
}
function loadGapi(auth2) {
  return new Promise((resolve, reject) => {
    var _a, _b, _c2;
    function loadGapiIframe() {
      resetUnloadedGapiModules();
      gapi.load("gapi.iframes", {
        callback: () => {
          resolve(gapi.iframes.getContext());
        },
        ontimeout: () => {
          resetUnloadedGapiModules();
          reject(_createError(
            auth2,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        },
        timeout: NETWORK_TIMEOUT.get()
      });
    }
    if ((_b = (_a = _window().gapi) === null || _a === void 0 ? void 0 : _a.iframes) === null || _b === void 0 ? void 0 : _b.Iframe) {
      resolve(gapi.iframes.getContext());
    } else if (!!((_c2 = _window().gapi) === null || _c2 === void 0 ? void 0 : _c2.load)) {
      loadGapiIframe();
    } else {
      const cbName = _generateCallbackName("iframefcb");
      _window()[cbName] = () => {
        if (!!gapi.load) {
          loadGapiIframe();
        } else {
          reject(_createError(
            auth2,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        }
      };
      return _loadJS(`https://apis.google.com/js/api.js?onload=${cbName}`).catch((e) => reject(e));
    }
  }).catch((error) => {
    cachedGApiLoader = null;
    throw error;
  });
}
let cachedGApiLoader = null;
function _loadGapi(auth2) {
  cachedGApiLoader = cachedGApiLoader || loadGapi(auth2);
  return cachedGApiLoader;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PING_TIMEOUT = new Delay(5e3, 15e3);
const IFRAME_PATH = "__/auth/iframe";
const EMULATED_IFRAME_PATH = "emulator/auth/iframe";
const IFRAME_ATTRIBUTES = {
  style: {
    position: "absolute",
    top: "-100px",
    width: "1px",
    height: "1px"
  },
  "aria-hidden": "true",
  tabindex: "-1"
};
const EID_FROM_APIHOST = /* @__PURE__ */ new Map([
  ["identitytoolkit.googleapis.com", "p"],
  ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
  ["test-identitytoolkit.sandbox.googleapis.com", "t"]
  // test
]);
function getIframeUrl(auth2) {
  const config = auth2.config;
  _assert(
    config.authDomain,
    auth2,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  const url = config.emulator ? _emulatorUrl(config, EMULATED_IFRAME_PATH) : `https://${auth2.config.authDomain}/${IFRAME_PATH}`;
  const params = {
    apiKey: config.apiKey,
    appName: auth2.name,
    v: SDK_VERSION
  };
  const eid = EID_FROM_APIHOST.get(auth2.config.apiHost);
  if (eid) {
    params.eid = eid;
  }
  const frameworks = auth2._getFrameworks();
  if (frameworks.length) {
    params.fw = frameworks.join(",");
  }
  return `${url}?${querystring(params).slice(1)}`;
}
async function _openIframe(auth2) {
  const context = await _loadGapi(auth2);
  const gapi2 = _window().gapi;
  _assert(
    gapi2,
    auth2,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  return context.open({
    where: document.body,
    url: getIframeUrl(auth2),
    messageHandlersFilter: gapi2.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    attributes: IFRAME_ATTRIBUTES,
    dontclear: true
  }, (iframe) => new Promise(async (resolve, reject) => {
    await iframe.restyle({
      // Prevent iframe from closing on mouse out.
      setHideOnLeave: false
    });
    const networkError = _createError(
      auth2,
      "network-request-failed"
      /* AuthErrorCode.NETWORK_REQUEST_FAILED */
    );
    const networkErrorTimer = _window().setTimeout(() => {
      reject(networkError);
    }, PING_TIMEOUT.get());
    function clearTimerAndResolve() {
      _window().clearTimeout(networkErrorTimer);
      resolve(iframe);
    }
    iframe.ping(clearTimerAndResolve).then(clearTimerAndResolve, () => {
      reject(networkError);
    });
  }));
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const BASE_POPUP_OPTIONS = {
  location: "yes",
  resizable: "yes",
  statusbar: "yes",
  toolbar: "no"
};
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 600;
const TARGET_BLANK = "_blank";
const FIREFOX_EMPTY_URL = "http://localhost";
class AuthPopup {
  constructor(window2) {
    this.window = window2;
    this.associatedEvent = null;
  }
  close() {
    if (this.window) {
      try {
        this.window.close();
      } catch (e) {
      }
    }
  }
}
function _open(auth2, url, name2, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
  const top = Math.max((window.screen.availHeight - height) / 2, 0).toString();
  const left = Math.max((window.screen.availWidth - width) / 2, 0).toString();
  let target = "";
  const options = Object.assign(Object.assign({}, BASE_POPUP_OPTIONS), {
    width: width.toString(),
    height: height.toString(),
    top,
    left
  });
  const ua2 = getUA().toLowerCase();
  if (name2) {
    target = _isChromeIOS(ua2) ? TARGET_BLANK : name2;
  }
  if (_isFirefox(ua2)) {
    url = url || FIREFOX_EMPTY_URL;
    options.scrollbars = "yes";
  }
  const optionsString = Object.entries(options).reduce((accum, [key, value]) => `${accum}${key}=${value},`, "");
  if (_isIOSStandalone(ua2) && target !== "_self") {
    openAsNewWindowIOS(url || "", target);
    return new AuthPopup(null);
  }
  const newWin = window.open(url || "", target, optionsString);
  _assert(
    newWin,
    auth2,
    "popup-blocked"
    /* AuthErrorCode.POPUP_BLOCKED */
  );
  try {
    newWin.focus();
  } catch (e) {
  }
  return new AuthPopup(newWin);
}
function openAsNewWindowIOS(url, target) {
  const el2 = document.createElement("a");
  el2.href = url;
  el2.target = target;
  const click = document.createEvent("MouseEvent");
  click.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 1, null);
  el2.dispatchEvent(click);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const WIDGET_PATH = "__/auth/handler";
const EMULATOR_WIDGET_PATH = "emulator/auth/handler";
const FIREBASE_APP_CHECK_FRAGMENT_ID = encodeURIComponent("fac");
async function _getRedirectUrl(auth2, provider2, authType, redirectUrl, eventId, additionalParams) {
  _assert(
    auth2.config.authDomain,
    auth2,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  _assert(
    auth2.config.apiKey,
    auth2,
    "invalid-api-key"
    /* AuthErrorCode.INVALID_API_KEY */
  );
  const params = {
    apiKey: auth2.config.apiKey,
    appName: auth2.name,
    authType,
    redirectUrl,
    v: SDK_VERSION,
    eventId
  };
  if (provider2 instanceof FederatedAuthProvider) {
    provider2.setDefaultLanguage(auth2.languageCode);
    params.providerId = provider2.providerId || "";
    if (!isEmpty(provider2.getCustomParameters())) {
      params.customParameters = JSON.stringify(provider2.getCustomParameters());
    }
    for (const [key, value] of Object.entries(additionalParams || {})) {
      params[key] = value;
    }
  }
  if (provider2 instanceof BaseOAuthProvider) {
    const scopes = provider2.getScopes().filter((scope) => scope !== "");
    if (scopes.length > 0) {
      params.scopes = scopes.join(",");
    }
  }
  if (auth2.tenantId) {
    params.tid = auth2.tenantId;
  }
  const paramsDict = params;
  for (const key of Object.keys(paramsDict)) {
    if (paramsDict[key] === void 0) {
      delete paramsDict[key];
    }
  }
  const appCheckToken = await auth2._getAppCheckToken();
  const appCheckTokenFragment = appCheckToken ? `#${FIREBASE_APP_CHECK_FRAGMENT_ID}=${encodeURIComponent(appCheckToken)}` : "";
  return `${getHandlerBase(auth2)}?${querystring(paramsDict).slice(1)}${appCheckTokenFragment}`;
}
function getHandlerBase({ config }) {
  if (!config.emulator) {
    return `https://${config.authDomain}/${WIDGET_PATH}`;
  }
  return _emulatorUrl(config, EMULATOR_WIDGET_PATH);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const WEB_STORAGE_SUPPORT_KEY = "webStorageSupport";
class BrowserPopupRedirectResolver {
  constructor() {
    this.eventManagers = {};
    this.iframes = {};
    this.originValidationPromises = {};
    this._redirectPersistence = browserSessionPersistence;
    this._completeRedirectFn = _getRedirectResult;
    this._overrideRedirectResult = _overrideRedirectResult;
  }
  // Wrapping in async even though we don't await anywhere in order
  // to make sure errors are raised as promise rejections
  async _openPopup(auth2, provider2, authType, eventId) {
    var _a;
    debugAssert((_a = this.eventManagers[auth2._key()]) === null || _a === void 0 ? void 0 : _a.manager, "_initialize() not called before _openPopup()");
    const url = await _getRedirectUrl(auth2, provider2, authType, _getCurrentUrl(), eventId);
    return _open(auth2, url, _generateEventId());
  }
  async _openRedirect(auth2, provider2, authType, eventId) {
    await this._originValidation(auth2);
    const url = await _getRedirectUrl(auth2, provider2, authType, _getCurrentUrl(), eventId);
    _setWindowLocation(url);
    return new Promise(() => {
    });
  }
  _initialize(auth2) {
    const key = auth2._key();
    if (this.eventManagers[key]) {
      const { manager, promise: promise2 } = this.eventManagers[key];
      if (manager) {
        return Promise.resolve(manager);
      } else {
        debugAssert(promise2, "If manager is not set, promise should be");
        return promise2;
      }
    }
    const promise = this.initAndGetManager(auth2);
    this.eventManagers[key] = { promise };
    promise.catch(() => {
      delete this.eventManagers[key];
    });
    return promise;
  }
  async initAndGetManager(auth2) {
    const iframe = await _openIframe(auth2);
    const manager = new AuthEventManager(auth2);
    iframe.register("authEvent", (iframeEvent) => {
      _assert(
        iframeEvent === null || iframeEvent === void 0 ? void 0 : iframeEvent.authEvent,
        auth2,
        "invalid-auth-event"
        /* AuthErrorCode.INVALID_AUTH_EVENT */
      );
      const handled = manager.onEvent(iframeEvent.authEvent);
      return {
        status: handled ? "ACK" : "ERROR"
        /* GapiOutcome.ERROR */
      };
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
    this.eventManagers[auth2._key()] = { manager };
    this.iframes[auth2._key()] = iframe;
    return manager;
  }
  _isIframeWebStorageSupported(auth2, cb2) {
    const iframe = this.iframes[auth2._key()];
    iframe.send(WEB_STORAGE_SUPPORT_KEY, { type: WEB_STORAGE_SUPPORT_KEY }, (result) => {
      var _a;
      const isSupported = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a[WEB_STORAGE_SUPPORT_KEY];
      if (isSupported !== void 0) {
        cb2(!!isSupported);
      }
      _fail(
        auth2,
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
  }
  _originValidation(auth2) {
    const key = auth2._key();
    if (!this.originValidationPromises[key]) {
      this.originValidationPromises[key] = _validateOrigin(auth2);
    }
    return this.originValidationPromises[key];
  }
  get _shouldInitProactively() {
    return _isMobileBrowser() || _isSafari() || _isIOS();
  }
}
const browserPopupRedirectResolver = BrowserPopupRedirectResolver;
var name$1 = "@firebase/auth";
var version$1 = "0.23.2";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class AuthInterop {
  constructor(auth2) {
    this.auth = auth2;
    this.internalListeners = /* @__PURE__ */ new Map();
  }
  getUid() {
    var _a;
    this.assertAuthConfigured();
    return ((_a = this.auth.currentUser) === null || _a === void 0 ? void 0 : _a.uid) || null;
  }
  async getToken(forceRefresh) {
    this.assertAuthConfigured();
    await this.auth._initializationPromise;
    if (!this.auth.currentUser) {
      return null;
    }
    const accessToken = await this.auth.currentUser.getIdToken(forceRefresh);
    return { accessToken };
  }
  addAuthTokenListener(listener) {
    this.assertAuthConfigured();
    if (this.internalListeners.has(listener)) {
      return;
    }
    const unsubscribe = this.auth.onIdTokenChanged((user) => {
      listener((user === null || user === void 0 ? void 0 : user.stsTokenManager.accessToken) || null);
    });
    this.internalListeners.set(listener, unsubscribe);
    this.updateProactiveRefresh();
  }
  removeAuthTokenListener(listener) {
    this.assertAuthConfigured();
    const unsubscribe = this.internalListeners.get(listener);
    if (!unsubscribe) {
      return;
    }
    this.internalListeners.delete(listener);
    unsubscribe();
    this.updateProactiveRefresh();
  }
  assertAuthConfigured() {
    _assert(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    );
  }
  updateProactiveRefresh() {
    if (this.internalListeners.size > 0) {
      this.auth._startProactiveRefresh();
    } else {
      this.auth._stopProactiveRefresh();
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function getVersionForPlatform(clientPlatform) {
  switch (clientPlatform) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    default:
      return void 0;
  }
}
function registerAuth(clientPlatform) {
  _registerComponent(new Component(
    "auth",
    (container, { options: deps }) => {
      const app2 = container.getProvider("app").getImmediate();
      const heartbeatServiceProvider = container.getProvider("heartbeat");
      const appCheckServiceProvider = container.getProvider("app-check-internal");
      const { apiKey, authDomain } = app2.options;
      _assert(apiKey && !apiKey.includes(":"), "invalid-api-key", { appName: app2.name });
      const config = {
        apiKey,
        authDomain,
        clientPlatform,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: _getClientVersion(clientPlatform)
      };
      const authInstance = new AuthImpl(app2, heartbeatServiceProvider, appCheckServiceProvider, config);
      _initializeAuthInstance(authInstance, deps);
      return authInstance;
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((container, _instanceIdentifier, _instance) => {
    const authInternalProvider = container.getProvider(
      "auth-internal"
      /* _ComponentName.AUTH_INTERNAL */
    );
    authInternalProvider.initialize();
  }));
  _registerComponent(new Component(
    "auth-internal",
    (container) => {
      const auth2 = _castAuth(container.getProvider(
        "auth"
        /* _ComponentName.AUTH */
      ).getImmediate());
      return ((auth3) => new AuthInterop(auth3))(auth2);
    },
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ));
  registerVersion(name$1, version$1, getVersionForPlatform(clientPlatform));
  registerVersion(name$1, version$1, "esm2017");
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const DEFAULT_ID_TOKEN_MAX_AGE = 5 * 60;
const authIdTokenMaxAge = getExperimentalSetting("authIdTokenMaxAge") || DEFAULT_ID_TOKEN_MAX_AGE;
let lastPostedIdToken = null;
const mintCookieFactory = (url) => async (user) => {
  const idTokenResult = user && await user.getIdTokenResult();
  const idTokenAge = idTokenResult && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(idTokenResult.issuedAtTime)) / 1e3;
  if (idTokenAge && idTokenAge > authIdTokenMaxAge) {
    return;
  }
  const idToken = idTokenResult === null || idTokenResult === void 0 ? void 0 : idTokenResult.token;
  if (lastPostedIdToken === idToken) {
    return;
  }
  lastPostedIdToken = idToken;
  await fetch(url, {
    method: idToken ? "POST" : "DELETE",
    headers: idToken ? {
      "Authorization": `Bearer ${idToken}`
    } : {}
  });
};
function getAuth(app2 = getApp()) {
  const provider2 = _getProvider(app2, "auth");
  if (provider2.isInitialized()) {
    return provider2.getImmediate();
  }
  const auth2 = initializeAuth(app2, {
    popupRedirectResolver: browserPopupRedirectResolver,
    persistence: [
      indexedDBLocalPersistence,
      browserLocalPersistence,
      browserSessionPersistence
    ]
  });
  const authTokenSyncUrl = getExperimentalSetting("authTokenSyncURL");
  if (authTokenSyncUrl) {
    const mintCookie = mintCookieFactory(authTokenSyncUrl);
    beforeAuthStateChanged(auth2, mintCookie, () => mintCookie(auth2.currentUser));
    onIdTokenChanged(auth2, (user) => mintCookie(user));
  }
  const authEmulatorHost = getDefaultEmulatorHost("auth");
  if (authEmulatorHost) {
    connectAuthEmulator(auth2, `http://${authEmulatorHost}`);
  }
  return auth2;
}
registerAuth(
  "Browser"
  /* ClientPlatform.BROWSER */
);
var name = "firebase";
var version = "9.23.0";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
registerVersion(name, version, "app");
const firebaseConfig = {
  apiKey: "AIzaSyB-7m2bCi0vkjLimvat7kAfGewBYLpZjH8",
  authDomain: "lecture-app-a057e.firebaseapp.com",
  projectId: "lecture-app-a057e",
  storageBucket: "lecture-app-a057e.appspot.com",
  messagingSenderId: "866172084651",
  appId: "1:866172084651:web:deed89d21e922bc44c72ee"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = Ph(app);
const provider = new GoogleAuthProvider();
const userData = async (userId, userEmail) => {
  try {
    const docRef = await pf(_h(db, "users"), {
      id: userId,
      username: userEmail
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
const googleUsers = async () => {
  const user = auth.currentUser;
  if (user !== null) {
    const docRef = await pf(_h(db, "googleUsers"), {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      photo: user.photoURL
    });
    console.log(docRef);
  }
};
const sendVerification = () => sendEmailVerification(auth.currentUser);
const loginEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
const newRegister = (email, password, username) => createUserWithEmailAndPassword(auth, email, password);
const ssoGoogle = async () => {
  try {
    const sso = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(sso);
    if (credential.accessToken) {
      googleUsers();
      window.alert(sso.user.displayName);
      window.location.hash = "#/dashboard";
      return true;
    }
    window.alert("LOGIN INVALIDO");
    return false;
  } catch (err) {
    console.log("SSO FAILED", err);
    return err;
  }
};
const logout = () => {
  signOut(auth).then(() => {
    console.log("logout");
    window.location.hash = "#/login";
  });
};
const addPost = (title, description) => {
  pf(_h(db, "posts"), {
    userId: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    username: auth.currentUser.email,
    photo: auth.currentUser.photoURL,
    title,
    description,
    datePosted: /* @__PURE__ */ new Date(),
    likes: [],
    likesCounter: 0
  });
};
const onGetPost = async (callback) => {
  const getPost = await If(_h(db, "posts"), callback, {});
  return getPost;
};
const postEdit = async (id2, title, description) => {
  const postRef = gh(db, "posts", id2);
  console.log(postRef);
  await gf(postRef, {
    title,
    description
  });
  console.log(postRef);
};
const deletePost = async (id2) => {
  const eliminarPost = await yf(gh(db, "posts", id2));
  return eliminarPost;
};
const removeLike = async (userId, postId) => {
  const postRef = gh(db, "posts", postId);
  const postSnapshot = await af(postRef);
  const likes = postSnapshot.get("likes");
  const likesCounter = postSnapshot.get("likesCounter");
  await gf(postRef, {
    likes: jf(userId),
    likesCounter: likesCounter - 1
  });
  console.log(likes);
};
const addLike = async (userId, postId) => {
  const postRef = gh(db, "posts", postId);
  const postSnapshot = await af(postRef);
  const likes = postSnapshot.get("likes");
  const likesCounter = postSnapshot.get("likesCounter");
  await gf(postRef, {
    likes: Qf(userId),
    likesCounter: likesCounter + 1
  });
  console.log(likes);
};
const observer = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (window.location.hash === "#/" || window.location.hash === "#/login" || window.location.hash === "#/signup") {
        window.location.hash = "#/dashboard";
      }
    } else {
      if (window.location.hash === "#/dashboard") {
        window.location.hash = "#/";
      }
    }
  });
};
const errorIcon = "/assets/error-7d97dc99.png";
const loginErrorHandler = (error) => {
  const errorCode = error.code;
  console.log(errorCode);
  const errorFeedback = document.getElementById("error-feedback");
  if (errorCode === "auth/invalid-email") {
    errorFeedback.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Ingresa un correo válido.</span>`;
  } else if (errorCode === "auth/user-not-found") {
    errorFeedback.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Usuario no registrado.</span>`;
  } else if (errorCode === "auth/internal-error") {
    errorFeedback.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Ingresa una constraseña.</span>`;
  } else if (errorCode === "auth/wrong-password") {
    errorFeedback.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Correo y/o contraseña inválidos.</span>`;
  } else if (errorCode === "auth/too-many-requests") {
    errorFeedback.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Se han realizado demasiados intentos fállidos.</span>`;
  }
};
const logoGithub = "/assets/logoGithub-d83ddf4e.webp";
const footer = () => {
  const sectionFooter = document.createElement("div");
  sectionFooter.classList.add("footer-container");
  sectionFooter.innerHTML = `
   <p class="description-footer">Esta red social ha sido elaborada por:</p>
   <div class="nombres">
     <div>
       <p class="name-footer">Carmen</p>
       <a title="github carmen" href="https://github.com/CarmenArayaRodriguez"><img class="logo-github" src=${logoGithub} /></a>
     </div>
     <div>
       <p class="name-footer">Francisca</p>
       <a title="github francisca" href="https://github.com/pnxu"><img class="logo-github" src=${logoGithub} /></a>
     </div>
     <div>
       <p class="name-footer">Sara</p>
       <a title="github sara" href="https://github.com/sara040616"><img class="logo-github" src=${logoGithub} /></a>
     </div>
   </div>
   `;
  return sectionFooter;
};
const logo = "/assets/logo-77f8e436.webp";
const loginGoogle = "/assets/btn_google_signin-ba0db343.png";
const login = () => {
  const viewLogIn = document.createElement("div");
  viewLogIn.classList.add("login-container");
  viewLogIn.innerHTML = `
  <header>
  <div class="logo-container">
    <img src=${logo} alt="logo" />
    <h1>Purrfect Books</h1>
  </div>
  </header>

  <main>
   <section>
  <div class="container">

  <h2>Ingresar</h2>
  <form id="login-form">
    <div class="container-item">
      <label for="login-email">Correo</label>
      <input type="text" id="login-email" class="login-input" placeholder="ejemplo@email.com" />
    </div>
    <div class="container-item">
      <label for="login-password">Contraseña</label>
      <input type="password" id="login-password" class="login-input" placeholder="**************" />
      <div class="error-feedback-container" id="error-feedback"></div>
    </div>
    <div class="signup-container-btn">
    <button type="submit" id="login-form-button" class="login-btn">
      Ingresa
    </button>
    </div>
    </form>
    <div class="login-google">
    <p>o</p>
    <button type="button" id="login-google" class="login-google-btn">
      <img src=${loginGoogle} alt="logo-google" />
    </button>
    </div>
    <div class="login-span">
      <span
        >¿Todavía no tienes cuenta? <a href="#/signup" class="span-btn">Regístrate aquí.</a
        ></span>
        </div>
  </div>
  </section>
  </main>
  `;
  const loginForm = viewLogIn.querySelector("#login-form-button");
  loginForm.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.querySelector("#login-email").value;
      const password = document.querySelector("#login-password").value;
      await loginEmail(email, password);
      window.location.hash = "#/dashboard";
    } catch (err) {
      loginErrorHandler(err);
    }
  });
  viewLogIn.querySelector("#login-google").addEventListener("click", () => {
    ssoGoogle();
  });
  viewLogIn.appendChild(footer());
  return viewLogIn;
};
const validateEmail = (email) => {
  const emailErrorText = document.getElementById("email-validation");
  console.log({ function: "validateEmail", email });
  emailErrorText.innerHTML = "";
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  emailErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
  <span>El correo ingresado no es válido.</span>`;
  return false;
};
const validatePassword = (password) => {
  const passwordErrorText = document.getElementById("password-validation");
  passwordErrorText.innerHTML = "";
  if (password.length === 0) {
    passwordErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Este campo no puede estar vacío.</span>`;
    return false;
  }
  if (password.length < 6) {
    passwordErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>La contraseña debe tener un mínimo de 6 caracteres.</span>`;
    return false;
  }
  if (password.length > 16) {
    passwordErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>La contraseña debe tener un máximo de 16 caracteres.</span>`;
    return false;
  }
  return true;
};
const validateConfirmPassword = (password, passwordConfirm) => {
  const passwordConfirmErrorText = document.getElementById(
    "password-confirm-validation"
  );
  passwordConfirmErrorText.innerHTML = "";
  if (passwordConfirm.length === 0) {
    passwordConfirmErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Este campo no puede estar vacío.</span>`;
    return false;
  }
  if (passwordConfirm !== password) {
    passwordConfirmErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Las contraseñas no coinciden.</span>`;
    return false;
  }
  return true;
};
const validateNickname = (nickname) => {
  const nicknameErrorText = document.getElementById("nickname-validation");
  nicknameErrorText.innerHTML = "";
  if (nickname.length === 0) {
    nicknameErrorText.innerHTML = `<img src=${errorIcon} alt="error" class="error-icon" />
    <span>Debe ingresar un nombre.</span>`;
    return false;
  }
  if (nickname.length > 8) {
    nicknameErrorText.innerHTML = `img src=${errorIcon} alt="error" class="error-icon" />
    <span>Debe tener máximo 8 caracteres.</span>`;
    return false;
  }
  return true;
};
const signupErrorHandler = (error) => {
  const errorCode = error.code;
  if (errorCode === "auth/email-already-in-use") {
    alert("Este correo ya está en uso.");
  }
};
const signup = () => {
  const viewSignUp = document.createElement("div");
  viewSignUp.classList.add("signup-container");
  viewSignUp.innerHTML = `
        <header>
          <div class="logo-container">
            <img src=${logo} alt="logo" />
            <h1>PURRRFECT BOOKS</h1>
          </div>
        </header>
        
<main>
  <section>
    <div class="container">
        <h2>Regístrate</h2>
       <form id="signup-form">
          <div class="container-item">
            <label class="label-signup" for="signup-email">Correo</label>
            <input type="text" id="signup-email" class="signup-input" placeholder="ejemplo@email.com"/>
            <div class="error-feedback-container" id="email-validation"></div>
          </div>
          <div class="container-item">
            <label class="label-signup" for="signup-password">Contraseña</label>
            <input type="password" id="signup-password" class="signup-input" placeholder="**************" />
            <div class="error-feedback-container" id="password-validation"></div>
          </div>
          <div class="container-item">
            <label class="label-signup" for="signup-confirm-password">Confirmar contraseña</label>
            <input type="password" id="signup-confirm-password" class="signup-input" placeholder="**************"/>
            <div class="error-feedback-container" id="password-confirm-validation"></div>
          </div>
          <div class="container-item">
            <label class="label-signup" for="signup-nickname">Nombre</label>
            <input type="text" id="signup-nickname" class="signup-input" placeholder="ej: Juan"/>
            <div class="error-feedback-container" id="nickname-validation"></div>
          </div>
          <div class="signup-container-btn">
            <button type="submit" id="signup-submit-button" class="signup-btn">
              Regístrar
            </button>
          </div>
       </form>
        <div class="login-google">
          <p>o</p>
          <button type="button" id="login-google" class="login-google-btn">
            <img src=${loginGoogle} alt="logo-google" />
          </button>
        </div>
        <div class="signup-span">
          <span>¿Ya tienes cuenta? <a href="#/login" class="span-btn">Ingresa aquí.</a></span>
        </div>
    </div>
  </section>
</main>
`;
  viewSignUp.querySelector("#login-google").addEventListener("click", () => {
    ssoGoogle();
  });
  viewSignUp.querySelector("#signup-submit-button").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const email = document.querySelector("#signup-email").value;
      const password = document.querySelector("#signup-password").value;
      const passwordConfirm = document.querySelector(
        "#signup-confirm-password"
      ).value;
      const nickname = document.querySelector("#signup-nickname").value;
      const emailIsValid = validateEmail(email);
      const passwordIsValid = validatePassword(password);
      const passwordConfirmIsValid = validateConfirmPassword(
        password,
        passwordConfirm
      );
      const nicknameIsValid = validateNickname(nickname);
      if (!emailIsValid || !passwordIsValid || !passwordConfirmIsValid || !nicknameIsValid) {
        return false;
      }
      const userCredential = await newRegister(email, password, nickname);
      const user = userCredential.user;
      const userId = user.uid;
      const userEmail = user.email;
      userData(userId, userEmail);
      await sendVerification();
      alert("Se envío un enlace de verificación a tu correo.");
      window.location.hash = "#/login";
      return true;
    } catch (err) {
      signupErrorHandler(err);
      return false;
    }
  });
  viewSignUp.appendChild(footer());
  return viewSignUp;
};
const anonUser = "data:image/png;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCACgAKADASIAAhEBAxEB/8QAGwABAAMBAQEBAAAAAAAAAAAAAAUGBwMEAgn/xAA7EAACAQIDAwgGCQUBAAAAAAAAAgMBBAUGEhEiMgcUQUJDUmKSFSEjUXKCEzEzU3FzkcLiNIGhosHS/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP1TAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArmY83Q4P7GGlJ7vu9WP4gLGeR8Ts420vdQK3ikWhlWIY3fYpXZc3DuvdXdXyng0gbImJ2cjaUuoGbwyLU9ZiGk9+H43fYXXZbXDovdbeXygbACuZczdDjHsZqUgu+71ZPhLGAAAAAAAAAAAAAAAABD5lxr0JhrSU+3k3Y18RlkkrSyNI7MzNvMzdYn88Yjz3GWhVvZwL9H83WK6AAAAAAfccrRSLIjMrLvKy9U1PLWNem8NWSv28e7IviMpLFkfEeZYysLN7Odfo/m6oGmAAAAAAAAAAAAABymmWGF5G4VXVU6kRmi4pbYBfvSm3bHpr827/ANAyu4na6uJJn4pGZm+Y+AAAAAAAAfdvO1rcRzJxRsrL8p8ADaYplnhWRfWrU1UOpEZXuKXOAWD1ps2R6afLu/8ACXAAAAAAAAAAAAVnP81Isvsle1lVP03/ANhZimco8tKWdlH75Wb/AF2fuAogAAAAAAAAAA0fIEtJcBolOymZa/33v3FnKZycS0rZ3sfulVv9dn7S5gAAAAAAAAAAAM+5R5aNf2UPSkTN5m/gaCZXnG55zmG408MemPygQoAAAAAAAAAAtvJxLRb+9h6XiVvK38zQTK8nXPNsw2+rhk1R+Y1QAAAAAAAAAAAI7GsYiwWwkupK09W6q16ze4yWSVpZGkdtTM2pmNnkjWVGV1oyt1WIK7yThd360hrbV2dhXTT9AMyBeJ+TiPsr1qfmR6jytydXXReRV/GNgKiDviFk1hfTW7MrNC2nUpwAAHfD7Jr++ht1ZVaZtOpgOALcvJ1ddN5FT8I2PVBycR9retX8uPSBSo5WikWRG0sralY1rBcXjxqwjuo68W6y91iPssk4XZ+toa3LbPrnrq/wTscSxLRUWiLTqqB0AAAAAAAAAAAAADzX17Hh9nNcTNpjjXU1TpLKsEbSSNRY13mZugzrNuZ/TEnN7f8Ao424vvG/8gQFxcNdXEkz8UjMzHIAAdbe4a1uI5k4o2VlOQA2WxvY8Qs4bmFtccq6lr7z0ma5SzP6Hk5vcb1pI3F92xosUqzxrJG1GjbeVl6QOoAAAAAAAAAAAhcWzVh+EO0csjSTL2US6mKzfcoVxLqpaQJCvek3mAvzNRaba12UK9iudrDDtSxNzubuxcPmKDfYrd4pXZdXLyp3NW75TxASmNZiu8cr7d9MNfqgXh/kRYAAAAAAAJTBcxXeB19g+qGn1wNw/wASLAGl4VnawxHSsrc0m7svD5iwq1GptpXbQxM9tjit3hddlrcvEnc1bvlA2EGf2PKFcRaaXcCTL3o91izYTmrD8XdY4pGjmbspV0sBNAAAU7N+bGs6tZWTbbjtJU7Pw/ET2YMU9EYVNcLxrTSlPEZPIzSyMztqZm1MzdYD4pSlKUpSmylOgAAAAAAAAAAAAAAAAAABWlK0rStNtK9AAF9yfmtrvTY3suq47OZ+08PxFxMUjZopFZG0sralZeqaxl/FPS+FQ3DcbU0vTxAf/9k=";
const dashboard = () => {
  const viewDashboard = document.createElement("div");
  viewDashboard.classList.add("post-container");
  viewDashboard.innerHTML = `
    <header>
      <div class="logo-container">
        <img src=${logo} />
        <h1>PURRFECT BOOKS</h1>
        <button type="button" id="logout-btn"></button>
      </div>
      </header>
<main>
  <section class="create-post">
    <article>
      <div>
          <h3>Escribe una reseña</h3>
        <form class="post-form" id="post-form">
            <input type="hidden" id="post-id" value="">
            <div class="wrap">
            <input type="text" id="post-title" placeholder="Titulo del libro">
            </div>
            <div>
            <textarea id="post-description" placeholder="Reseña"></textarea> 
            </div>
          <div class="btn-save-container">
            <button class="button-post-save" id="button-post-save">Publicar</button>
          </div>
        </form>
      </div>
    </article>
  </section>
      <section>
        <div id="posts-container">
      </section>
</div>
</main>
  `;
  onGetPost((querySnapshot) => {
    let html = "";
    const postsContainer = document.getElementById("posts-container");
    querySnapshot.forEach((doc) => {
      const post = doc.data();
      html += `
      <article>
        <div class="user-info">
          <img src=${post.photo ? post.photo : anonUser}>
          <p>${post.name ? post.name : post.username}</p>
        </div>
        `;
      if (post.userId === auth.currentUser.uid) {
        html += `
        <div class="admin-btns">
          <button type="button" class='eliminar' data-id='${doc.id}'></button>
          <button type="button" class="edit-button" data-id='${JSON.stringify({
          post,
          id: doc.id
        })}'></button>
          </div>
        <div class="user-post">
          <p>${post.title}</p>
          <span>${post.description}</span>
          </div>
          <div class="likes-container">
          <button type="button" class="like-button" data-id= '${JSON.stringify({
          post,
          id: doc.id
        })}'></button>
          <p>A ${post.likesCounter} personas les ha gustado esto.</p>
          </div>
      </article>
    `;
      } else {
        html += `<div class="user-post">
          <p>${post.title}</p>
          <span>${post.description}</span>
          </div>
          <div class="likes-container">
          <button type="button" class="like-button" data-id= '${JSON.stringify({
          post,
          id: doc.id
        })}'></button>
          <p>A ${post.likesCounter} personas les ha gustado esto.</p>
          </div>
      </article>
    `;
      }
    });
    postsContainer.innerHTML = html;
    const btnEditPost = postsContainer.querySelectorAll(".edit-button");
    btnEditPost.forEach((button) => {
      button.addEventListener("click", ({ target: { dataset } }) => {
        const { post, id: id2 } = JSON.parse(dataset.id);
        const inputTitle = viewDashboard.querySelector("#post-title");
        const inputDescription = viewDashboard.querySelector("#post-description");
        const inputId = viewDashboard.querySelector("#post-id");
        inputTitle.value = post.title;
        inputDescription.value = post.description;
        inputId.value = id2;
        inputTitle.focus();
      });
    });
    const btnDelete = postsContainer.querySelectorAll(".eliminar");
    btnDelete.forEach((button) => {
      button.addEventListener("click", ({ target: { dataset } }) => {
        const isConfirmed = confirm(
          "¿Está seguro de que desea eliminar esta publicación?"
        );
        if (isConfirmed) {
          deletePost(dataset.id);
        }
      });
    });
    const likeButton = postsContainer.querySelectorAll(".like-button");
    likeButton.forEach((like) => {
      like.addEventListener("click", ({ target: { dataset } }) => {
        const { post, id: id2 } = JSON.parse(dataset.id);
        const userId = auth.currentUser.uid;
        const postId = id2;
        console.log(userId, postId);
        if (post.likes.includes(userId)) {
          removeLike(userId, postId);
        } else {
          addLike(userId, postId);
        }
      });
    });
  });
  const dashboardPost = viewDashboard.querySelector("#button-post-save");
  dashboardPost.addEventListener("click", (e) => {
    e.preventDefault();
    const title = viewDashboard.querySelector("#post-title").value;
    const description = viewDashboard.querySelector("#post-description").value;
    const id2 = viewDashboard.querySelector("#post-id").value;
    if (title === "" || description === "") {
      alert("Debes completar todos los campos");
    } else if (!id2) {
      addPost(title, description);
      viewDashboard.querySelector("#post-form").reset();
    } else {
      const isConfirmed = confirm(
        "¿Está seguro de que desea guardar los cambios en esta publicación?"
      );
      if (isConfirmed) {
        postEdit(id2, title, description);
        viewDashboard.querySelector("#post-form").reset();
      }
    }
  });
  viewDashboard.querySelector("#logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
  viewDashboard.appendChild(footer());
  return viewDashboard;
};
const router = (hash) => {
  const containerRoot = document.getElementById("root");
  containerRoot.innerHTML = "";
  switch (hash) {
    case "#/":
    case "#/login":
      containerRoot.appendChild(login());
      break;
    case "#/signup":
      containerRoot.appendChild(signup());
      break;
    case "#/dashboard":
      containerRoot.appendChild(dashboard());
      break;
    default:
      containerRoot.innerHTML = "Página no encontrada";
  }
};
window.addEventListener("load", () => {
  observer();
  router(window.location.hash);
});
window.addEventListener("hashchange", () => {
  observer();
  router(window.location.hash);
});
