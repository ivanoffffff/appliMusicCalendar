import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

console.log('main.tsx is loading...');

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log('React app rendered!');
} else {
  console.error('Could not find root element!');
}
