export const charts = {

  chart1: {
    type: 'line',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 10,
          top: 10,
          bottom: 5
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            display: false,
            beginAtZero: false
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
            display: false
          },
          ticks: {
            beginAtZero: false,
            display: false,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#000080',
        tooltipFontSize: 10
      }
    },
    data: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [{
        data: [65, 59, 84, 84, 51, 55, 40],
        borderColor: '#fff',
        backgroundColor: 'rgba(0,0,0,0.0)',
        pointBackgroundColor: '#1600e0',
        pointRadius: 4,
        borderWidth: 1
      }]
    }
  },

  chart2: {
    type: 'line',
    data: {
      labels: [1500, 1600, 1700, 1750, 1800, 1850, 1900],
      datasets: [{ 
          data: [86, 114, 106, 106, 107, 111, 133],
          tension: 0.0,
          borderColor: '#fff',
          backgroundColor: 'rgba(0,0,0,0)',
          pointBackgroundColor: '#148AFF',
          pointRadius: 4,
          borderWidth: 1
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 10,
          top: 10,
          bottom: 5
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            display: false,
            beginAtZero: false
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
            display: false
          },
          ticks: {
            beginAtZero: false,
            display: false,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#000080',
        tooltipFontSize: 10
      }
    }
  },

  chart3: {
    type: 'line',
    data: {
      labels: [1500, 1600, 1700, 1750, 1800, 1850, 1900],
      datasets: [{ 
          data: [86, 114, 106, 106, 107, 111, 133],
          borderColor: '#fff',
          backgroundColor: '#FABD42',
          borderWidth: 1,
          pointRadius: 4
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: -20,
          left: -20
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            display: false,
            beginAtZero: false
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
            display: false
          },
          ticks: {
            beginAtZero: false,
            display: false,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#000080',
        tooltipFontSize: 10
      }
    }
  },

  chart4: {
    type: 'bar',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: -20,
          left: 0,
          right: 15
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            drawBorder: false,
            display: false,
          },
          ticks: {
            display: false,
            beginAtZero: false
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: false,
            display: false
          },
          ticks: {
            beginAtZero: false,
            display: false,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#000080',
        tooltipFontSize: 10
      }
    },
    data: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [{
        data: [65, 59, 84, 84, 51, 55],
        borderColor: '#fff',
        backgroundColor: '#E97474',
        pointBackgroundColor: '#1600e0',
        borderWidth: 1
      }]
    }
  },

  chart5: {
    type: 'line',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 10,
          left: 10,
          right: 20,
          top: 10
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            drawBorder: true,
            display: true,
          },
          ticks: {
            display: true,
            beginAtZero: false
          }
        }],
        yAxes: [{
          gridLines: {
            drawBorder: true,
            display: true
          },
          ticks: {
            beginAtZero: false,
            display: true,
          }
        }]
      },
      tooltips: {
        backgroundColor: '#000080',
        tooltipFontSize: 10
      }
    },
    data: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [
        {
          data: [65, 0, 150, 100, 10, 55],
          borderColor: '#2FB85D',
          backgroundColor: 'rgba(0,0,0,0)',
          pointBackgroundColor: '#1600e0',
          pointRadius: 0,
          borderWidth: 2
        },
        { 
          data: [86, 114, 10, 106, 200, 111],
          tension: 0.0,
          borderColor: '#3399FF',
          backgroundColor: '#EDEFF1',
          pointBackgroundColor: '#148AFF',
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    }
  },
};
