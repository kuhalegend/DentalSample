import VapiModule from '/vendor/vapi-web.local.mjs';

const Vapi = [
  VapiModule,
  VapiModule?.default,
  VapiModule?.default?.default,
].find(candidate => typeof candidate === 'function');

if (typeof Vapi === 'function') {
  window.CleggsLaneVapi = Vapi;
  window.dispatchEvent(new Event('cleggs-lane-vapi-ready'));
} else {
  console.error('Cleggs Lane Vapi SDK loaded without a usable constructor.');
  window.dispatchEvent(new CustomEvent('cleggs-lane-vapi-error', {
    detail: { code: 'invalid_sdk_export' },
  }));
}
