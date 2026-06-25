# Implementation Plan: Expense & Budget Visualizer

## Overview

This implementation plan breaks down the Expense & Budget Visualizer into discrete coding tasks. The app is a client-side web application using HTML5, CSS3, and Vanilla JavaScript ES6+ with Chart.js for visualization and LocalStorage for persistence. Each task builds incrementally on previous work, with property-based and unit tests integrated as sub-tasks to validate correctness early.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create directory structure: `css/`, `js/` folders
  - Create `index.html` with semantic HTML5 structure including header, main sections (input-section, data-section with list-panel and chart-panel), and footer
  - Add form elements with IDs: `#transaction-form`, `#item-name`, `#amount`, `#category`, submit button
  - Add display elements: `#total-amount`, `#transaction-list`, `#expense-chart` canvas
  - Include Chart.js CDN link in `<script>` tag
  - Add `<script src="js/app.js" defer></script>`
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Create responsive CSS layout
  - Create `css/style.css` with reset and base styles
  - Implement Flexbox/Grid layout: two-column layout for ≥768px (list-panel | chart-panel), single-column stacked layout for <768px
  - Style form inputs, buttons, transaction list items, and error message container
  - Add mobile-responsive styles for 320px to 1440px viewport widths
  - Style total display, chart canvas container, and empty state messages
  - _Requirements: 6.2, 6.5_

- [x] 3. Implement StorageModule for data persistence
  - [x] 3.1 Create StorageModule with `read()` and `save()` methods in `js/app.js`
    - Implement `read()`: parse JSON from `localStorage.getItem('expense_transactions')`, return empty array if not found or corrupted
    - Implement `save(transactions)`: serialize transactions array to JSON and save via `localStorage.setItem()`
    - Add error handling for `QuotaExceededError` and JSON parse errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 3.2 Write property test for StorageModule
    - **Property 3: Storage Round-Trip Preservation**
    - **Validates: Requirements 2.1, 2.2, 2.4**
    - Generate random transaction arrays using `fc.array(arbitraryTransaction())`
    - Assert that `read(save(txns))` deep-equals original `txns` array (all fields preserved)

- [x] 4. Implement ValidatorModule for form validation
  - [x] 4.1 Create ValidatorModule with `validate(formData)` method
    - Implement validation logic: check `itemName` non-empty (trimmed), `amount` > 0 and is number, `category` in ["Food", "Transport", "Fun"]
    - Return `ValidationResult` object with `valid` boolean and `errors` object containing specific error messages
    - Error messages: "Item name is required", "Amount must be greater than 0", "Please select a category"
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 4.2 Write property test for ValidatorModule
    - **Property 1: Validation Logic Correctness**
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
    - Generate random form data using `arbitraryFormData()` (including valid/invalid combinations)
    - Assert `result.valid === true` iff all fields valid; error messages match specifications

- [x] 5. Implement TransactionStore for state management
  - [x] 5.1 Create TransactionStore with in-memory transactions array and core methods
    - Implement `getAll()`: return current transactions array
    - Implement `add(transaction)`: push to array, call `StorageModule.save()`, return void
    - Implement `remove(id)`: filter out transaction by id, call `StorageModule.save()`, return void
    - Implement `getTotalAmount()`: sum all transaction amounts using `reduce()`
    - Implement `getByCategory()`: return object with category keys (Food, Transport, Fun) and sum of amounts per category
    - Implement `generateId()` helper: combine `Date.now().toString(36)` + random suffix
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
  
  - [ ]* 5.2 Write property test for add operation
    - **Property 6: Add Grows List by One**
    - **Validates: Requirements 3.2**
    - Generate initial transaction array and new valid transaction
    - Assert list length increases by exactly 1 and new transaction is present
  
  - [ ]* 5.3 Write property test for total calculation
    - **Property 7: Total Equals Sum of All Amounts**
    - **Validates: Requirements 4.1**
    - Generate random transaction arrays including empty array
    - Assert `getTotalAmount()` equals manual sum of all amounts
  
  - [ ]* 5.4 Write property test for add updating total
    - **Property 8: Add Increases Total Correctly**
    - **Validates: Requirements 4.2**
    - Generate initial transaction list, record total T, add new transaction with amount A
    - Assert new total equals T + A
  
  - [ ]* 5.5 Write property test for category sums
    - **Property 11: Category Sums Equal Total**
    - **Validates: Requirements 5.1**
    - Generate random transaction arrays
    - Assert sum of `getByCategory()` values equals `getTotalAmount()`

