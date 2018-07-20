import { mount } from '@vue/test-utils';
import Homepage from '@/views/Homepage.vue';

describe('Homepage.vue', () => {
  it('renders the correct markup', () => {
    const wrapper = mount(Homepage);
    expect(wrapper.contains('.container')).toBe(true);
    expect(wrapper.contains('.font-list-wrapper')).toBe(true);
    expect(wrapper.findAll('.steps > div').length).toBe(3);
  });
});
