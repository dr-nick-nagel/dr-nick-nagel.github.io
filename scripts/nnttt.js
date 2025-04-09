const CORS_PROXY = 'https://corsproxy.io/?';

const FRED_ENDPOINT = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&observation_start=2018-01-01&api_key=41f7817003ff5f360181380ae4ea4388&file_type=json` ;
const FRED_PROXY_URL = `${CORS_PROXY}${FRED_ENDPOINT}`;

/**
 * Fetch the CPI (Consumer Price Index). 
 * 
 * Uses CORS proxy to circumvent browser's cross origin restriction.
 * 
 * @returns CPI data as JSON obj ... 
 */
async function fetchCPI() {
    const endpoint = FRED_PROXY_URL;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data.observations
      .filter(d => d.value !== '.')
      .map(d => ({ date: d.date, value: parseFloat(d.value) }));
}


/**
 * Render the CPI Chart 
 * 
 * Note that data range from Jan 2018 to present...
 * 
 */
async function renderCpiChart() {
    const cpiData = await fetchCPI();
    const ctx = document.getElementById('cpiChart').getContext('2d');
    const dataset = cpiData.map(d => ({
        x: d.date,
        y: d.value
      }));

    new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'CPI (US)',
            data: dataset,
            borderColor: 'red',
            fill: false,
            pointRadius: 0,
            tension: 0.1
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                parser: 'yyyy-MM-dd',
                tooltipFormat: 'LLL yyyy',
                unit: 'month',
                displayFormats: {
                  month: 'LLL yyyy'
                }
              },
              title: { display: true, text: 'Date' }
            },
            y: {
              title: { display: true, text: 'Index Value' }
            }
          }
        }
      });

  }

/**
 * Fetch time series for market index given:
 * 
 * @param {*} symbol The market symbol for DJI S&P or NASDAQ
 * 
 * @returns JSON data for series starting at `observation_start`
 */
  async function fetchMarketIndex( symbol ) {
    let query = CORS_PROXY;
    query += 'https://api.stlouisfed.org/fred/series/observations';
    query += `?series_id=${symbol}`;
    query += `&api_key=41f7817003ff5f360181380ae4ea4388`;
    query += `&file_type=json`;
    query += `&observation_start=2018-01-01`;

    try {
      const response = await fetch(query);
      const data = await response.json();
  
      if (!data || !data.observations) {
        throw new Error('No FRED data.');
      }
      // Filter out any non-numeric values (e.g., ".")
      return data.observations
        .filter(d => !isNaN(parseFloat(d.value)))
        .map(d => ({
          x: d.date,
          y: parseFloat(d.value)
        }));
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * RENDER THE CHART FOR A GIVEN MARKET
   * 
   * 
   * @param {*} canvasId 
   * @param {*} label 
   * @param {*} data 
   * @param {*} color 
   */
  function renderMarketChart(canvasId, label, data, color = 'green') {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: label,
          data: data,
          borderColor: color,
          fill: false,
          pointRadius: 0,
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month'
            },
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Closing Price' }
          }
        }
      }
    });
  }


  
const marketSymbols = {
    DJI:    "DJIA",
    SnP:    "SP500",
    NASDAQ: "NASDAQCOM"
};



/**
 * Render charts to track market trends over time starting 
 * back in 2018 ...
 */
async function renderMarketCharts() {
    // const djiData = await fetchMarketIndex( marketSymbols.DJI );
    // renderMarketChart('djiChart', 'Dow Jones Industrial Avg', djiData, 'blue');
    const sp500Data = await fetchMarketIndex(marketSymbols.SnP);
    renderMarketChart('snpChart', 'S&P 500', sp500Data, 'blue');
    // const nasdaqData = await fetchMarketIndex('NASDAQCOM');
    // renderMarketChart('nasdaqChart', 'NASDAQ Composite', nasdaqData, 'green');
}


async function fetchGDP() {

    let query = CORS_PROXY;
    query += 'https://api.stlouisfed.org/fred/series/observations';
    query += `?series_id=GDPC1`;
    query += `&api_key=41f7817003ff5f360181380ae4ea4388`;
    query += `&file_type=json`;
    query += `&observation_start=2018-01-01`;

    const response = await fetch( query );
    const data = await response.json();
  
    // Extract date and value pairs
    return data.observations
      .filter(obs => obs.value !== '.')
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value)
      }));
  }

  async function renderGDPChart() {
    const gdpData = await fetchGDP();
    const labels = gdpData.map(d => d.date);
    const values = gdpData.map(d => d.value);
  
    const ctx = document.getElementById('gdpChart').getContext('2d');
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Real GDP (Chained 2017 Dollars)',
          data: values,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.1)',
          pointRadius: 4,
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              tooltipFormat: 'MMM yyyy',
              displayFormats: {
                month: 'MMM yyyy'
              }
            },
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Billions of Chained 2017 Dollars' }
          }
        }
      }
    });
  }
  
  



async function init() {
    await renderCpiChart();
    await renderMarketCharts();
    await renderGDPChart();
}

document.addEventListener(
    'DOMContentLoaded',
    async () => {
        await init();


        let gdpData = await fetchGDP();
        console.log( gdpData );

    }
);

