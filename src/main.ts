import { defineCustomElement } from 'vue'
import App from './App.vue'

const element = defineCustomElement(App)

if (!customElements.get('gfi-dgms-widget')) {
    customElements.define('gfi-dgms-widget', element)
}

export default element