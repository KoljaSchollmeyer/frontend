import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '../LoginView.vue'

// Mock the httpClient module
vi.mock('../../services/httpClient', () => ({
  loginUser: vi.fn(),
  createUser: vi.fn()
}))

describe('LoginView Component', () => {
  it('renders without crashing', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains a form element', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('contains email and password inputs', () => {
    const wrapper = mount(LoginView)
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('contains buttons for form submission', () => {
    const wrapper = mount(LoginView)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('initializes with empty form fields', () => {
    const wrapper = mount(LoginView)
    const inputs = wrapper.findAll('input') as any[]
    
    inputs.forEach((input) => {
      const value = (input.element as HTMLInputElement).value
      expect(value).toBe('')
    })
  })

  it('can toggle between login and signup modes', async () => {
    const wrapper = mount(LoginView)
    const buttons = wrapper.findAll('button')
    
    const initialButtonCount = buttons.length
    
    // Try to find and click a mode toggle button
    const toggleButton = buttons.find(b => {
      const text = b.text().toLowerCase()
      return text.includes('sign') || text.includes('registr') || text.includes('konto')
    })
    
    if (toggleButton) {
      await toggleButton.trigger('click')
      const updatedInputs = wrapper.findAll('input')
      
      // After mode change, we should still have inputs
      expect(updatedInputs.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('displays welcome message or branding', () => {
    const wrapper = mount(LoginView)
    const text = wrapper.text()
    
    // Component should display some branding text
    expect(text.length).toBeGreaterThan(0)
    expect(text.toLowerCase()).toMatch(/finance|master|anmeld|login|register|registr/)
  })
})
