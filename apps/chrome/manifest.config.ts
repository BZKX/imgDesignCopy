import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'PromptLens',
  version: pkg.version,
  description: pkg.description,
  minimum_chrome_version: '120',
  permissions: ['activeTab', 'storage', 'scripting'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_title: 'PromptLens · 点击展开面板',
  },
  options_page: 'src/options/index.html',
  content_scripts: [
    {
      js: ['src/content/index.ts'],
      matches: ['http://*/*', 'https://*/*', 'file:///*'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  commands: {
    'start-selection': {
      suggested_key: {
        default: 'Ctrl+Shift+Y',
        mac: 'Command+Shift+Y',
      },
      description: 'Start image selection',
    },
  },
  icons: {},
});
