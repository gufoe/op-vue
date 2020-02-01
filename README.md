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
  // debug: true,
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
Example code:

```html
<div v-if="!$op.db">
  Downloading data...
</div>
<div v-else>
  <div v-for="cat in $op.db.categories" :key="cat.id">
    <h4>{{ cat.get_value('name') }}</h4>

    <img width="100px" :src="cat.get_url('image', {w:100, h:100})" alt="">
    <div v-for="prod in cat.rels.products" :key="prod.id">
      {{ prod.get_value('name') }}
      <div v-for="feat in prod.rels.features" :key="feat.id">
        {{ feat.get_value('name') }}
      </div>
    </div>
  </div>
</div>
```
