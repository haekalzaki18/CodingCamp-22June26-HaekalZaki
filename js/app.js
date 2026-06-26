// js/app.js — Expense & Budget Visualizer
// Modules are added incrementally across Tasks 3–12.

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'expense_transactions';
const CUSTOM_CATEGORIES_KEY = 'expense_custom_categories';

// ---------------------------------------------------------------------------
// StorageModule  (Task 3.1)
// Handles all interaction with browser localStorage.
//
// Traced requirements:
//   2.1 — Transaction saved to LocalStorage on successful submit
//   2.2 — Transactions read from LocalStorage on page load
//   2.3 — LocalStorage updated on delete
//   2.4 — Each transaction stored with id, itemName, amount, category
// ---------------------------------------------------------------------------

const StorageModule = {
  read() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      return raw.map(tx => ({ createdAt: 0, ...tx }));
    } catch (e) {
      console.error('Corrupted localStorage data, resetting:', e);
      return [];
    }
  },

  save(transactions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('Storage limit reached. Please delete some transactions.');
      }
      throw e;
    }
  },

  readCustomCategories() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY)) || [];
    } catch (e) {
      console.error('Corrupted custom categories data, resetting:', e);
      return [];
    }
  },

  saveCustomCategories(cats) {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats));
  },
};

// ---------------------------------------------------------------------------
// CategoryStore  (Task 16.1)
// ---------------------------------------------------------------------------

let customCategories = [];

const CategoryStore = {
  getAll() {
    return [...customCategories].sort();
  },

  getAllWithDefaults() {
    return ['Food', 'Transport', 'Fun', ...this.getAll()];
  },

  add(name) {
    customCategories.push(name.trim());
    StorageModule.saveCustomCategories(customCategories);
  },

  remove(name) {
    customCategories = customCategories.filter((c) => c !== name.trim());
    StorageModule.saveCustomCategories(customCategories);
    TransactionStore.recategorize(name, '');
  },

  has(name) {
    const lower = name.toLowerCase();
    const all = [...VALID_CATEGORIES, ...customCategories];
    return all.some((c) => c.toLowerCase() === lower);
  },

  getAffectedCount(name) {
    return TransactionStore.getAll().filter((tx) => tx.category === name).length;
  },
};

// ---------------------------------------------------------------------------
// ValidatorModule  (Task 4.1)
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];

