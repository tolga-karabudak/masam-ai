const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://vifhqbciymkfioqixfph.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpZmhxYmNpeW1rZmlvcWl4ZnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODA0MDYsImV4cCI6MjA4Nzg1NjQwNn0.jXrkmvfy22h8cgs7BsM41X-LgFciJfv1Wi5Ws0fBnm0'
);

async function main() {
  // Check available products
  const { data, error } = await s
    .from('wraith_products')
    .select('id, category, model, available, price')
    .eq('available', true);

  if (error) {
    console.log('ERROR:', error);
    return;
  }

  const cats = {};
  let withPrice = 0;
  for (const p of data || []) {
    cats[p.category] = (cats[p.category] || 0) + 1;
    if (p.price > 0) withPrice++;
  }
  console.log('Categories with available=true:', JSON.stringify(cats, null, 2));
  console.log('Total available:', (data || []).length);
  console.log('With price > 0:', withPrice);

  // Also check RLS - try without available filter
  const { data: all, error: err2 } = await s
    .from('wraith_products')
    .select('id, category, available')
    .limit(5);

  if (err2) {
    console.log('RLS ERROR (no filter):', err2);
  } else {
    console.log('Sample without filter:', JSON.stringify(all, null, 2));
  }
}

main();
