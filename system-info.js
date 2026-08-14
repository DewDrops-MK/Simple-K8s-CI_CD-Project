const os = require('os');
const fs = require('fs');
const path = require('path');

// Track application start time
const APP_START_TIME = Date.now();

/**
 * Gets application-level information
 */
function getApplicationInfo() {
  return {
    name: process.env.APP_NAME || 'simple-k8s-ci_cd-project',
    version: process.env.APP_VERSION || '1.0.0',
    nodeVersion: process.version,
    processId: process.pid,
    uptimeSeconds: Math.floor((Date.now() - APP_START_TIME) / 1000),
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Gets Kubernetes-related information from environment variables
 * (Uses Kubernetes Downward API)
 */
function getKubernetesInfo() {
  return {
    podName: process.env.POD_NAME || process.env.HOSTNAME || 'N/A',
    podIP: process.env.POD_IP || 'N/A',
    namespace: process.env.POD_NAMESPACE || 'N/A',
    containerName: process.env.CONTAINER_NAME || process.env.HOSTNAME || 'N/A',
    containerID: process.env.CONTAINER_ID || 'N/A',
    nodeName: process.env.NODE_NAME || 'N/A',
    serviceName: process.env.SERVICE_NAME || 'N/A',
  };
}

/**
 * Gets VM/Host system information
 */
function getSystemInfo() {
  const osType = os.type();
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  // Try to read kernel version (Linux-specific)
  let kernelVersion = 'N/A';
  try {
    if (osType === 'Linux' && fs.existsSync('/proc/version')) {
      const procVersion = fs.readFileSync('/proc/version', 'utf8');
      const match = procVersion.match(/version\s+([\d.]+)/);
      kernelVersion = match ? match[1] : 'N/A';
    }
  } catch (err) {
    // Silently fail if unable to read kernel version
  }

  return {
    hostname: os.hostname(),
    osType: osType,
    osVersion: getOSVersion(),
    kernelVersion: kernelVersion,
    architecture: os.arch(),
    cpuCount: cpus.length,
    cpuModel: cpus.length > 0 ? cpus[0].model : 'N/A',
    memoryTotal: formatBytes(totalMemory),
    memoryTotalBytes: totalMemory,
    memoryFree: formatBytes(freeMemory),
    memoryFreeBytes: freeMemory,
    memoryUsed: formatBytes(usedMemory),
    memoryUsedBytes: usedMemory,
    memoryUsagePercent: ((usedMemory / totalMemory) * 100).toFixed(2),
    uptime: formatUptime(os.uptime()),
    uptimeSeconds: Math.floor(os.uptime()),
  };
}

/**
 * Gets OS version information
 */
function getOSVersion() {
  const osType = os.type();
  const release = os.release();

  if (osType === 'Darwin') {
    return `macOS ${release}`;
  } else if (osType === 'Linux') {
    return `Linux ${release}`;
  } else if (osType === 'Windows_NT') {
    return `Windows ${release}`;
  }
  return release;
}

/**
 * Formats bytes into human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats uptime into human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Gets all system information combined
 */
function getAllInfo() {
  return {
    application: getApplicationInfo(),
    kubernetes: getKubernetesInfo(),
    system: getSystemInfo(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getApplicationInfo,
  getKubernetesInfo,
  getSystemInfo,
  getAllInfo,
  formatBytes,
  formatUptime,
};
