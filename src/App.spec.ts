// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './App.vue';

describe('App', () => {
    it('renders the greeting message', () => {
        const wrapper = mount(App);

        expect(wrapper.get('h1').text()).toBe('Hello from GFI-DGMS!');
    });
});