- [x] 6. Checkpoint - Verify core data layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement utility functions
  - [x] 7.1 Create `formatCurrency(amount)` function
    - Use `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })` to format amounts
    - _Requirements: 4.4_
  
  - [ ]* 7.2 Write property test for currency formatting
    - **Property 10: Currency Formatting**
    - **Validates: Requirements 4.4**
    - Generate non-negative numbers using `fc.nat()`
    - Assert output starts with "Rp", contains dot separators, has no decimal places

- [x] 8. Implement RenderEngine for UI updates
  - [x] 8.1 Create RenderEngine with rendering methods
    - Implement `renderTransactionList()`: clear `#transaction-list` innerHTML, iterate transactions, create `<li>` elements with itemName, formatted amount, category, and delete button with `data-id` attribute
    - Display "No transactions yet" message when list is empty
    - Implement `renderTotalDisplay()`: update `#total-amount` textContent with formatted total using `formatCurrency()`
    - Implement `renderAll()`: orchestrate calls to `renderTransactionList()`, `renderTotalDisplay()`, and `ChartModule.update()`
    - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 8.2 Write property test for render contains all info
    - **Property 5: Render Contains All Transaction Information**
    - **Validates: Requirements 3.1**
    - Generate random transactions, render each
    - Assert rendered HTML contains `itemName`, `formatCurrency(amount)`, and `category` as visible text
  
  - [ ]* 8.3 Write unit tests for RenderEngine
    - Test empty list displays "No transactions yet" message
    - Test delete button has correct `data-id` attribute
    - Test total display updates when transactions change

- [x] 9. Implement ChartModule for pie chart visualization
  - [x] 9.1 Create ChartModule with Chart.js integration
    - Create singleton `chartInstance` variable
    - Implement `init(canvasId)`: create Chart.js pie chart instance on canvas element
    - Implement `update(data)`: update chart with category labels and values from `TransactionStore.getByCategory()`, call `chartInstance.update()`
    - Handle "No data" state: display overlay message when all values are zero
    - Add error handling for Chart.js load failures and update errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 9.2 Write unit tests for ChartModule
    - Test chart displays "No data" when all transactions deleted
    - Test chart updates when new transaction added
    - Test chart shows correct proportions for each category

- [x] 10. Implement FormController for form interactions
  - [x] 10.1 Create FormController with form event handling
    - Implement `init()`: attach submit event listener to `#transaction-form`
    - On submit: prevent default, gather form data, call `ValidatorModule.validate()`
    - If valid: create transaction object with generated id, call `TransactionStore.add()`, call `resetFields()`, call `clearErrors()`
    - If invalid: call `showErrors(errors)`
    - Implement `showErrors(errors)`: render error messages in `.error-messages` div with `role="alert"`
    - Implement `clearErrors()`: empty `.error-messages` div
    - Implement `resetFields()`: reset form to default empty state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 10.2 Write property test for form reset
    - **Property 2: Form Reset After Successful Add**
    - **Validates: Requirements 1.6**
    - Generate valid transactions, add each
    - Assert all form fields reset to empty strings after successful add
  
  - [ ]* 10.3 Write unit tests for FormController
    - Test form displays all error messages for completely invalid submission
    - Test error messages clear on next valid submission
    - Test form submission triggers full render cycle

- [x] 11. Implement delete functionality with event delegation
  - [x] 11.1 Add delete button click handlers
    - Attach event listener to `#transaction-list` using event delegation
    - On delete button click: get transaction id from `data-id` attribute, call `TransactionStore.remove(id)`, call `RenderEngine.renderAll()`
    - _Requirements: 2.3, 3.4, 4.3, 5.3_
  
  - [ ]* 11.2 Write property test for delete operation
    - **Property 4: Delete Removes and Persists**
    - **Validates: Requirements 2.3, 3.4**
    - Generate non-empty transaction array, pick random id
    - After delete, assert id absent from in-memory array and from localStorage
  
  - [ ]* 11.3 Write property test for delete updating total
    - **Property 9: Delete Decreases Total Correctly**
    - **Validates: Requirements 4.3**
    - Generate non-empty list with total T, delete transaction with amount A
    - Assert new total equals T - A
  
  - [ ]* 11.4 Write unit tests for delete functionality
    - Test delete button click removes transaction from list
    - Test delete updates total display correctly
    - Test delete updates chart correctly

