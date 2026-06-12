import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Guard: Ensure root element exists before rendering
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('[React] Root element with id="root" not found in HTML');
}

createRoot(rootElement).render(
  // Note: StrictMode disabled due to react-beautiful-dnd incompatibility with React 18
  // See: https://github.com/atlassian/react-beautiful-dnd/issues/2396
  <App />
)
