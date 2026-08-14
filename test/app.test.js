const request = require('supertest');
const app = require('../app');

describe('App Tests', () => {
  it('should return Hello, Kubernetes CI/CD! from root route', async () => {
    const res = await request(app).get('/');
    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    if (res.text !== 'Hello, Kubernetes CI/CD!') {
      throw new Error(`Expected text "Hello, Kubernetes CI/CD!", got "${res.text}"`);
    }
  });

  describe('GET /info', () => {
    it('should return JSON with system information', async () => {
      const res = await request(app).get('/info');
      if (res.status !== 200) {
        throw new Error(`Expected status 200, got ${res.status}`);
      }
      if (res.body.application === undefined) {
        throw new Error('Missing application property');
      }
      if (res.body.kubernetes === undefined) {
        throw new Error('Missing kubernetes property');
      }
      if (res.body.system === undefined) {
        throw new Error('Missing system property');
      }
      if (res.body.timestamp === undefined) {
        throw new Error('Missing timestamp property');
      }
    });

    it('should contain application information', async () => {
      const res = await request(app).get('/info');
      const { application } = res.body;
      const requiredFields = ['name', 'version', 'nodeVersion', 'processId', 'uptimeSeconds', 'environment'];
      for (const field of requiredFields) {
        if (application[field] === undefined) {
          throw new Error(`Missing application.${field}`);
        }
      }
      if (typeof application.processId !== 'number') {
        throw new Error('application.processId should be a number');
      }
    });

    it('should contain Kubernetes information', async () => {
      const res = await request(app).get('/info');
      const { kubernetes } = res.body;
      const requiredFields = ['podName', 'podIP', 'namespace', 'containerName', 'containerID', 'nodeName', 'serviceName'];
      for (const field of requiredFields) {
        if (kubernetes[field] === undefined) {
          throw new Error(`Missing kubernetes.${field}`);
        }
      }
    });

    it('should contain system information', async () => {
      const res = await request(app).get('/info');
      const { system } = res.body;
      const requiredFields = ['hostname', 'osType', 'osVersion', 'kernelVersion', 'architecture', 'cpuCount', 'cpuModel', 'memoryTotal', 'memoryFree', 'memoryUsed', 'memoryUsagePercent'];
      for (const field of requiredFields) {
        if (system[field] === undefined) {
          throw new Error(`Missing system.${field}`);
        }
      }
      if (typeof system.cpuCount !== 'number') {
        throw new Error('system.cpuCount should be a number');
      }
      if (system.cpuCount <= 0) {
        throw new Error('system.cpuCount should be greater than 0');
      }
    });
  });

  describe('GET /info/html', () => {
    it('should return HTML content', async () => {
      const res = await request(app).get('/info/html');
      if (res.status !== 200) {
        throw new Error(`Expected status 200, got ${res.status}`);
      }
      if (!res.type || !res.type.includes('text/html')) {
        throw new Error(`Expected content-type text/html, got ${res.type}`);
      }
      if (!res.text.includes('<!DOCTYPE html>')) {
        throw new Error('Response should include <!DOCTYPE html>');
      }
      if (!res.text.includes('Runtime & Infrastructure Information')) {
        throw new Error('Response should include "Runtime & Infrastructure Information"');
      }
    });

    it('should display application section in HTML', async () => {
      const res = await request(app).get('/info/html');
      if (!res.text.includes('Application')) {
        throw new Error('Response should include "Application"');
      }
      if (!res.text.includes('Version')) {
        throw new Error('Response should include "Version"');
      }
      if (!res.text.includes('Node.js Version')) {
        throw new Error('Response should include "Node.js Version"');
      }
    });

    it('should display Kubernetes section in HTML', async () => {
      const res = await request(app).get('/info/html');
      if (!res.text.includes('Kubernetes')) {
        throw new Error('Response should include "Kubernetes"');
      }
      if (!res.text.includes('Pod Name')) {
        throw new Error('Response should include "Pod Name"');
      }
      if (!res.text.includes('Pod IP')) {
        throw new Error('Response should include "Pod IP"');
      }
      if (!res.text.includes('Namespace')) {
        throw new Error('Response should include "Namespace"');
      }
    });

    it('should display System section in HTML', async () => {
      const res = await request(app).get('/info/html');
      if (!res.text.includes('System')) {
        throw new Error('Response should include "System"');
      }
      if (!res.text.includes('Hostname')) {
        throw new Error('Response should include "Hostname"');
      }
      if (!res.text.includes('Memory')) {
        throw new Error('Response should include "Memory"');
      }
    });
  });
});