- [x] 12. Implement application initialization and wiring
  - [x] 12.1 Create app initialization on DOMContentLoaded
    - On `DOMContentLoaded`: call `StorageModule.read()` to hydrate `TransactionStore`
    - Initialize `ChartModule.init('expense-chart')`
    - Call `FormController.init()`
    - Attach delete button event delegation to `#transaction-list`
    - Call `RenderEngine.renderAll()` to render initial state
    - _Requirements: 2.2, 7.1, 7.2, 7.3_
  
  - [ ]* 12.2 Write integration tests for full app flow 
    - Test complete add flow: form submit → storage → render → chart update
    - Test complete delete flow: button click → storage → render → chart update
    - Test page reload preserves data (mock localStorage)
    - Test app loads and renders within 2 seconds on standard connection

- [x] 13. Add accessibility attributes and ARIA labels
  - Add `<label>` elements for all form inputs
  - Add `role="alert"` to `.error-messages` div for screen reader announcements
  - Add `aria-label="Expense Distribution Chart"` to `#expense-chart` canvas
  - Add `aria-label="Delete [itemName]"` to each delete button dynamically in render loop
  - _Requirements: 6.1, 6.5_

- [ ] 14. Final testing and performance validation
  - [ ]* 14.1 Run all property tests with 100+ iterations
    - Execute all 11 property tests in test suite
    - Verify all pass with minimum 100 iterations each
  
  - [ ]* 14.2 Run all unit and integration tests
    - Execute complete test suite including edge cases and UI tests
    - Verify coverage ≥90% line coverage, ≥85% branch coverage
  
  - [ ]* 14.3 Manual cross-browser testing
    - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
    - Verify responsive layout on 320px, 768px, and 1440px viewports
    - Verify add/delete operations complete in <200ms
    - Verify initial page load completes in <2s

- [x] 15. Final checkpoint - Verify complete functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement Custom Category — CategoryStore, StorageModule & ValidatorModule extensions
  - [x] 16.1 Create CategoryStore module with in-memory `customCategories` array
    - Implement `getAll()`: return sorted alphabetically custom categories array
    - Implement `getAllWithDefaults()`: return `['Food','Transport','Fun']` diikuti `getAll()`
    - Implement `add(name)`: push trimmed name + call `StorageModule.saveCustomCategories()`
    - Implement `remove(name)`: filter out + call `StorageModule.saveCustomCategories()` + call `TransactionStore.recategorize(name, '')`
    - Implement `has(name)`: case-insensitive check termasuk default categories
    - Implement `getAffectedCount(name)`: hitung transaksi yang pakai kategori ini
    - _Requirements: 8.2, 8.3, 8.5, 8.6, 8.9, 8.10_

  - [x] 16.2 Extend StorageModule with custom categories persistence
    - Tambah konstanta `CUSTOM_CATEGORIES_KEY = 'expense_custom_categories'`
    - Implement `readCustomCategories()`: parse JSON dari localStorage, return `[]` jika tidak ada / error
    - Implement `saveCustomCategories(cats)`: JSON.stringify dan simpan ke localStorage
    - _Requirements: 8.2, 8.3_

  - [x] 16.3 Extend ValidatorModule with `validateCategoryName()`
    - Implement `validateCategoryName(name, existingCategories)`: cek `name.trim()` panjang 1–20 karakter
    - Return error `"Category name must be 1-20 characters"` jika kosong/whitespace atau > 20 karakter
    - Return error `"Category already exists"` jika `name.toLowerCase()` cocok dengan default atau existing custom
    - _Requirements: 8.7, 8.8_

  - [x] 16.4 Extend TransactionStore with `recategorize()` and dynamic `getByCategory()`
    - Implement `recategorize(oldCategory, newCategory)`: ubah semua transaksi yang pakai `oldCategory` menjadi `newCategory`, lalu panggil `StorageModule.save()`
    - Update `getByCategory()`: kembalikan semua kategori dari transaksi (termasuk custom dan `""`), bukan hanya 3 default
    - _Requirements: 8.4, 8.10, 5.1_

  - [ ]* 16.5 Write property test for custom category round-trip (Property 12)
    - **Property 12: Custom Category Round-Trip Preservation**
    - **Validates: Requirements 8.2, 8.3**
    - Generate `fc.array(fc.string({minLength:1, maxLength:20}))` valid names
    - Assert `readCustomCategories(saveCustomCategories(cats))` deep-equals original array

  - [ ]* 16.6 Write property test for category uniqueness invariant (Property 13)
    - **Property 13: Custom Category Uniqueness Invariant**
    - **Validates: Requirements 8.7, 8.8**
    - Generate `fc.array(fc.string())` with intentional duplicates, call `CategoryStore.add()` untuk setiap item
    - Assert no two entries are equal when compared case-insensitively

  - [ ]* 16.7 Write property test for category sums include custom categories (Property 14)
    - **Property 14: Category Sums Include Custom Categories**
    - **Validates: Requirements 8.4, 5.1**
    - Generate `fc.array(arbitraryTransactionWithCustom())` with mixed default + custom categories
    - Assert `sum(Object.values(getByCategory()))` === `getTotalAmount()`

