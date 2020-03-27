import pako from 'pako'
const JsonLib = require('./json-lib.js')

if (!Array.prototype.flat) {
Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
})
}

export default {

  parse_json(str) {
    return eval(`() => (${str})`)()
  },

  isInApp () {
    return typeof cordova != 'undefined'
  },

  store (name, obj) {
    // console.log('stringifying object...')
    // console.time('stringify')
    // obj = JsonLib.stringify(obj)
    // console.timeLog('stringify')
    // console.log('compressing object from ', obj.length, 'bytes...')
    // console.time('deflate')
    obj = pako.deflate(obj, { to: 'string' })
    // console.timeLog('deflate')
    // console.log('saving compressed item ', obj.length, 'bytes...')
    // ldb.set(name, obj);
    localStorage.setItem(name, obj)
  },

  load (name, on_finish) {
    console.time('getItem before')
    setTimeout(() => {
      console.log('get item')
      let obj = localStorage.getItem(name)
      console.log('get item ok:', obj ? obj.length : 'nessun dato')
      // console.timeLog('getItem')
      if (!obj) return on_finish(null)
      try {
        console.time('inflate')
        console.log('decompressing', obj.length, 'bytes...')
        obj = pako.inflate(obj, { to: 'string' })
        console.timeEnd('inflate')
        console.log('parsing resulting', obj.length, 'bytes...')
        console.time('parse')
        obj = JsonLib.parse(obj)
        console.timeLog('parse')
        console.log('finish')
        on_finish(obj)
      } catch (e) {
        // console.log('error', e)
        on_finish(null)
      }
    }, 10)
  },

  waitCordova(func) {
    if (!this.isInApp() || window.is_cordova_ready) {
      func()
    } else {
      document.addEventListener('deviceready', func)
    }
  }
}
