import pako from 'pako'
import LosslessJSON from 'lossless-json'

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
    // if (this.isInApp()) {
    if (false) {
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir_entry) {
        dir_entry.getFile(name, { create: true }, function(file_entry) {
          file_entry.createWriter(function(file_writer) {
            file_writer.onwriteend = function(e) {
              console.log('Write of file "' + name + '"" completed.')
            }

            file_writer.onerror = function(e) {
              console.log('Write failed: ' + e.toString())
              alert('Errore nella scrittura del file:\n'+e.toString())
            }

            var blob = new Blob([obj], { type: 'text/json' })
            file_writer.write(blob)
          })
        })
      })

    } else {
      // console.log('stringifying object...')
      // console.time('stringify')
      // obj = LosslessJSON.stringify(obj)
      // console.timeLog('stringify')
      console.log('compressing object from ', obj.length, 'bytes...')
      // console.time('deflate')
      obj = pako.deflate(obj, { to: 'string' })
      // console.timeLog('deflate')
      console.log('saving compressed item ', obj.length, 'bytes...')
      // ldb.set(name, obj);
      localStorage.setItem(name, obj)
    }
  },

  load (name, on_finish) {
    // if (this.isInApp()) {
    if (false) {
      // App:
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory + name, file_entry => {
        file_entry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function() {
            let obj = this.result
            on_finish(obj ? this.parse_json(obj) : null)
          };
          reader.readAsText(file)
        }, err => {
          alert('Errore nella lettura del file')
          console.error('Errore nella lettura del file', err)
          on_finish(null)
        })
      })
    } else {
      // Browser:
      // ldb.get(name, function(obj) {
      // console.time('getItem')
      setTimeout(() => {
        console.log('get item')
        let obj = localStorage.getItem(name)
        console.log('get item ok:', obj ? obj.length : 'nessun dato')
        // console.timeLog('getItem')
        if (!obj) return on_finish(null)
        try {
          // console.time('inflate')
          console.log('decompressing', obj.length, 'bytes...')
          obj = pako.inflate(obj, { to: 'string' })
          // console.timeEnd('inflate')
          console.log('parsing resulting', obj.length, 'bytes...')
          // console.time('parse')
          obj = LosslessJSON.parse(obj)
          // console.timeLog('parse')
          console.log('finish')
          on_finish(obj)
        } catch (e) {
          console.log('error', e)
          on_finish(null)
        }
      }, 10);
    }
  },

  waitCordova(func) {
    if (!this.isInApp() || window.is_cordova_ready) {
      func()
    } else {
      document.addEventListener('deviceready', func)
    }
  }
}
