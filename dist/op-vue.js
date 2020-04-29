
function _loadWasmModule (sync, src, imports) {
        var len = src.length
        var trailing = src[len-2] == '=' ? 2 : src[len-1] == '=' ? 1 : 0
        var buf = new Uint8Array((len * 3/4) - trailing)

        var _table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
        var table = new Uint8Array(130)
        for (var c = 0; c < _table.length; c++) table[_table.charCodeAt(c)] = c

        for (var i = 0, b = 0; i < len; i+=4) {
          var second = table[src.charCodeAt(i+1)]
          var third = table[src.charCodeAt(i+2)]
          buf[b++] = (table[src.charCodeAt(i)] << 2) | (second >> 4)
          buf[b++] = ((second & 15) << 4) | (third >> 2)
          buf[b++] = ((third & 3) << 6) | (table[src.charCodeAt(i+3)] & 63)
        }

        if (imports && !sync) {
          return WebAssembly.instantiate(buf, imports)
        } else if (!imports && !sync) {
          return WebAssembly.compile(buf)
        } else {
          var mod = new WebAssembly.Module(buf)
          return imports ? new WebAssembly.Instance(mod, imports) : mod
        }
      }
import axios from 'axios';
import collect from 'collect.js';
import pako from 'pako';
import Vue from 'vue';

