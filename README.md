# OnPage App - Core Module


## Install:
```bash
# If you use yarn
yarn add https://github.com/gufoe/op-vue.git
# If you use npm
npm i -s https://github.com/gufoe/op-vue.git
```

In your main.js file:
```js
import OpVue from 'op-vue'

Vue.use(OpVue, {
  api: 'https://YOUR-DOMAIN.onpage.it/api/',
  token: 'YOUR-APP-TOKEN',
})

new Vue({
  router,
  render: h => h(App),
  data: {
    $op: Vue.$op,
  },
}).$mount('#app')
```

In your App.vue file:
```js
export default {

    created () {
        // Will download updates if available
        $op.init(true)

        // Will only load already downloaded catalogues (use $op.downloadData() before)
        $op.init(false)
    }
    // ...
}
```

You will now be able to access your data at `$op.data` and `$op.db`.
