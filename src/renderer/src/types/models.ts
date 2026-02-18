export type EntityId = string
export type MonthKey = string // "2026-02"

// ─── Workspace ───────────────────────────────────────────

export interface Workspace {
  id: EntityId
  name: string
  type: 'bills' | 'investments' | 'fgts'
  color: string
  icon?: string
  createdAt: string
  sortOrder: number
}

// ─── Bills / Contas Mensais ──────────────────────────────

export interface Bill {
  id: EntityId
  workspaceId: EntityId
  name: string
  value: number // centavos
  dueDay: number // 1-31
  categoryId: EntityId
  notes: string
  isRecurring: boolean
  customFields: Record<string, string>
  createdAt: string
}

export type BillStatus = 'pending' | 'paid' | 'overdue'

export interface Attachment {
  id: EntityId
  name: string
  path: string
  size: number
  uploadedAt: string
}

export interface BillEntry {
  id: EntityId
  billId: EntityId
  name: string
  value: number // centavos
  dueDate: string // ISO date
  status: BillStatus
  paidDate?: string
  notes: string
  categoryId: EntityId
  customFields: Record<string, string>
  attachments: Attachment[]
}

export interface MonthlyBillRecord {
  id: EntityId
  workspaceId: EntityId
  monthKey: MonthKey
  bills: BillEntry[]
}

// ─── Investments / Investimentos ─────────────────────────

export type InvestmentType = 'renda_fixa' | 'acoes' | 'fundo' | 'cripto' | 'outro'

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  renda_fixa: 'Renda Fixa',
  acoes: 'Ações',
  fundo: 'Fundo de Investimento',
  cripto: 'Criptomoedas',
  outro: 'Outro'
}

export interface Investment {
  id: EntityId
  workspaceId: EntityId
  name: string
  type: InvestmentType
  currentBalance: number // centavos - total acumulado
  notes: string
  isActive: boolean
  createdAt: string
}

export type TransactionType = 'contribution' | 'withdrawal' | 'yield'

export interface InvestmentTransaction {
  id: EntityId
  investmentId: EntityId
  workspaceId: EntityId
  type: TransactionType
  amount: number // centavos (sempre positivo)
  monthKey: MonthKey
  date: string
  notes: string
  attachments: Attachment[]
}

// ─── FGTS ────────────────────────────────────────────────

export interface FGTSRecord {
  id: EntityId
  workspaceId: EntityId
  monthKey: MonthKey
  balance: number // centavos
  notes: string
  date: string
}

// ─── Goals / Metas ───────────────────────────────────────

export type Periodicity = 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'custom'

export interface GoalContribution {
  id: EntityId
  goalId: EntityId
  periodKey: string
  targetAmount: number // centavos
  actualAmount: number // centavos
  date: string
  notes: string
}

export type GoalType = 'manual' | 'investment_linked'

export interface Goal {
  id: EntityId
  name: string
  description: string
  goalType: GoalType // manual = aportes registrados na aba metas; investment_linked = calcula dos investimentos
  targetAmount: number // centavos por periodo
  periodicity: Periodicity
  customPeriodDays?: number
  startDate: string
  endDate?: string
  linkedWorkspaceIds: EntityId[]
  linkedInvestmentIds: EntityId[]
  contributions: GoalContribution[]
  isActive: boolean
  createdAt: string
}

// ─── Income / Receitas ──────────────────────────────────

export type IncomeCategory = 'salary' | 'freelance' | 'investments' | 'bonus' | 'other'

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investments: 'Rendimentos',
  bonus: 'Bônus',
  other: 'Outros'
}

export interface IncomeEntry {
  id: EntityId
  monthKey: MonthKey
  name: string
  amount: number // centavos
  category: IncomeCategory
  date: string
  notes: string
  isRecurring: boolean
}

// ─── Categories & Settings ───────────────────────────────

export interface Category {
  id: EntityId
  name: string
  color: string
  icon?: string
  type: 'bill' | 'investment' | 'both'
  isDefault: boolean
  sortOrder: number
  budget?: number // centavos - orçamento mensal opcional
}

export interface CustomField {
  id: EntityId
  name: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  appliesTo: 'bills' | 'investments' | 'both'
}

export type AppTheme = 'light' | 'dark'
export type AppSection = 'bills' | 'investments' | 'goals' | 'dashboard' | 'fgts' | 'settings' | 'annual' | 'networth' | 'help' | 'income'

export interface AppSettings {
  currency: string
  locale: string
  theme: AppTheme
  defaultView: AppSection
  categories: Category[]
  customFields: CustomField[]
  lastOpenedWorkspaceId?: EntityId
  lastOpenedMonth?: MonthKey
  backupEnabled: boolean
  backupRetentionCount: number
  autoGenerateRecurringBills: boolean
}

// ─── Root Data ───────────────────────────────────────────

export interface AppData {
  version: number
  settings: AppSettings
  workspaces: Workspace[]
  bills: Bill[]
  monthlyBillRecords: MonthlyBillRecord[]
  investments: Investment[]
  investmentTransactions: InvestmentTransaction[]
  goals: Goal[]
  fgtsRecords: FGTSRecord[]
  incomeEntries: IncomeEntry[]
}
