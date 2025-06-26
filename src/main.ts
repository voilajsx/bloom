/**
 * Bloom Framework - Main application entry point with correct router order
 * @module @voilajsx/bloom
 * @file src/main.ts
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@voilajsx/uikit/theme-provider'
import '@voilajsx/uikit/styles'
import '@/assets/styles/globals.css'
import App from './app'
import defaults from '@/defaults'

// Initialize Bloom Framework
console.log('🌸 Bloom Framework initializing...')

ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null,
    React.createElement(ThemeProvider, {
      theme: defaults['app-theme'] || 'studio',
      mode: defaults['app-mode'] || 'light',
      detectSystem: true,
      children: React.createElement(App)
    })
  )
)