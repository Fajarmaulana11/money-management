-- ============================================================
-- DEV-ONLY seed data. Run manually against a dev project after
-- creating a real auth user (e.g. via Supabase Studio) and
-- replacing :demo_user_id below with that user's UUID.
-- Never run this against production.
-- ============================================================

-- Example:
-- \set demo_user_id '00000000-0000-0000-0000-000000000000'

insert into accounts (user_id, name, type, balance, icon, color) values
  (:'demo_user_id', 'BCA', 'bank', 7500000, 'landmark', '#2563EB'),
  (:'demo_user_id', 'Cash', 'cash', 1200000, 'banknote', '#10B981'),
  (:'demo_user_id', 'DANA', 'ewallet', 500000, 'wallet', '#0EA5E9');

insert into transactions (user_id, account_id, category_id, type, amount, description, transaction_date)
select :'demo_user_id', a.id, c.id, 'income', 8000000, 'Gaji bulanan', current_date - interval '5 days'
from accounts a, categories c
where a.user_id = :'demo_user_id' and a.name = 'BCA' and c.name = 'Gaji' and c.type = 'income'
limit 1;

insert into transactions (user_id, account_id, category_id, type, amount, description, transaction_date)
select :'demo_user_id', a.id, c.id, 'expense', 150000, 'Makan siang', current_date - interval '1 days'
from accounts a, categories c
where a.user_id = :'demo_user_id' and a.name = 'Cash' and c.name = 'Makanan & Minuman' and c.type = 'expense'
limit 1;

insert into financial_goals (user_id, name, target_amount, current_amount, description, color, icon) values
  (:'demo_user_id', 'Dana Darurat', 20000000, 12500000, 'Target 6x pengeluaran bulanan', '#10B981', 'shield');