- [x] 17. Implement Custom Category — HTML additions, RenderEngine & FormController extensions
  - [x] 17.1 Add Custom Category HTML elements to `index.html`
    - Tambah tombol `<button type="button" id="add-category-btn">+ Add Category</button>` setelah `<select#category>`
    - Tambah panel input tersembunyi `<div id="add-category-panel" hidden>` dengan input `#new-category-input`, tombol `#confirm-category-btn`, `#cancel-category-btn`, dan `<div class="error-message" id="category-error">`
    - Tambah kontainer pill `<div id="custom-category-list">` untuk pill badges custom categories
    - _Requirements: 8.1, 8.5_

  - [x] 17.2 Extend RenderEngine with `renderCategoryDropdown()` and `renderCustomCategoryPills()`
    - Implement `renderCategoryDropdown()`: rebuild `<select#category>` options dari `CategoryStore.getAllWithDefaults()` — default categories duluan, lalu custom categories urut abjad
    - Implement `renderCustomCategoryPills()`: rebuild `#custom-category-list` DOM — satu `<span class="category-pill">` per custom category dengan tombol `<button class="remove-category-btn" data-category="...">×</button>` dan `aria-label`
    - Panggil kedua method ini dari `renderAll()`
    - _Requirements: 8.3, 8.5, 8.6_

  - [x] 17.3 Extend FormController with custom category event handlers
    - Handler untuk tombol `#add-category-btn`: toggle `#add-category-panel` hidden attribute
    - Handler untuk tombol `#confirm-category-btn`: ambil nilai `#new-category-input`, panggil `ValidatorModule.validateCategoryName()`, jika valid panggil `CategoryStore.add()` dan `renderAll()`, jika invalid tampilkan di `#category-error`
    - Handler untuk tombol `#cancel-category-btn`: sembunyikan panel dan clear input
    - Handler untuk `.remove-category-btn` via event delegation pada `#custom-category-list`: ambil `data-category`, cek `CategoryStore.getAffectedCount()`, jika > 0 tampilkan `window.confirm()` dengan jumlah transaksi terdampak, jika dikonfirmasi panggil `CategoryStore.remove()` lalu `renderAll()`
    - _Requirements: 8.1, 8.6, 8.9, 8.10_

  - [x] 17.4 Extend ChartModule to support dynamic colors for custom categories
    - Tambah konstanta `DEFAULT_COLORS = ['#FF6384', '#36A2EB', '#FFCE56']` untuk Food/Transport/Fun
    - Update `update(data)`: 3 label pertama pakai `DEFAULT_COLORS`, label tambahan (custom categories) pakai Chart.js default palette via index modulo
    - _Requirements: 8.4_

  - [ ]* 17.5 Write unit tests for CategoryStore cascade delete
    - Test `remove()` dengan kategori yang punya transaksi → semua transaksi terkait category-nya menjadi `""`
    - Test `remove()` dengan kategori tanpa transaksi → tidak ada perubahan transaksi
    - Test `getAffectedCount()` mengembalikan jumlah yang tepat
    - _Requirements: 8.9, 8.10_

