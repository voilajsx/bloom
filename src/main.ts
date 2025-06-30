/**
 * Bloom Framework - Clean main.ts without duplicate ThemeProvider
 * @module @voilajsx/bloom
 * @file src/main.ts
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
// ✅ Keep the styles import
import '@voilajsx/uikit/styles'
import '@/assets/styles/globals.css'
import App from './app'

// 🔧 REMOVED: ThemeProvider import and usage
// The ThemeProvider is already handled in layout.tsx

// Initialize Bloom Framework
console.log('🌸 Bloom Framework initializing...')

ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null,
    // 🔧 CLEAN: Just render the App directly
    // ThemeProvider is handled in BloomLayoutWrapper
    React.createElement(App)
  )
)