const ValidatorModule = {
  validate(formData) {
    const errors = {};

    if (!formData.itemName || formData.itemName.trim() === '') {
      errors.itemName = 'Item name is required';
    }

    const parsedAmount = Number(formData.amount);
    if (formData.amount === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    const allowedCategories = CategoryStore.getAllWithDefaults();
    if (!formData.category || !allowedCategories.includes(formData.category)) {
      errors.category = 'Please select a category';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateCategoryName(name, existingCategories) {
    const errors = {};
    const trimmed = name.trim();

    if (trimmed.length < 1 || trimmed.length > 20) {
      errors.name = 'Category name must be 1-20 characters';
    } else {
      const allLower = [...VALID_CATEGORIES, ...existingCategories].map((c) => c.toLowerCase());
      if (allLower.includes(trimmed.toLowerCase())) {
        errors.name = 'Category already exists';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Validate a proposed budget limit value.
   *
   * Rules:
   *   - Must parse to a finite number
   *   - Must be strictly greater than zero (not NaN, not zero, not negative)
   *
   * Traced requirements:
   *   10.7 — Error "Budget limit must be a positive number" when invalid
   *
   * @param {string|number} value
   * @returns {{ valid: boolean, errors: { limit?: string } }}
   */
  validateBudgetLimit(value) {
    const errors = {};
    const parsed = Number(value);

    if (value === '' || isNaN(parsed) || parsed <= 0) {
      errors.limit = 'Budget limit must be a positive number';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// ---------------------------------------------------------------------------
// TransactionStore  (Task 5.1)
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

let transactions = [];

const TransactionStore = {
  getAll() {
    return transactions;
  },

  add(transaction) {
    const stamped = { ...transaction, createdAt: Date.now() };
    transactions.push(stamped);
    StorageModule.save(transactions);
    // Mark this transaction so RenderEngine plays a one-time entrance
    // animation on its row (extension: fade/slide-in on add).
    lastAddedTransactionId = stamped.id;
  },

  remove(id) {
    transactions = transactions.filter((tx) => tx.id !== id);
    StorageModule.save(transactions);
  },

  getTotalAmount() {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  },

  getByCategory() {
    return transactions.reduce((acc, tx) => {
      const key = tx.category;
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {});
  },

  recategorize(oldCategory, newCategory) {
    transactions = transactions.map((tx) =>
      tx.category === oldCategory ? { ...tx, category: newCategory } : tx
    );
    StorageModule.save(transactions);
  },

  getCurrentMonthTransactions() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions.filter((tx) => {
      if (!tx.createdAt) return false;
      const d = new Date(tx.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  },

  getMonthlySummary() {
    const monthly = this.getCurrentMonthTransactions();
    const count = monthly.length;
    const total = monthly.reduce((sum, tx) => sum + tx.amount, 0);
    const average = count === 0 ? 0 : Math.round(total / count);

    const categoryTotals = monthly.reduce((acc, tx) => {
      const key = tx.category;
      acc[key] = (acc[key] || 0) + tx.amount;
      return acc;
    }, {});

    const topCategory = resolveTopCategory(categoryTotals);

    return { total, count, average, topCategory };
  },
};

// ---------------------------------------------------------------------------
// Utility Functions  (Task 7.1)
// ---------------------------------------------------------------------------

function resolveTopCategory(categoryTotals) {
  const entries = Object.entries(categoryTotals).filter(([, v]) => v > 0);
  if (entries.length === 0) return '–';

  const maxTotal = Math.max(...entries.map(([, v]) => v));
  const tied = entries.filter(([, v]) => v === maxTotal).map(([k]) => k);
  if (tied.length === 1) return tied[0];

  const priority = ['Food', 'Transport', 'Fun', ...CategoryStore.getAll()];

  for (const cat of priority) {
    if (tied.includes(cat)) return cat;
  }

  return tied.sort()[0];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Search / Filter  (extension)
// In-memory search query for the transaction list. Matched against
// itemName and category, case-insensitive, on every render.
// ---------------------------------------------------------------------------

/** @type {string} */
let searchQuery = '';

/**
 * Return the current search query string.
 *
 * @returns {string}
 */
function getSearchQuery() {
  return searchQuery;
}

/**
 * Track the id of the most recently added transaction so RenderEngine
 * can apply a one-time entrance animation to that row.
 *
 * @type {string|null}
 */
let lastAddedTransactionId = null;

/**
 * Build the empty-state <li> shown in the transaction list.
 *
 * Two variants:
 *   - "no-data": no transactions exist at all yet (first-time use)
 *   - "no-results": transactions exist, but none match the search query
 *
 * @param {'no-data'|'no-results'} variant
 * @param {string} [query] - the active search query, used for "no-results" copy
 * @returns {HTMLLIElement}
 */
function buildEmptyState(variant, query) {
  const li = document.createElement('li');
  li.className = 'empty-state';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 64 64');
  icon.setAttribute('class', 'empty-state-icon');
  icon.setAttribute('aria-hidden', 'true');

  if (variant === 'no-results') {
    icon.innerHTML =
      '<circle cx="27" cy="27" r="16" fill="none" stroke="currentColor" stroke-width="3"/>' +
      '<line x1="38" y1="38" x2="52" y2="52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>';

    const title = document.createElement('p');
    title.className = 'empty-state-title';
    title.textContent = 'No matching transactions';

    const subtitle = document.createElement('p');
    subtitle.className = 'empty-state-subtitle';
    subtitle.textContent = query ? `Nothing found for "${query}"` : 'Try a different search term';

    li.appendChild(icon);
    li.appendChild(title);
    li.appendChild(subtitle);
    return li;
  }

  // "no-data" — wallet/receipt illustration
  icon.innerHTML =
    '<rect x="8" y="20" width="48" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>' +
    '<path d="M8 28h48" stroke="currentColor" stroke-width="3"/>' +
    '<circle cx="44" cy="36" r="4" fill="currentColor"/>' +
    '<path d="M20 12h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';

  const title = document.createElement('p');
  title.className = 'empty-state-title';
  title.textContent = 'No transactions yet';

  const subtitle = document.createElement('p');
  subtitle.className = 'empty-state-subtitle';
  subtitle.textContent = 'Catat pengeluaran pertamamu di form sebelah';

  li.appendChild(icon);
  li.appendChild(title);
  li.appendChild(subtitle);
  return li;
}

// ---------------------------------------------------------------------------
// CSV Export  (extension)
// Builds a CSV file from all current transactions and triggers a download.
// ---------------------------------------------------------------------------

/**
 * Escape a value for safe inclusion in a CSV field: wraps the value in
 * double quotes and doubles any internal quote characters.
 *
 * @param {string|number} value
 * @returns {string}
 */
function csvEscape(value) {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV string from the current transactions and trigger a
 * browser download named "transactions.csv".
 *
 * Columns: Item Name, Amount, Category, Date
 * Amount is exported as a raw number (no currency formatting) so the
 * file stays spreadsheet-friendly.
 *
 * @returns {void}
 */
function exportTransactionsToCSV() {
  const txns = TransactionStore.getAll();

  const header = ['Item Name', 'Amount', 'Category', 'Date'].map(csvEscape).join(',');

  const rows = txns.map((tx) => {
    const dateStr = tx.createdAt ? new Date(tx.createdAt).toISOString() : '';
    return [
      csvEscape(tx.itemName),
      csvEscape(tx.amount),
      csvEscape(tx.category === '' ? 'Uncategorized' : tx.category),
      csvEscape(dateStr),
    ].join(',');
  });

  const csvContent = [header, ...rows].join('\r\n');

  // Prepend a UTF-8 BOM so Excel renders accented/Indonesian characters correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// BudgetStore  (Task 19.1)
// In-memory store for the monthly budget limit. Hydrated from LocalStorage
// on page load. A limit of 0 means "not set".
//
// Traced requirements:
//   10.1 — Budget_Limit set via input, saved to key 'expense_budget_limit'
// ---------------------------------------------------------------------------

/** @type {number} */
let currentLimit = 0;

const BudgetStore = {
  /**
   * Return the currently configured budget limit (0 if unset).
   *
   * @returns {number}
   */
  getLimit() {
    return currentLimit;
  },

  /**
   * Set a new budget limit, updating in-memory state and persisting it.
   *
   * @param {number} value
   * @returns {void}
   */
  setLimit(value) {
    currentLimit = value;
    StorageModule.saveBudgetLimit(value);
  },

  /**
   * Whether a positive budget limit has been configured.
   *
   * @returns {boolean}
   */
  isSet() {
    return currentLimit > 0;
  },
};

// Extend StorageModule with budget limit persistence (Task 19.2)
// Traced requirements: 10.1
StorageModule.readBudgetLimit = function () {
  try {
    return parseFloat(localStorage.getItem('expense_budget_limit')) || 0;
  } catch (e) {
    console.error('Corrupted budget limit data, resetting:', e);
    return 0;
  }
};

StorageModule.saveBudgetLimit = function (val) {
  localStorage.setItem('expense_budget_limit', val);
};

/**
 * Determine the visual state of the budget progress bar based on
 * how much of the limit has been spent.
 *
 * Traced requirements:
 *   10.3 — Green when < 80%
 *   10.4 — Yellow when 80% (inclusive) to < 100%
 *   10.5 — Red when >= 100%
 *
 * @param {number} spent
 * @param {number} limit
 * @returns {'green'|'yellow'|'red'}
 */
function getBudgetState(spent, limit) {
  if (limit <= 0) return 'green';
  const pct = spent / limit;
  if (pct >= 1) return 'red';
  if (pct >= 0.8) return 'yellow';
  return 'green';
}

// ---------------------------------------------------------------------------
// ThemeController  (Task 20.4)
// Manages dark/light theme: reading preference, applying it to the DOM,
// persisting changes, and toggling between the two states.
//
// Traced requirements:
//   11.1 — Theme_Toggle button switches between light and dark
//   11.2 — CSS transition applied on theme change
//   11.3 — Preference saved to key 'expense_theme'
//   11.4 — Preference applied before first render (anti-FOUC, see index.html)
//   11.5 — Fallback chain: localStorage → prefers-color-scheme → light
//   11.6 — Moon icon shown while light theme is active
//   11.7 — Sun icon shown while dark theme is active
// ---------------------------------------------------------------------------

const THEME_KEY = 'expense_theme';

const ThemeController = {
  /**
   * Resolve the active theme using the fallback chain:
   *   1. A valid value already stored in localStorage
   *   2. The OS-level `prefers-color-scheme: dark` media query
   *   3. "light" as the final default
   *
   * @returns {'light'|'dark'}
   */
  getTheme() {
    try {
      const stored = JSON.parse(localStorage.getItem(THEME_KEY));
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      // Corrupted value — fall through to system preference
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  },

  /**
   * Apply the given theme to the document and sync the toggle button's
   * icon + aria-label to match the active state.
   *
   * @param {'light'|'dark'} theme
   * @returns {void}
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  },

  /**
   * Initialize the theme on page load. The `<head>` inline script has
   * already set `data-theme` before first paint (anti-FOUC); this just
   * syncs the toggle button icon to match once the DOM is ready.
   *
   * @returns {void}
   */
  init() {
    this.applyTheme(this.getTheme());
  },

  /**
   * Flip the active theme, persist the new value, and re-apply it.
   *
   * @returns {void}
   */
  toggleTheme() {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to persist theme preference:', e);
    }
    this.applyTheme(next);
  },
};

// ---------------------------------------------------------------------------
// RenderEngine  (Task 8.1)
// ---------------------------------------------------------------------------

const RenderEngine = {
  /**
   * Render the transaction list, optionally filtered by the current
   * search query (matched against itemName and category, case-insensitive).
   *
   * Newly-added transactions get a `.entering` class for a fade/slide-in
   * animation (see css/style.css §20). Each category badge gets a
   * `data-category` attribute so CSS can color custom categories too,
   * not just the three defaults.
   *
   * @returns {void}
   */
  renderTransactionList() {
    const listElement = document.getElementById('transaction-list');
    const allTxns = TransactionStore.getAll();
    const query = (typeof getSearchQuery === 'function' ? getSearchQuery() : '').trim().toLowerCase();

    const txns = query
      ? allTxns.filter((tx) =>
          tx.itemName.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query)
        )
      : allTxns;

    listElement.innerHTML = '';

    if (allTxns.length === 0) {
      listElement.appendChild(buildEmptyState('no-data'));
      return;
    }

    if (txns.length === 0) {
      listElement.appendChild(buildEmptyState('no-results', query));
      return;
    }

    txns.forEach((tx) => {
      const li = document.createElement('li');
      li.className = 'transaction-item';
      if (lastAddedTransactionId && tx.id === lastAddedTransactionId) {
        li.classList.add('entering');
      }

      const itemNameSpan = document.createElement('span');
      itemNameSpan.className = 'item-name';
      itemNameSpan.textContent = tx.itemName;

      const amountSpan = document.createElement('span');
      amountSpan.className = 'item-amount';
      amountSpan.textContent = formatCurrency(tx.amount);

      const categorySpan = document.createElement('span');
      categorySpan.className = 'item-category';
      categorySpan.textContent = tx.category === '' ? 'Uncategorized' : tx.category;
      categorySpan.setAttribute('data-category', tx.category);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('data-id', tx.id);
      deleteBtn.setAttribute('aria-label', `Delete ${tx.itemName}`);

      li.appendChild(itemNameSpan);
      li.appendChild(amountSpan);
      li.appendChild(categorySpan);
      li.appendChild(deleteBtn);

      listElement.appendChild(li);
    });

    // Clear the "just added" marker after one render pass so the
    // animation only plays once, right after the transaction is created.
    lastAddedTransactionId = null;
  },

  renderTotalDisplay() {
    const totalElement = document.getElementById('total-amount');
    const total = TransactionStore.getTotalAmount();
    totalElement.textContent = formatCurrency(total);
  },

  renderCategoryDropdown() {
    const select = document.getElementById('category');
    if (!select) return;

    const previousValue = select.value;

    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Select Category --';
    select.appendChild(placeholder);

    CategoryStore.getAllWithDefaults().forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });

    if (previousValue && CategoryStore.getAllWithDefaults().includes(previousValue)) {
      select.value = previousValue;
    }
  },

  renderCustomCategoryPills() {
    const container = document.getElementById('custom-category-list');
    if (!container) return;

    container.innerHTML = '';

    CategoryStore.getAll().forEach((cat) => {
      const pill = document.createElement('span');
      pill.className = 'category-pill';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'pill-name';
      nameSpan.textContent = cat;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-category-btn';
      removeBtn.type = 'button';
      removeBtn.setAttribute('data-category', cat);
      removeBtn.setAttribute('aria-label', `Remove category ${cat}`);
      removeBtn.textContent = '×';

      pill.appendChild(nameSpan);
      pill.appendChild(removeBtn);
      container.appendChild(pill);
    });
  },

  renderMonthlySummary() {
    const { total, count, average, topCategory } = TransactionStore.getMonthlySummary();

    const elTotal = document.getElementById('monthly-total');
    const elCount = document.getElementById('monthly-count');
    const elAverage = document.getElementById('monthly-average');
    const elTopCategory = document.getElementById('monthly-top-category');

    if (elTotal) elTotal.textContent = formatCurrency(total);
    if (elCount) elCount.textContent = String(count);
    if (elAverage) elAverage.textContent = formatCurrency(average);
    if (elTopCategory) elTopCategory.textContent = topCategory;
  },

  /**
   * Update the budget progress bar based on the current month's spending
   * against the configured Budget_Limit.
   *
   * Behavior:
   *   - limit === 0 (unset): hide the progress bar container entirely
   *   - limit > 0: show the bar, set width% capped at 100, set the
   *     color-state class (green/yellow/red), update aria-valuenow
   *   - spent >= limit: show the "Over budget by [amount]" message
   *
   * Traced requirements:
   *   10.2 — Progress bar width reflects percentage of limit spent
   *   10.3 — Green when < 80%
   *   10.4 — Yellow when 80–99%
   *   10.5 — Red + overflow message when >= 100%
   *   10.6 — Hidden entirely when limit is unset or zero
   *
   * @returns {void}
   */
  renderBudgetProgress() {
    const container = document.getElementById('budget-progress-container');
    const bar = document.getElementById('budget-progress-bar');
    const overflowMsg = document.getElementById('budget-overflow-msg');
    if (!container || !bar) return;

    const limit = BudgetStore.getLimit();

    if (!limit || limit <= 0) {
      container.hidden = true;
      return;
    }

    container.hidden = false;

    const spent = TransactionStore.getMonthlySummary().total;
    const pct = Math.min((spent / limit) * 100, 100);
    const state = getBudgetState(spent, limit);

    bar.style.width = `${pct}%`;
    bar.classList.remove('state-green', 'state-yellow', 'state-red');
    bar.classList.add(`state-${state}`);
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');

    if (overflowMsg) {
      if (spent >= limit) {
        overflowMsg.hidden = false;
        overflowMsg.textContent = `Over budget by ${formatCurrency(spent - limit)}`;
      } else {
        overflowMsg.hidden = true;
        overflowMsg.textContent = '';
      }
    }
  },

  renderAll() {
    this.renderTransactionList();
    this.renderTotalDisplay();
    this.renderMonthlySummary();
    this.renderBudgetProgress();

    if (typeof ChartModule !== 'undefined' && ChartModule.update) {
      ChartModule.update(TransactionStore.getByCategory());
    }

    this.renderCategoryDropdown();
    this.renderCustomCategoryPills();
  },
};

// ---------------------------------------------------------------------------
// ChartModule  (Task 9.1)
// ---------------------------------------------------------------------------

let chartInstance = null;

const DEFAULT_CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];
const EXTENDED_CHART_COLORS = ['#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7CFC00', '#FF69B4'];

const ChartModule = {
  init(canvasId) {
    try {
      if (typeof Chart === 'undefined') {
        console.error('Chart.js failed to load');
        return;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error(`Canvas element #${canvasId} not found`);
        return;
      }

      const ctx = canvas.getContext('2d');

      chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Food', 'Transport', 'Fun'],
          datasets: [{
            data: [0, 0, 0],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (e) {
      console.error('Chart initialization failed:', e);
    }
  },

  update(categoryData) {
    if (!chartInstance) {
      console.warn('Chart instance not initialized. Call init() first.');
      return;
    }

    try {
      const labels = [];
      const values = [];

      Object.entries(categoryData).forEach(([key, amount]) => {
        if (amount > 0) {
          labels.push(key === '' ? 'Uncategorized' : key);
          values.push(amount);
        }
      });

      const colors = labels.map((_, index) => {
        if (index < DEFAULT_CHART_COLORS.length) {
          return DEFAULT_CHART_COLORS[index];
        }
        return EXTENDED_CHART_COLORS[(index - DEFAULT_CHART_COLORS.length) % EXTENDED_CHART_COLORS.length];
      });

      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = values;
      chartInstance.data.datasets[0].backgroundColor = colors;
      chartInstance.update();

      const overlay = document.querySelector('.chart-overlay');
      if (overlay) {
        const hasData = values.length > 0;
        overlay.textContent = hasData ? '' : 'No data';
      }
    } catch (e) {
      console.error('Chart update failed:', e);
    }
  }
};

// ---------------------------------------------------------------------------
// FormController  (Task 10.1)
// ---------------------------------------------------------------------------

const FormController = {
  init() {
    const form = document.getElementById('transaction-form');
    if (!form) {
      console.error('FormController: #transaction-form element not found');
      return;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = {
        itemName: form.elements['itemName'].value,
        amount: form.elements['amount'].value,
        category: form.elements['category'].value,
      };

      const { valid, errors } = ValidatorModule.validate(formData);

      if (valid) {
        const transaction = {
          id: generateId(),
          itemName: formData.itemName.trim(),
          amount: Number(formData.amount),
          category: formData.category,
        };

        TransactionStore.add(transaction);
        this.resetFields();
        this.clearErrors();
        RenderEngine.renderAll();
      } else {
        this.showErrors(errors);
      }
    });

    // ------------------------------------------------------------------
    // Custom Category Handlers (Requirement 8)
    // ------------------------------------------------------------------

    const addCategoryBtn   = document.getElementById('add-category-btn');
    const addCategoryPanel = document.getElementById('add-category-panel');
    const newCategoryInput = document.getElementById('new-category-input');
    const confirmCategoryBtn = document.getElementById('confirm-category-btn');
    const cancelCategoryBtn  = document.getElementById('cancel-category-btn');
    const categoryError    = document.getElementById('category-error');

    if (addCategoryBtn && addCategoryPanel && newCategoryInput) {
      addCategoryBtn.addEventListener('click', () => {
        const isHidden = addCategoryPanel.hidden;
        addCategoryPanel.hidden = !isHidden;
        if (!addCategoryPanel.hidden) {
          newCategoryInput.focus();
        }
      });
    }

    if (confirmCategoryBtn && newCategoryInput && addCategoryPanel && categoryError) {
      confirmCategoryBtn.addEventListener('click', () => {
        const name = newCategoryInput.value;
        const result = ValidatorModule.validateCategoryName(name, CategoryStore.getAll());

        if (result.valid) {
          CategoryStore.add(name);
          newCategoryInput.value = '';
          addCategoryPanel.hidden = true;
          categoryError.textContent = '';
          RenderEngine.renderAll();
        } else {
          categoryError.textContent = result.errors.name;
        }
      });
    }

    if (cancelCategoryBtn && addCategoryPanel && newCategoryInput && categoryError) {
      cancelCategoryBtn.addEventListener('click', () => {
        addCategoryPanel.hidden = true;
        newCategoryInput.value = '';
        categoryError.textContent = '';
      });
    }

    const customCategoryList = document.getElementById('custom-category-list');
    if (customCategoryList) {
      customCategoryList.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('.remove-category-btn');
        if (!removeBtn) return;

        const categoryName = removeBtn.getAttribute('data-category');
        if (!categoryName) return;

        const count = CategoryStore.getAffectedCount(categoryName);

        if (count > 0) {
          const confirmed = window.confirm(
            `Remove category "${categoryName}"? This will uncategorize ${count} transaction(s).`
          );
          if (confirmed) {
            CategoryStore.remove(categoryName);
            RenderEngine.renderAll();
          }
        } else {
          CategoryStore.remove(categoryName);
          RenderEngine.renderAll();
        }
      });
    }

    // ------------------------------------------------------------------
    // Budget Limit Handler (Requirement 10 / Task 19.6)
    // ------------------------------------------------------------------

    const setBudgetBtn = document.getElementById('set-budget-btn');
    const budgetLimitInput = document.getElementById('budget-limit-input');
    const budgetError = document.getElementById('budget-error');

    if (setBudgetBtn && budgetLimitInput && budgetError) {
      setBudgetBtn.addEventListener('click', () => {
        const value = budgetLimitInput.value;
        const result = ValidatorModule.validateBudgetLimit(value);

        if (result.valid) {
          BudgetStore.setLimit(Number(value));
          budgetError.textContent = '';
          RenderEngine.renderAll();
        } else {
          // Previously-valid limit (if any) is left untouched.
          budgetError.textContent = result.errors.limit;
        }
      });
    }
  },

  showErrors(errors) {
    const errorContainer = document.querySelector('.error-messages');
    if (!errorContainer) return;

    errorContainer.innerHTML = '';

    Object.values(errors).forEach((message) => {
      const p = document.createElement('p');
      p.className = 'error-message';
      p.textContent = message;
      errorContainer.appendChild(p);
    });
  },

  clearErrors() {
    const errorContainer = document.querySelector('.error-messages');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  },

  resetFields() {
    const form = document.getElementById('transaction-form');
    if (form) {
      form.reset();
    }
  },
};

// ---------------------------------------------------------------------------
// DeleteButtonController (Task 11.1)
// ---------------------------------------------------------------------------

const DeleteButtonController = {
  init() {
    const listElement = document.getElementById('transaction-list');
    if (!listElement) {
      console.error('DeleteButtonController: #transaction-list element not found');
      return;
    }

    listElement.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('.delete-btn');
      if (!deleteBtn) return;

      const transactionId = deleteBtn.getAttribute('data-id');
      if (!transactionId) {
        console.error('Delete button missing data-id attribute');
        return;
      }

      // Play a slide-out animation on the row before mutating state, so
      // the removal feels intentional rather than an instant disappearance.
      // Respects prefers-reduced-motion via the CSS rule in style.css §20.
      const row = deleteBtn.closest('.transaction-item');
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const finishDelete = () => {
        TransactionStore.remove(transactionId);
        RenderEngine.renderAll();
      };

      if (row && !prefersReducedMotion) {
        row.classList.add('leaving');
        row.addEventListener('animationend', finishDelete, { once: true });
      } else {
        finishDelete();
      }
    });
  }
};

// ---------------------------------------------------------------------------
// SearchController  (extension)
// Wires the search input to filter the transaction list live, and the
// clear (×) button to reset it.
// ---------------------------------------------------------------------------

const SearchController = {
  init() {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    if (!input) return;

    input.addEventListener('input', () => {
      searchQuery = input.value;
      if (clearBtn) clearBtn.hidden = searchQuery.length === 0;
      RenderEngine.renderTransactionList();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchQuery = '';
        input.value = '';
        clearBtn.hidden = true;
        input.focus();
        RenderEngine.renderTransactionList();
      });
    }
  },
};

// ---------------------------------------------------------------------------
// App Initialization  (Task 12.1, extended by Task 19.5 / 20.5)
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Hydrate TransactionStore from localStorage.
  transactions = StorageModule.read();

  // 1b. Hydrate customCategories from localStorage.
  customCategories = StorageModule.readCustomCategories();

  // 1c. Hydrate BudgetStore from localStorage (Task 20.5).
  currentLimit = StorageModule.readBudgetLimit();

  // 2. Initialize the Chart.js pie chart on the #expense-chart canvas.
  ChartModule.init('expense-chart');

  // 3. Wire up the form submit handler (incl. category + budget handlers).
  FormController.init();

  // 4. Attach delete button event delegation to #transaction-list.
  DeleteButtonController.init();

  // 4b. Wire up the search input (extension).
  SearchController.init();

  // 4c. Wire up the CSV export button (extension).
  const exportBtn = document.getElementById('export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportTransactionsToCSV);
  }

  // 5. Initialize theme toggle button icon/state (data-theme already set
  //    by the anti-FOUC inline script in <head> before this point).
  ThemeController.init();
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      ThemeController.toggleTheme();
    });
  }

  // 6. Render the initial state: transaction list, total display, chart,
  //    monthly summary, and budget progress.
  RenderEngine.renderAll();
});