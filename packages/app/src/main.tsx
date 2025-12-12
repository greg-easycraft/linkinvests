import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { queryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider, useAuth } from '@/components/providers/auth-provider'

function InnerApp() {
  const auth = useAuth()
  const router = createAppRouter(auth)
  return <RouterProvider router={router} />
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <InnerApp />
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}

reportWebVitals()
