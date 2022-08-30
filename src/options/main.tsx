import { render } from 'solid-js/web';

import './index.css';

import { SchemaPath } from './schema-path';

const element = document.getElementById('app');

if (!element) {
  throw new Error('No app element found');
}

import Options from './options';

render(
  () => (
    <SchemaPath>
      <Options />
    </SchemaPath>
  ),
  element
);
