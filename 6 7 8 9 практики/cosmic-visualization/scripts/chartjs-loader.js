// Chart.js CDN loader
(function(){
  if (!window.Chart) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
      document.dispatchEvent(new Event('ChartJSLoaded'));
    };
    document.head.appendChild(script);
  } else {
    document.dispatchEvent(new Event('ChartJSLoaded'));
  }
})();