- [ ] 18. Implement Monthly Summary — Transaction `createdAt` + TransactionStore extension + HTML + RenderEngine
  - [ ] 18.1 Add `createdAt` field to Transaction creation in TransactionStore
    - Update `TransactionStore.add(txData)`: inject `createdAt: Date.now()` sebelum push, field ini tidak boleh dioverride oleh input form
    - Update `StorageModule.read()`: saat parse data lama, inject fallback `createdAt: 0` menggunakan spread `{ createdAt: 0, ...tx }`
    - _Requirements: 9.1_

  - [ ] 18.2 Implement `getCurrentMonthTransactions()` and `getMonthlySummary()` in TransactionStore
    - Implement `getCurrentMonthTransactions()`: filter transaksi yang `new Date(tx.createdAt).getMonth() === now.getMonth() && new Date(tx.createdAt).getFullYear() === now.getFullYear()`; transaksi dengan `createdAt: 0` tidak termasuk
    - Implement `getMonthlySummary()`: hitung `total`, `count`, `average` (Math.round), dan `topCategory` dari `getCurrentMonthTransactions()`
    - Implement `resolveTopCategory(categoryTotals)` helper: priority order `['Food','Transport','Fun', ...CategoryStore.getAll()]`; jika tie, pilih yang paling awal dalam priority; kembalikan `"–"` jika tidak ada data
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.7_

  - [ ] 18.3 Add Monthly Summary HTML section to `index.html`
    - Sisipkan `<section id="monthly-summary" aria-label="Monthly Summary">` antara Total_Display dan data-section
    - Tambah 4 metric items: `#monthly-total`, `#monthly-count`, `#monthly-average`, `#monthly-top-category` dengan label dan value spans
    - _Requirements: 9.2_

  - [ ] 18.4 Implement `renderMonthlySummary()` in RenderEngine
    - Implement `renderMonthlySummary()`: ambil `TransactionStore.getMonthlySummary()`, update textContent pada keempat metric elements
    - Format `total` dan `average` dengan `formatCurrency()`, `count` sebagai string angka, `topCategory` langsung
    - Panggil method ini dari `renderAll()`
    - _Requirements: 9.2, 9.5, 9.6_

  - [ ]* 18.5 Write property test for monthly summary consistency (Property 15)
    - **Property 15: Monthly Summary Consistency**
    - **Validates: Requirements 9.2, 9.3, 9.4**
    - Generate `fc.array(arbitraryTransactionWithCreatedAt())` dengan berbagai timestamp
    - Assert `summary.total`, `summary.count`, `summary.average` konsisten satu sama lain dan hanya mencakup transaksi bulan berjalan

  - [ ]* 18.6 Write property test for monthly summary update on mutation (Property 16)
    - **Property 16: Monthly Summary Updates on Mutation**
    - **Validates: Requirements 9.6**
    - Generate initial transaction list + new current-month transaction dengan amount A
    - After `TransactionStore.add(newTx)`: assert `summary_after.total === summary_before.total + A` dan `summary_after.count === summary_before.count + 1`

