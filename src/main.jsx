import { configureBilling } from './billing';
import { supabase } from './api/supabaseClient';
configureBilling({ supabase });
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
