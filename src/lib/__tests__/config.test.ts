import { describe, it, expect, beforeEach, vi } from 'vitest';

import { config, logger } from '../config';

describe('config', () => {
  it('should have default API URL', () => {
    expect(config.apiUrl).toBeDefined();
    expect(typeof config.apiUrl).toBe('string');
  });

  it('should have app name', () => {
    expect(config.appName).toBeDefined();
    expect(typeof config.appName).toBe('string');
  });

  it('should have app version', () => {
    expect(config.appVersion).toBeDefined();
    expect(typeof config.appVersion).toBe('string');
  });

  it('should have keycloak configuration', () => {
    expect(config.keycloak).toBeDefined();
    expect(config.keycloak.url).toBeDefined();
    expect(config.keycloak.realm).toBeDefined();
    expect(config.keycloak.clientId).toBeDefined();
  });

  it('should have feature flags', () => {
    expect(config.features).toBeDefined();
    expect(typeof config.features.debug).toBe('boolean');
    expect(typeof config.features.mockData).toBe('boolean');
    expect(typeof config.features.devtools).toBe('boolean');
  });

  it('should have session configuration', () => {
    expect(config.session).toBeDefined();
    expect(typeof config.session.timeout).toBe('number');
    expect(typeof config.session.warningBeforeTimeout).toBe('number');
    expect(config.session.timeout).toBeGreaterThan(0);
    expect(config.session.warningBeforeTimeout).toBeGreaterThan(0);
  });

  it('should have log level', () => {
    expect(config.logLevel).toBeDefined();
    expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel);
  });

  it('should have environment flags', () => {
    expect(typeof config.isDevelopment).toBe('boolean');
    expect(typeof config.isStaging).toBe('boolean');
    expect(typeof config.isProduction).toBe('boolean');
  });
});

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function');
    expect(() => { logger.debug("test message"); }).not.toThrow();
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
    logger.info('test message');
    expect(() => { logger.debug("test message"); }).not.toThrow();
  });

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
    logger.warn('test message');
    expect(() => { logger.debug("test message"); }).not.toThrow();
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
    logger.error('test message');
    expect(() => { logger.debug("test message"); }).not.toThrow();
  });

  it('should accept multiple arguments', () => {
    logger.debug('message', { key: 'value' }, 123);
    logger.info('message', { key: 'value' }, 123);
    logger.warn('message', { key: 'value' }, 123);
    logger.error('message', { key: 'value' }, 123);
    expect(true).toBe(true); // Just verify no errors thrown
  });
});