- [ ] 19. Implement Budget Limit — BudgetStore + HTML + CSS + RenderEngine + FormController
  - [ ] 19.1 Create BudgetStore module
    - Tambah konstanta `BUDGET_KEY = 'expense_budget_limit'`
    - Implement `getLimit()`: return `currentLimit` (0 jika belum diset)
    - Implement `setLimit(value)`: set `currentLimit = value`, panggil `StorageModule.saveBudgetLimit(value)`
    - Implement `isSet()`: return `currentLimit > 0`
    - _Requirements: 10.1_

  - [ ] 19.2 Extend StorageModule with budget limit persistence
    - Implement `readBudgetLimit()`: `parseFloat(localStorage.getItem(BUDGET_KEY)) || 0`
    - Implement `saveBudgetLimit(val)`: `localStorage.setItem(BUDGET_KEY, val)`
    - _Requirements: 10.1_

  - [ ] 19.3 Extend ValidatorModule with `validateBudgetLimit()`
    - Implement `validateBudgetLimit(value)`: return error `"Budget limit must be a positive number"` jika `isNaN(value)`, `value <= 0`, atau negatif
    - _Requirements: 10.7_

  - [ ] 19.4 Add Budget Limit HTML elements and CSS state classes to `index.html` and `css/style.css`
    - Tambah di area `#total-display`: `#budget-input-area` dengan `label`, `#budget-limit-input` (type number), `#set-budget-btn`, `#budget-error`
    - Tambah `#budget-progress-container` (hidden awal) dengan `#budget-progress-bar` (role progressbar, aria attributes) dan `#budget-overflow-msg` (hidden awal)
    - Tambah CSS: `.state-green { background-color: #4CAF50; }`, `.state-yellow { background-color: #FFC107; }`, `.state-red { background-color: #F44336; }` pada `#budget-progress-bar`
    - _Requirements: 10.1, 10.2, 10.6_

  - [ ] 19.5 Implement `renderBudgetProgress()` in RenderEngine and wire to `renderAll()`
    - Implement `renderBudgetProgress()`: ambil `BudgetStore.getLimit()` dan total bulan ini dari `getCurrentMonthTransactions()`
    - Jika `limit === 0`: set `hidden` pada `#budget-progress-container`
    - Jika `limit > 0`: tampilkan container, set `width = Math.min((spent/limit)*100, 100)%`, set `aria-valuenow`, set class state (`state-green`/`state-yellow`/`state-red` via `getBudgetState(spent, limit)`)
    - Jika `spent >= limit`: tampilkan `#budget-overflow-msg` dengan teks `"Over budget by [formatCurrency(spent-limit)]"`, else sembunyikan
    - Implement helper `getBudgetState(spent, limit)`: return `'red'` jika pct >= 1, `'yellow'` jika pct >= 0.8, else `'green'`
    - Panggil `renderBudgetProgress()` dari `renderAll()`
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 19.6 Add FormController handler for budget limit input
    - Handler untuk tombol `#set-budget-btn`: ambil nilai `#budget-limit-input`, panggil `ValidatorModule.validateBudgetLimit()`, jika valid panggil `BudgetStore.setLimit()` dan `renderAll()`, jika invalid tampilkan di `#budget-error`
    - Budget yang sebelumnya valid tidak berubah jika input baru invalid
    - _Requirements: 10.1, 10.7_

  - [ ]* 19.7 Write property test for budget progress bar correctness (Property 17)
    - **Property 17: Budget Progress Bar Correctness**
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**
    - Generate `fc.tuple(fc.nat({min:1}), fc.nat({min:1}))` sebagai `[spent, limit]`
    - Assert width% === `Math.min((spent/limit)*100, 100)`, color class sesuai state, overflow message saat `spent >= limit`

