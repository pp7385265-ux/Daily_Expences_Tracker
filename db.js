/* ══════════════════════════════════════
   db.js — In-Memory Database
   Sab data yahan store hota hai
══════════════════════════════════════ */

const GRADS = [
  'linear-gradient(135deg,#7c3aed,#db2777)',
  'linear-gradient(135deg,#0891b2,#7c3aed)',
  'linear-gradient(135deg,#059669,#0891b2)',
  'linear-gradient(135deg,#d97706,#db2777)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#10b981,#f59e0b)',
];

const CAT_COLORS = {
  'Food & Dining':   '#7c3aed',
  'Transport':       '#0891b2',
  'Shopping':        '#d97706',
  'Bills & Utilities':'#059669',
  'Medical':         '#ef4444',
  'Entertainment':   '#db2777',
  'Education':       '#8b5cf6',
  'Rent & Housing':  '#14b8a6',
  'Personal Care':   '#f97316',
  'Other':           '#6b7280',
};

const CAT_ICONS = {
  'Food & Dining':   '🍽️',
  'Transport':       '🚗',
  'Shopping':        '🛍️',
  'Bills & Utilities':'💡',
  'Medical':         '💊',
  'Entertainment':   '🎬',
  'Education':       '📚',
  'Rent & Housing':  '🏠',
  'Personal Care':   '💅',
  'Other':           '📦',
};

const MODE_COLORS = {
  'Cash':        '#10b981',
  'UPI':         '#7c3aed',
  'Card':        '#d97706',
  'Net Banking': '#0891b2',
  'Cheque':      '#8b5cf6',
  'Wallet':      '#db2777',
};

const CATS  = Object.keys(CAT_COLORS);
const MODES = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Wallet'];

/* ── DATABASE ── */
const DB = {
  users: [
    {
      id: 1, name: 'John Doe', email: 'john@example.com',
      username: 'john', password: '1234', phone: '9876543210',
      joinDate: '2024-01-01', bio: 'Tracking every penny! 💪',
      avatar: null, bannerImg: null, bannerGrad: 0
    },
    {
      id: 2, name: 'Admin User', email: 'admin@example.com',
      username: 'admin', password: 'admin123', phone: '',
      joinDate: '2024-01-01', bio: '',
      avatar: null, bannerImg: null, bannerGrad: 1
    }
  ],
  expenses: [
    { id:1, userId:1, amount:45.50,  category:'Food & Dining',    description:'Lunch at cafe',        date:'2025-05-08', mode:'UPI' },
    { id:2, userId:1, amount:120.00, category:'Transport',         description:'Uber ride to office',  date:'2025-05-08', mode:'Card' },
    { id:3, userId:1, amount:899.00, category:'Shopping',          description:'New shoes',             date:'2025-05-07', mode:'Card' },
    { id:4, userId:1, amount:299.00, category:'Bills & Utilities', description:'Electricity bill',     date:'2025-05-06', mode:'Net Banking' },
    { id:5, userId:1, amount:55.00,  category:'Food & Dining',    description:'Coffee & snacks',      date:'2025-05-05', mode:'Cash' },
    { id:6, userId:1, amount:1500.0, category:'Rent & Housing',   description:'Apartment rent',       date:'2025-05-04', mode:'Net Banking' },
    { id:7, userId:1, amount:200.00, category:'Entertainment',    description:'Movie tickets',         date:'2025-05-03', mode:'UPI' },
    { id:8, userId:1, amount:350.00, category:'Medical',          description:'Pharmacy',              date:'2025-05-02', mode:'Cash' },
  ],
  ledger: [
    { id:1, userId:1, type:'lent',     name:'Rahul Sharma', amount:500,  date:'2025-05-05', note:'Dinner split', settled:false },
    { id:2, userId:1, type:'borrowed', name:'Amit Kumar',   amount:1000, date:'2025-05-03', note:'Emergency',    settled:false },
    { id:3, userId:1, type:'lent',     name:'Priya Singh',  amount:200,  date:'2025-04-30', note:'Cab fare',     settled:true  },
    { id:4, userId:1, type:'borrowed', name:'Neha Gupta',   amount:300,  date:'2025-04-28', note:'Grocery',      settled:true  },
  ],
  budgets: [
    { id:1, userId:1, category:'Food & Dining', limit:3000 },
    { id:2, userId:1, category:'Transport',      limit:2000 },
    { id:3, userId:1, category:'Shopping',       limit:5000 },
  ],
};

let nextId = { exp: 9, led: 5, usr: 3 };

/* ── HELPERS ── */
const fmt     = n => '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 });
const today   = () => new Date().toISOString().split('T')[0];
const initials= name => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const sum     = (arr, key) => arr.reduce((s, e) => s + (key ? e[key] : e), 0);

function catTotals(exps) {
  const c = {};
  exps.forEach(e => c[e.category] = (c[e.category] || 0) + e.amount);
  return c;
}

function userExp()  { return DB.expenses.filter(e => e.userId === currentUser.id); }
function userLed()  { return DB.ledger.filter(l => l.userId === currentUser.id); }
function userBud()  { return DB.budgets.filter(b => b.userId === currentUser.id); }

/* currentUser — set on login */
let currentUser = null;