import { useEffect } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useUIStore } from '@/stores/useUIStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { usePersistence, loadAndHydrate } from '@/hooks/usePersistence'
import { Sidebar } from '@/components/layout/Sidebar'
import { SearchBar } from '@/components/layout/SearchBar'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { QuickCalendar } from '@/components/layout/QuickCalendar'
import { BillsPage } from '@/components/bills/BillsPage'
import { InvestmentsPage } from '@/components/investments/InvestmentsPage'
import { GoalsPage } from '@/components/goals/GoalsPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { FGTSPage } from '@/components/fgts/FGTSPage'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { AnnualSummaryPage } from '@/components/annual/AnnualSummaryPage'
import { NetWorthPage } from '@/components/networth/NetWorthPage'
import { HelpPage } from '@/components/help/HelpPage'
import { IncomePage } from '@/components/income/IncomePage'
import { Notifications } from '@/components/shared/Notifications'

function App(): React.JSX.Element {
  const activeSection = useUIStore((s) => s.activeSection)
  const isLoading = useUIStore((s) => s.isLoading)
  const setLoading = useUIStore((s) => s.setLoading)
  const theme = useSettingsStore((s) => s.settings.theme)

  usePersistence()

  useEffect(() => {
    loadAndHydrate()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-1">
              <NotificationBell />
              <QuickCalendar />
            </div>
            <SearchBar />
          </div>
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {activeSection === 'bills' && <BillsPage />}
            {activeSection === 'investments' && <InvestmentsPage />}
            {activeSection === 'fgts' && <FGTSPage />}
            {activeSection === 'goals' && <GoalsPage />}
            {activeSection === 'dashboard' && <DashboardPage />}
            {activeSection === 'annual' && <AnnualSummaryPage />}
            {activeSection === 'networth' && <NetWorthPage />}
            {activeSection === 'income' && <IncomePage />}
            {activeSection === 'settings' && <SettingsPage />}
            {activeSection === 'help' && <HelpPage />}
          </main>
        </div>
        <Notifications />
      </div>
    </Tooltip.Provider>
  )
}

export default App
