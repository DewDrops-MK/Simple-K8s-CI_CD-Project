const express = require('express');
const systemInfo = require('./system-info');

const app = express();

// Existing endpoint
app.get('/', (req, res) => {
  res.send('Hello, Kubernetes CI/CD!');
});

// JSON API endpoint for runtime and infrastructure information
app.get('/info', (req, res) => {
  const info = systemInfo.getAllInfo();
  res.json(info);
});

// HTML endpoint for visualizing runtime and infrastructure information
app.get('/info/html', (req, res) => {
  const info = systemInfo.getAllInfo();
  const html = generateInfoHTML(info);
  res.type('text/html').send(html);
});

/**
 * Generates HTML representation of system information
 */
function generateInfoHTML(info) {
  const { application, kubernetes, system, timestamp } = info;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Runtime & Infrastructure Info</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }
    .card h2 {
      color: #667eea;
      margin-bottom: 20px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      font-size: 1.3em;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #333;
      flex: 0 0 40%;
    }
    .info-value {
      color: #666;
      word-break: break-all;
      text-align: right;
      flex: 1;
      padding-left: 10px;
    }
    .info-value.na {
      color: #999;
      font-style: italic;
    }
    .timestamp {
      text-align: center;
      color: #999;
      font-size: 0.9em;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Runtime & Infrastructure Information</h1>
      <p>Kubernetes-aware System Information Dashboard</p>
    </div>

    <div class="info-grid">
      <!-- Application Information -->
      <div class="card">
        <h2>📱 Application</h2>
        ${renderInfoItems({
          'Application Name': application.name,
          'Version': application.version,
          'Node.js Version': application.nodeVersion,
          'Process ID': application.processId,
          'Uptime': formatApplicationUptime(application.uptimeSeconds),
          'Environment': application.environment,
        })}
      </div>

      <!-- Kubernetes Information -->
      <div class="card">
        <h2>☸️ Kubernetes / Pod</h2>
        ${renderInfoItems({
          'Pod Name': kubernetes.podName,
          'Pod IP': kubernetes.podIP,
          'Namespace': kubernetes.namespace,
          'Container Name': kubernetes.containerName,
          'Container ID': kubernetes.containerID,
          'Node Name': kubernetes.nodeName,
          'Service Name': kubernetes.serviceName,
        })}
      </div>

      <!-- System Information -->
      <div class="card">
        <h2>🖥️ System / Host</h2>
        ${renderInfoItems({
          'Hostname': system.hostname,
          'OS Type': system.osType,
          'OS Version': system.osVersion,
          'Kernel Version': system.kernelVersion,
          'Architecture': system.architecture,
          'CPU Model': system.cpuModel,
          'CPU Cores': system.cpuCount,
        })}
      </div>

      <!-- Memory Information -->
      <div class="card">
        <h2>💾 Memory</h2>
        ${renderInfoItems({
          'Total Memory': system.memoryTotal,
          'Used Memory': system.memoryUsed,
          'Free Memory': system.memoryFree,
          'Memory Usage': system.memoryUsagePercent + '%',
          'System Uptime': system.uptime,
        })}
      </div>
    </div>

    <div class="timestamp">
      <strong>Captured at:</strong> ${timestamp}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Helper function to render info items as HTML
 */
function renderInfoItems(items) {
  return Object.entries(items)
    .map(([label, value]) => {
      const isNA = value === 'N/A';
      return `
    <div class="info-item">
      <span class="info-label">${label}</span>
      <span class="info-value ${isNA ? 'na' : ''}">${value}</span>
    </div>
      `;
    })
    .join('');
}

/**
 * Format application uptime in human-readable format
 */
function formatApplicationUptime(seconds) {
  const parts = [];
  const units = [
    { label: 'd', value: 86400 },
    { label: 'h', value: 3600 },
    { label: 'm', value: 60 },
    { label: 's', value: 1 },
  ];

  for (const unit of units) {
    if (seconds >= unit.value) {
      const count = Math.floor(seconds / unit.value);
      parts.push(`${count}${unit.label}`);
      seconds %= unit.value;
      if (parts.length >= 2) break;
    }
  }

  return parts.length > 0 ? parts.join(' ') : '0s';
}

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly, not when imported for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
