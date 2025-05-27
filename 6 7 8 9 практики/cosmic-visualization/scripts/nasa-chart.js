// Chart.js dynamic NASA data chart and interactive filtering/sorting
(function(){
  function renderChart(data, labels) {
    var ctx = document.getElementById('nasaDataChart').getContext('2d');
    if (window.nasaChart) window.nasaChart.destroy();
    window.nasaChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Кількість обʼєктів',
            data: data,
            backgroundColor: [
              '#ffd600cc', '#64b5f6cc', '#43a047cc'
            ],
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#232b4d',
            hoverBackgroundColor: [
              '#ffd600', '#64b5f6', '#43a047'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64b5f6', font: { size: 16, weight: 'bold' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#232b4d22' },
            ticks: { color: '#ffd600', font: { size: 14 } }
          }
        }
      }
    });
  }

  function getData(sortBy) {
    // Дані з data-dashboard
    var raw = [
      { label: 'Наднові', value: 247 },
      { label: 'Чорні діри', value: 63 },
      { label: 'Нейтронні зірки', value: 3200 }
    ];
    if (sortBy === 'desc') raw.sort((a,b)=>b.value-a.value);
    if (sortBy === 'asc') raw.sort((a,b)=>a.value-b.value);
    return raw;
  }

  function updateChart(sortBy) {
    var data = getData(sortBy);
    renderChart(data.map(d=>d.value), data.map(d=>d.label));
  }

  // Додаємо фільтри/сортування
  function addControls() {
    var container = document.querySelector('.data-dashboard');
    if (!container) return;
    var controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'flex-end';
    controls.style.gap = '12px';
    controls.style.margin = '18px 0 0 0';
    controls.innerHTML = `
      <button class="control-btn" id="sortAsc" style="font-size:1em;">Сортувати ↑</button>
      <button class="control-btn" id="sortDesc" style="font-size:1em;">Сортувати ↓</button>
      <button class="control-btn" id="sortDefault" style="font-size:1em;">За замовчуванням</button>
    `;
    container.insertBefore(controls, container.querySelector('.data-grid'));
    document.getElementById('sortAsc').onclick = ()=>updateChart('asc');
    document.getElementById('sortDesc').onclick = ()=>updateChart('desc');
    document.getElementById('sortDefault').onclick = ()=>updateChart();
  }

  document.addEventListener('ChartJSLoaded', function() {
    addControls();
    updateChart();
  });
})();
