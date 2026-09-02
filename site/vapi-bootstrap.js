import VapiModule from '/vendor/vapi-web.local.mjs';

const Vapi = [
  VapiModule,
  VapiModule?.default,
  VapiModule?.default?.default,
].find(candidate => typeof candidate === 'function');

if (typeof Vapi === 'function') {
  window.BrightSmileVapi = Vapi;
  window.dispatchEvent(new Event('brightsmile-vapi-ready'));
} else {
  console.error('BrightSmile Vapi SDK loaded without a usable constructor.');
  window.dispatchEvent(new CustomEvent('brightsmile-vapi-error', {
    detail: { code: 'invalid_sdk_export' },
  }));
}
