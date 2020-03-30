import axios from 'axios'
import collect from 'collect.js';
import utils from './utils'
import Vue from 'vue'

var Tim = new (function(){
  this.x = {}
  this.bench = (name, cb) => {
    let t = performance.now()
    let v = cb()
    let tot = performance.now() - t
    Vue.set(this.x, name, (this.x[name]||0) + tot)
    return v
  }
  this.time_for = name => {
    return this.x[name]
  }
  this.reset = name => {
    Vue.set(this.x, name, 0)
  }
})()
window.Tim = Tim

let __json_parse = (string, callback) => {
  let w = new Worker('statics/worker.js')
  w.onmessage = e => {
    callback(e.data)
  }
  w.postMessage(string)
}

let $http = axios.create()

export default {

  install (Vue, $opts) {
    this.opts = $opts

    let $op = window.$op = Vue.$op = Vue.prototype.$op = {
      data: null,
      db: null,
    }

    $op.lang = 'it'
    $op.update = null


    $op.loadFromStorage = on_finish => {
      $op.update = {
        from_cache: true,
        percent: 0.1,
      }
      utils.load('op-data', data => {
        $op.data = data // could be null
        $op.update.percent = 0.9
        this.addFunctionsToData()
        $op.update = null
        if (on_finish) on_finish($op.db)
      })
    }

    $op.startTracking = () => {
      let client_id = localStorage.getItem('client_id')
      if (!client_id) {
        client_id = _.random(10000000, 99999999)
        localStorage.setItem('client_id', client_id)
      }
      let track = () => {
        $http.post($opts.api + 'view/' + $opts.token + '/track/' + client_id).finally(() => {
          setTimeout(track, 30000)
        })
      }
      track()
    }

    $op.init = (download_updates) => {
      $op.loadFromStorage(() => {
        if (download_updates) $op.downloadUpdates()
      })
    }

    $op.downloadUpdates = (on_finish) => {
      this.opts.debug && console.log('Checking for updates...')
      let last_token = localStorage.getItem('op-data-version')
      if (!last_token) {
        this.opts.debug && console.log('No previous data found, updating')
        $op.downloadData()
      } else {
        this.opts.debug && console.log('Checking if new versions are available')
        $http.get($opts.api + 'view/' + $opts.token + '/dist').then(res => {
          if (res.data.token != last_token) {
            this.opts.debug && console.log('New version available')
            $op.downloadData()
          } else {
            this.opts.debug && console.log('No new version available')
          }
        })
      }
    }

    $op.downloadData = (on_finish_callback, on_error_callback) => {
      if ($op.update) {
        this.opts.debug && console.log('already updating, download aborted')
        if (on_error_callback) on_error_callback()
        return
      }
      $op.update = { percent: 0 }

      this.opts.debug && console.log('downloading info...')
      $http.get($opts.api + 'view/' + $opts.token + '/dist').then(res => {
        let dist = res.data
        this.opts.debug && console.log('downloading data...')
        $http.get($opts.api + 'storage/' + dist.token, {
          responseType: 'text',
          transformResponse: [(data) => { return data; }],
          onDownloadProgress: p => {
            $op.update.percent = p.loaded / dist.size
          }
        }).then(res => {
          this.opts.debug && console.log('download complete, getting json...', typeof res.data)
          try {

            this.opts.debug && console.log('storing data...')
            utils.store('op-data', res.data)
            localStorage.setItem('op-data-version', dist.token)

            this.opts.debug && console.log('parsing json...')
            $op.data = utils.parse_json(res.data)

            this.opts.debug && console.log('adding functions to data...')
            this.addFunctionsToData()
            this.opts.debug && console.log('finished everything')

            $op.update = null
            if (on_finish_callback) on_finish_callback()

          } catch (err) {
            this.opts.debug && console.error('error parsing json', JSON.stringify(err.message))
            $op.update = null
            if (on_error_callback) on_error_callback(err.message)
          }

        }).catch(err => { // catch $http error
          this.opts.debug && console.error('error downloading data', JSON.stringify(err.message))
          $op.update = null
          if (on_error_callback) on_error_callback(err.message)
        })
      })
    }

  },

  addFunctionsToData () {
    if (!$op.data) {
      this.opts.debug && console.log('$op.data not set, not adding functions to data')
      $op.db = null
      return
    }

    // Map each resource name to its things
    $op.db = {}
    // Maps each record id to the record object (es. $op.id_to_record[8237])
    $op.id_to_record = {}

    $op.benchmark = () => {
      Tim.reset('get_value')
      Tim.reset('bench')
      Tim.reset('bench_t1')
      Tim.reset('bench_t2')
      Tim.reset('bench_t3')
      Tim.bench('bench', () => {
        for (var i = 0; i < 10; i++) {
          $op.data.resources.forEach(res => {
            res.data.forEach(thing => {
              thing.get_value('campo32')
              thing.get_value('nota2')
              thing.get_value('descrizione')
            })
          })
        }
      })
      return {
        tot_time: Tim.time_for('bench'),
        key_in_vals: Tim.time_for('bench_t1'),
        'res.values[record_i]': Tim.time_for('bench_t2'),
        'other': Tim.time_for('bench_t3'),
        'get_value': Tim.time_for('get_value'),
      }
    }

    // Add functions to each record
    $op.data.resources.forEach(res => {
      // Maps each field id to the field object (es. _name_to_field[10])
      let _name_to_field = {}
      res.fields.forEach(f => (_name_to_field[f.name] = f))

      $op.db[res.name] = collect(res.data)
      res.data.forEach((record, record_i) => {
        $op.id_to_record[record.id] = record

        // Return the value of a field, using $op.lang
        record.get_value = (field_name, def) => {
          // return Tim.bench('get_value', ()=>{
            let field = _name_to_field[field_name]
            if (!field) return def
            let fid = field.id
            // return Tim.bench('bench_t1', () => {
              let k = field.is_translatable ? `${fid}_${$op.lang}` : fid
              let v = record.fields[k]
              if (v !== undefined) return v
              return def
            // })
          // })
        }

        record.get_url = (field_name, opts) => {
          opts = opts || {}
          let w = opts.w || 600
          let h = opts.h || null
          let zoom = opts.zoom || false
          let format = opts.format || 'png'

          let value = record.get_value(field_name)
          if (!value) return
          let token = value.token
          let ext = value.ext
          let trailer = [w||'', h||''].join('x')
          if (!zoom) trailer+= '-contain'
          trailer+= '.' + (format || 'png')
          return this.opts.api + 'storage/' + token + '.' + trailer
        }
      })

      let rel_fields = res.fields.filter(x => x.type == 'relation')
      res.data.forEach((record, record_i) => {
        record.rels = {}
        rel_fields.forEach(f => {
          record.rels[f.name] = collect(record.rel_ids[f.id].map(id => $op.id_to_record[id]))
        })
        delete(record.rel_ids)
      })
    })
  },

  utils,

  Timer: Tim,
}