- [ ] 20. Implement Dark/Light Mode Toggle — ThemeController + anti-FOUC inline script + HTML + CSS
  - [ ] 20.1 Add CSS variables for theming to `css/style.css`
    - Tambah blok `:root, [data-theme="light"]` dengan variabel: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--border-color`, `--accent-color`
    - Tambah blok `[data-theme="dark"]` dengan nilai warna dark theme untuk semua variabel yang sama
    - Tambah CSS transition global: `*, *::before, *::after { transition: background-color 250ms ease, color 250ms ease, border-color 250ms ease; }`
    - Update seluruh selector CSS yang menggunakan warna hardcoded agar menggunakan CSS variables
    - _Requirements: 11.2_

  - [ ] 20.2 Add anti-FOUC inline script to `<head>` in `index.html`
    - Tambah `<script>` inline di `<head>` (sebelum stylesheet atau setelah, tetapi sebelum `<body>`): baca `localStorage.getItem('expense_theme')`, parse JSON, cek `prefers-color-scheme`, set `document.documentElement.setAttribute('data-theme', theme)` sebelum render
    - Fallback chain: localStorage → `prefers-color-scheme: dark` → `"light"`
    - _Requirements: 11.4, 11.5_

  - [ ] 20.3 Add theme toggle button to header in `index.html`
    - Tambah `<button id="theme-toggle" aria-label="Toggle dark/light mode">🌙</button>` di dalam `<header>`
    - _Requirements: 11.1_

  - [ ] 20.4 Create ThemeController module in `js/app.js`
    - Implement `getTheme()`: baca dari localStorage (`JSON.parse`), fallback ke `prefers-color-scheme`, fallback ke `"light"`; tambah try/catch untuk corrupted localStorage
    - Implement `applyTheme(theme)`: set `document.documentElement.setAttribute('data-theme', theme)`, update `#theme-toggle` textContent ke `"🌙"` (light) atau `"☀️"` (dark), update `aria-label`
    - Implement `init()`: panggil `applyTheme(getTheme())` — sinkronkan icon setelah DOM ready
    - Implement `toggleTheme()`: flip tema, simpan ke localStorage via `JSON.stringify`, panggil `applyTheme()`
    - Tambah konstanta `THEME_KEY = 'expense_theme'`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ] 20.5 Wire ThemeController to DOM and initialization in `js/app.js`
    - Dalam `DOMContentLoaded` handler: panggil `ThemeController.init()`
    - Pasang event listener pada `#theme-toggle`: panggil `ThemeController.toggleTheme()` — tidak perlu `renderAll()` karena perubahan tema hanya CSS
    - Hydrate `CategoryStore` dari `StorageModule.readCustomCategories()` saat page load
    - Hydrate `BudgetStore` dari `StorageModule.readBudgetLimit()` saat page load
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 20.6 Write property test for theme preference round-trip (Property 18)
    - **Property 18: Theme Preference Round-Trip**
    - **Validates: Requirements 11.3, 11.4**
    - Generate `fc.constantFrom('light', 'dark')` sebagai input tema
    - Assert setelah `applyTheme(theme)` + `ThemeController.init()` (simulating reload): `document.documentElement.getAttribute('data-theme')` === stored theme, tanpa flash ke default terlebih dahulu

  - [ ]* 20.7 Write unit tests for ThemeController
    - Test defaults to `"light"` when no localStorage and no `prefers-color-scheme`
    - Test `toggleTheme()` switches from light → dark dan simpan ke localStorage
    - Test `applyTheme('light')` menampilkan icon 🌙, `applyTheme('dark')` menampilkan icon ☀️
    - _Requirements: 11.5, 11.6, 11.7_

- [ ] 21. Checkpoint - Verify extension features
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples, edge cases, and UI behavior
- The app requires no build tools or backend - simply open `index.html` in a browser
- Chart.js is loaded via CDN; all other code is self-contained in `js/app.js`
- All user input is rendered using `textContent` (not `innerHTML`) to prevent XSS vulnerabilities
- LocalStorage errors (quota exceeded, corrupted data) are handled gracefully with fallbacks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3.1", "4.1", "7.1"] },
    { "id": 2, "tasks": ["3.2", "4.2", "7.2", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "5.5", "8.1"] },
    { "id": 4, "tasks": ["8.2", "8.3", "9.1", "10.1"] },
    { "id": 5, "tasks": ["9.2", "10.2", "10.3", "11.1"] },
    { "id": 6, "tasks": ["11.2", "11.3", "11.4", "12.1"] },
    { "id": 7, "tasks": ["12.2", "13"] },
    { "id": 8, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 9, "tasks": ["16.1", "16.2", "16.3", "18.1", "19.1", "19.2", "19.3", "20.1", "20.2", "20.3"] },
    { "id": 10, "tasks": ["16.4", "18.2", "19.4", "20.4"] },
    { "id": 11, "tasks": ["17.1", "18.3", "19.5", "20.5"] },
    { "id": 12, "tasks": ["17.2", "17.4", "18.4", "19.6", "16.5", "16.6", "16.7"] },
    { "id": 13, "tasks": ["17.3", "17.5", "18.5", "18.6", "19.7", "20.6", "20.7"] }
  ]
}
```