!function(r,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((r=r||self).JsonLib={});}(undefined,function(r){var e=!0;function i(r){return r&&void 0!==r.circularRefs&&null!==r.circularRefs&&(e=!0===r.circularRefs),{circularRefs:e}}function o(r){return (o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(r){return typeof r}:function(r){return r&&"function"==typeof Symbol&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r})(r)}function f(r,e){for(var n=0;n<e.length;n++){var t=e[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(r,t.key,t);}}var n=function(){function e(r){!function(r,e){if(!(r instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.value=function r(e){{if("string"==typeof e){if(!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(e))throw new Error('Invalid number (value: "'+e+'")');return e}if("number"!=typeof e)return r(e&&e.valueOf());if(15<u(e+"").length)throw new Error("Invalid number: contains more than 15 digits (value: "+e+")");if(isNaN(e))throw new Error("Invalid number: NaN");if(!isFinite(e))throw new Error("Invalid number: Infinity");return e+""}}(r),this.type="LosslessNumber",this.isLosslessNumber=!0;}var r,n;return r=e,(n=[{key:"valueOf",value:function(){var r=parseFloat(this.value),e=u(this.value);if(15<e.length)throw new Error("Cannot convert to number: number would be truncated (value: "+this.value+")");if(!isFinite(r))throw new Error("Cannot convert to number: number would overflow (value: "+this.value+")");if(Math.abs(r)<Number.MIN_VALUE&&!/^0*$/.test(e))throw new Error("Cannot convert to number: number would underflow (value: "+this.value+")");return r}},{key:"toString",value:function(){return this.value}}])&&f(r.prototype,n),e}();function u(r){return ("string"!=typeof r?r+"":r).replace(/^-/,"").replace(/e.*$/,"").replace(/^0\.?0*|\./,"")}function a(r,e,n,t){return Array.isArray(n)?t.call(r,e,function(r,e){for(var n=[],t=0;t<r.length;t++)n[t]=a(r,t+"",r[t],e);return n}(n,t)):n&&"object"===o(n)&&!n.isLosslessNumber?t.call(r,e,function(r,e){var n={};for(var t in r)r.hasOwnProperty(t)&&(n[t]=a(r,t,r[t],e));return n}(n,t)):t.call(r,e,n)}function t(r){return encodeURIComponent(r.replace(/\//g,"~1").replace(/~/g,"~0"))}function c(r){return decodeURIComponent(r).replace(/~1/g,"/").replace(/~0/g,"~")}function l(r){return "#/"+r.map(t).join("/")}var s={NULL:0,DELIMITER:1,NUMBER:2,STRING:3,SYMBOL:4,UNKNOWN:5},v={"":!0,"{":!0,"}":!0,"[":!0,"]":!0,":":!0,",":!0},h={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},p="",d=0,y="",b="",g=s.NULL,m=[],w=[];function I(){d++,y=p.charAt(d);}function E(){for(g=s.NULL,b="";" "===y||"\t"===y||"\n"===y||"\r"===y;)I();if(v[y])return g=s.DELIMITER,b=y,void I();if(L(y)||"-"===y){if(g=s.NUMBER,"-"===y){if(b+=y,I(),!L(y))throw R("Invalid number, digit expected",d)}else "0"===y&&(b+=y,I());for(;L(y);)b+=y,I();if("."===y){if(b+=y,I(),!L(y))throw R("Invalid number, digit expected",d);for(;L(y);)b+=y,I();}if("e"===y||"E"===y){if(b+=y,I(),"+"!==y&&"-"!==y||(b+=y,I()),!L(y))throw R("Invalid number, digit expected",d);for(;L(y);)b+=y,I();}}else if('"'!==y){if(!N(y)){for(g=s.UNKNOWN;""!==y;)b+=y,I();throw R('Syntax error in part "'+b+'"')}for(g=s.SYMBOL;N(y);)b+=y,I();}else {for(g=s.STRING,I();""!==y&&'"'!==y;)if("\\"===y){I();var r=h[y];if(void 0!==r)b+=r,I();else {if("u"!==y)throw R('Invalid escape character "\\'+y+'"',d);I();for(var e="",n=0;n<4;n++){if(!/^[0-9a-fA-F]/.test(y))throw R("Invalid unicode character");e+=y,I();}b+=String.fromCharCode(parseInt(e,16));}}else b+=y,I();if('"'!==y)throw R("End of string expected");I();}}function N(r){return /^[a-zA-Z_]/.test(r)}function L(r){return "0"<=r&&r<="9"}function R(r,e){void 0===e&&(e=d-b.length);var n=new SyntaxError(r+" (char "+e+")");return n.char=e,n}function S(){if(g!==s.DELIMITER||"{"!==b)return function(){if(g!==s.DELIMITER||"["!==b)return function(){if(g!==s.STRING)return function(){if(g!==s.NUMBER)return function(){if(g!==s.SYMBOL)return function(){throw R(""===b?"Unexpected end of json string":"Value expected")}();if("true"===b)return E(),!0;if("false"===b)return E(),!1;if("null"!==b)throw R('Unknown symbol "'+b+'"');return E(),null}();var r=+b;return E(),r}();var r=b;return E(),r}();E();var r=[];if(g===s.DELIMITER&&"]"===b)return E(),r;var e=w.length;w[e]=r;for(;m[e]=r.length+"",r.push(S()),g===s.DELIMITER&&","===b;)E();if(g===s.DELIMITER&&"]"===b)return E(),w.length=e,m.length=e,r;throw R('Comma or end of array "]" expected')}();var r,e;E();var n={};if(g===s.DELIMITER&&"}"===b)return E(),n;var t=w.length;for(w[t]=n;;){if(g!==s.STRING)throw R("Object key expected");if(e=b,E(),g!==s.DELIMITER||":"!==b)throw R("Colon expected");if(E(),n[m[t]=e]=S(),g!==s.DELIMITER||","!==b)break;E();}if(g!==s.DELIMITER||"}"!==b)throw R('Comma or end of object "}" expected');return E(),"string"==typeof(r=n).$ref&&1===Object.keys(r).length?function(r){if(!i().circularRefs)return r;for(var e=function(r){var e=r.split("/").map(c);if("#"!==e.shift())throw SyntaxError("Cannot parse JSON Pointer: no valid URI fragment");return ""===e[e.length-1]&&e.pop(),e}(r.$ref),n=0;n<e.length;n++)if(e[n]!==m[n])throw new Error('Invalid circular reference "'+r.$ref+'"');return w[e.length]}(n):(w.length=t,m.length=t,n)}var M=[],x=[];function O(r,e,n){x=[],M=[];var t,o="function"==typeof e?e.call({"":r},"",r):r;return "number"==typeof n?10<n?t=A(" ",10):1<=n&&(t=A(" ",n)):"string"==typeof n&&""!==n&&(t=n),T(o,e,t,"")}function T(r,e,n,t){return "boolean"==typeof r||r instanceof Boolean||null===r||"number"==typeof r||r instanceof Number||"string"==typeof r||r instanceof String||r instanceof Date?JSON.stringify(r):r&&r.isLosslessNumber?r.value:Array.isArray(r)?function(r,e,n,t){var o=n?t+n:void 0,i=n?"[\n":"[";if(C(r))return D(r,e,n,t);var f=x.length;x[f]=r;for(var u=0;u<r.length;u++){var a=u+"",c="function"==typeof e?e.call(r,a,r[u]):r[u];n&&(i+=o),void 0!==c&&"function"!=typeof c?(M[f]=a,i+=T(c,e,n,o)):i+="null",u<r.length-1&&(i+=n?",\n":",");}return x.length=f,M.length=f,i+=n?"\n"+t+"]":"]"}(r,e,n,t):r&&"object"===o(r)?U(r,e,n,t):void 0}function U(r,e,n,t){var o=n?t+n:void 0,i=!0,f=n?"{\n":"{";if("function"==typeof r.toJSON)return O(r.toJSON(),e,n);if(C(r))return D(r,e,n,t);var u,a,c,l=x.length;for(var s in x[l]=r)if(r.hasOwnProperty(s)){var v="function"==typeof e?e.call(r,s,r[s]):r[s];u=s,c=e,void 0===(a=v)||"function"==typeof a||Array.isArray(c)&&!function(r,e){for(var n=0;n<r.length;n++)if(r[n]==e)return !0;return !1}(c,u)||(i?i=!1:f+=n?",\n":",",f+=n?o+'"'+s+'": ':'"'+s+'":',M[l]=s,f+=T(v,e,n,o));}return x.length=l,M.length=l,f+=n?"\n"+t+"}":"}"}function C(r){return -1!==x.indexOf(r)}function D(r,e,n,t){if(!i().circularRefs)throw new Error('Circular reference at "'+l(M)+'"');var o=x.indexOf(r);return U({$ref:l(M.slice(0,o))},e,n,t)}function A(r,e){for(var n="";0<e--;)n+=r;return n}r.LosslessNumber=n,r.config=i,r.parse=function(r,e){d=0,y=(p=r).charAt(0),b="",g=s.NULL,w=[],m=[],E();var n,t=S();if(""!==b)throw R("Unexpected characters");return e?a({"":n=t},"",n,e):t},r.stringify=O,Object.defineProperty(r,"__esModule",{value:!0});});

// import wasm from './json-rs/json_rs_bg.wasm'
//
// console.log('wasm', wasm)
// window.wasm = wasm
// wasm({ }).then(({ instance }) => {
//   console.log('finish', instance)
//   console.log(instance.exports.main())
// })

if (!Array.prototype.flat) {
Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth = 1) {
      return this.reduce(function (flat, toFlatten) {
        return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
      }, []);
    }
});
}

var utils = {

  parse_json(str) {
    try {
      return JsonLib.parse(str)
      // return JSON.parse(str)
    } catch (e) {
      console.log('Native JSON parse failed, using json lib', e);
    }
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
    obj = pako.deflate(obj, { to: 'string' });
    // console.timeLog('deflate')
    // console.log('saving compressed item ', obj.length, 'bytes...')
    // ldb.set(name, obj);
    localStorage.setItem(name, obj);
  },

  load (name, on_finish) {
    console.time('getItem before');
    setTimeout(() => {
      // console.log('get item')
      let obj = localStorage.getItem(name);
      // console.log('get item ok:', obj ? obj.length : 'nessun dato')
      // console.timeLog('getItem')
      if (!obj) return on_finish(null)
      try {
        console.time('inflate');
        // console.log('decompressing', obj.length, 'bytes...')
        obj = pako.inflate(obj, { to: 'string' });
        console.timeEnd('inflate');
        // console.log('parsing resulting', obj.length, 'bytes...')
        console.time('parse');
        obj = this.parse_json(obj);
        console.timeLog('parse');
        // console.log('finish')
        on_finish(obj);
      } catch (e) {
        console.error('error', e);
        on_finish(null);
      }
    }, 10);
  },

  waitCordova(func) {
    if (!this.isInApp() || window.is_cordova_ready) {
      func();
    } else {
      document.addEventListener('deviceready', func);
    }
  }
};

var Tim = new (function(){
  this.x = {};
  this.bench = (name, cb) => {
    let t = performance.now();
    let v = cb();
    let tot = performance.now() - t;
    Vue.set(this.x, name, (this.x[name]||0) + tot);
    return v
  };
  this.time_for = name => {
    return this.x[name]
  };
  this.reset = name => {
    Vue.set(this.x, name, 0);
  };
})();
window.Tim = Tim;

let $http = axios.create();

var index = {

  install (Vue, $opts) {
    this.opts = $opts;

    let $op = window.$op = Vue.$op = Vue.prototype.$op = {
      data: null,
      db: null,
    };

    $op.lang = 'it';
    $op.update = null;


    $op.loadFromStorage = on_finish => {
      $op.update = {
        from_cache: true,
        percent: 0.1,
      };
      utils.load('op-data', data => {
        $op.data = data; // could be null
        $op.update.percent = 0.9;
        this.addFunctionsToData();
        $op.update = null;
        if (on_finish) on_finish($op.db);
      });
    };

    $op.startTracking = () => {
      let client_id = localStorage.getItem('client_id');
      if (!client_id) {
        client_id = _.random(10000000, 99999999);
        localStorage.setItem('client_id', client_id);
      }
      let track = () => {
        $http.post($opts.api + 'view/' + $opts.token + '/track/' + client_id).finally(() => {
          setTimeout(track, 30000);
        });
      };
      track();
    };

    $op.init = (download_updates) => {
      $op.loadFromStorage(() => {
        if (download_updates) $op.downloadUpdates();
      });
    };

    $op.downloadUpdates = (on_finish) => {
      this.opts.debug && console.log('Checking for updates...');
      let last_token = localStorage.getItem('op-data-version');
      if (!last_token) {
        this.opts.debug && console.log('No previous data found, updating');
        $op.downloadData();
      } else {
        this.opts.debug && console.log('Checking if new versions are available');
        $http.get($opts.api + 'view/' + $opts.token + '/dist').then(res => {
          if (res.data.token != last_token) {
            this.opts.debug && console.log('New version available');
            $op.downloadData();
          } else {
            this.opts.debug && console.log('No new version available');
          }
        });
      }
    };

    $op.downloadData = (on_finish_callback, on_error_callback) => {
      if ($op.update) {
        this.opts.debug && console.log('already updating, download aborted');
        if (on_error_callback) on_error_callback();
        return
      }
      $op.update = { percent: 0 };

      this.opts.debug && console.log('downloading info...');
      $http.get($opts.api + 'view/' + $opts.token + '/dist').then(res => {
        let dist = res.data;
        this.opts.debug && console.log('downloading data...');
        $http.get($opts.api + 'storage/' + dist.token, {
          responseType: 'text',
          transformResponse: [(data) => { return data; }],
          onDownloadProgress: p => {
            $op.update.percent = p.loaded / dist.size;
          }
        }).then(res => {
          this.opts.debug && console.log('download complete, getting json...', typeof res.data);
          try {

            this.opts.debug && console.log('storing data...');
            utils.store('op-data', res.data);
            localStorage.setItem('op-data-version', dist.token);

            this.opts.debug && console.log('parsing json...');
            $op.data = utils.parse_json(res.data);

            this.opts.debug && console.log('adding functions to data...');
            this.addFunctionsToData();
            this.opts.debug && console.log('finished everything');

            $op.update = null;
            if (on_finish_callback) on_finish_callback();

          } catch (err) {
            this.opts.debug && console.error('error parsing json', JSON.stringify(err.message));
            $op.update = null;
            if (on_error_callback) on_error_callback(err.message);
          }

        }).catch(err => { // catch $http error
          this.opts.debug && console.error('error downloading data', JSON.stringify(err.message));
          $op.update = null;
          if (on_error_callback) on_error_callback(err.message);
        });
      });
    };

  },

  addFunctionsToData () {
    if (!$op.data) {
      this.opts.debug && console.log('$op.data not set, not adding functions to data');
      $op.db = null;
      return
    }

    // Map each resource name to its things
    $op.db = {};
    // Maps each record id to the record object (es. $op.id_to_record[8237])
    $op.id_to_record = {};

    $op.benchmark = () => {
      Tim.reset('get_value');
      Tim.reset('bench');
      Tim.reset('bench_t1');
      Tim.reset('bench_t2');
      Tim.reset('bench_t3');
      Tim.bench('bench', () => {
        for (var i = 0; i < 10; i++) {
          $op.data.resources.forEach(res => {
            res.data.forEach(thing => {
              thing.get_value('campo32');
              thing.get_value('nota2');
              thing.get_value('descrizione');
            });
          });
        }
      });
      return {
        tot_time: Tim.time_for('bench'),
        key_in_vals: Tim.time_for('bench_t1'),
        'res.values[record_i]': Tim.time_for('bench_t2'),
        'other': Tim.time_for('bench_t3'),
        'get_value': Tim.time_for('get_value'),
      }
    };

    // Add functions to each record
    $op.data.resources.forEach(res => {
      $op.db[res.name] = collect(res.data);
      res.data.forEach((record, record_i) => {
        $op.id_to_record[record.id] = record;
      });
    });


    $op.data.resources.forEach(res => {
      // Maps each field id to the field object (es. _name_to_field[10])
      let _name_to_field = {};
      res.fields.forEach(f => (_name_to_field[f.name] = f));

      res.data.forEach((record, record_i) => {

        // Return the value of a field, using $op.lang
        record.get_value = (field_name, def) => {
          // return Tim.bench('get_value', ()=>{
            let field = _name_to_field[field_name];
            if (!field) return def
            let fid = field.id;
            // return Tim.bench('bench_t1', () => {
              let k = field.is_translatable ? `${fid}_${$op.lang}` : fid;
              let v = record.fields[k];
              if (v !== undefined) return v
              return def
            // })
          // })
        };

        record.get_url = (field_name, opts) => {
          opts = opts || {};
          let w = opts.w || 600;
          let h = opts.h || null;
          let zoom = opts.zoom || false;
          let format = opts.format || 'png';

          let value = record.get_value(field_name);
          if (!value) return
          let token = value.token;
          let ext = value.ext;
          let trailer = [w||'', h||''].join('x');
          if (!zoom) trailer+= '-contain';
          trailer+= '.' + (format || 'png');
          return this.opts.api + 'storage/' + token + '.' + trailer
        };
      });

      let rel_fields = res.fields.filter(x => x.type == 'relation');
      res.data.forEach((record, record_i) => {
        record.rels = {};
        rel_fields.forEach(f => {
          record.rels[f.name] = collect(record.rel_ids[f.id].map(id => $op.id_to_record[id]));
        });
        delete(record.rel_ids);
      });
    });
  },

  utils,

  Timer: Tim,
};

export default index;
