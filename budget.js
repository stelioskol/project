const form = document.getElementById('entryForm');
const typeSelect = document.getElementById('type');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const entryList = document.getElementById('entryList');
const balanceSpan = document.getElementById('balance');

let entries = JSON.parse(localStorage.getItem('budgetEntries')) || [];

const categories = {
  income: ['Γονείς', 'Εργασία', 'Άλλο'],
  expense: ['Σπίτι', 'Σούπερ Μάρκετ', 'Έξοδος', 'Ταξίδια', 'Άλλο']
};

function updateCategoryOptions(type) {
  categorySelect.innerHTML = '<option value="">--Επέλεξε--</option>';
  categories[type].forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

typeSelect.addEventListener('change', () => {
  updateCategoryOptions(typeSelect.value);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const type = typeSelect.value;
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if (amount <= 0) return alert('Το ποσό πρέπει να είναι θετικό.');
  if (!category) return alert('Πρέπει να επιλέξεις κατηγορία.');

  entries.push({ type, amount, category });
  localStorage.setItem('budgetEntries', JSON.stringify(entries));
  form.reset();
  updateCategoryOptions(typeSelect.value);
  updateUI();
  updateChart();
});

function updateUI() {
  entryList.innerHTML = '';
  let balance = 0;

  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `[${entry.category}] ${entry.amount.toFixed(2)} €`;
    li.style.color = entry.type === 'expense' ? 'red' : 'green';

    // Δημιουργία κουμπιού διαγραφής
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.marginLeft = '6px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '12px';

    deleteBtn.addEventListener('click', () => {
      entries.splice(index, 1);
      localStorage.setItem('budgetEntries', JSON.stringify(entries));
      updateUI();
      updateChart();
    });

    li.appendChild(deleteBtn);
    entryList.appendChild(li);

    balance += entry.type === 'income' ? entry.amount : -entry.amount;
  });

  balanceSpan.textContent = balance.toFixed(2);
}

// Πίτα: έξοδα ανά κατηγορία
const ctx = document.getElementById('expenseChart').getContext('2d');
let expenseChart;

function updateChart() {
  const categoryTotals = {};

  entries.forEach(entry => {
    if (entry.type === 'expense') {
      if (!categoryTotals[entry.category]) {
        categoryTotals[entry.category] = 0;
      }
      categoryTotals[entry.category] += entry.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Έξοδα ανά κατηγορία',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}

// Αρχική εκκίνηση
updateCategoryOptions(typeSelect.value);
updateUI();
updateChart();
