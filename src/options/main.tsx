import { render } from 'solid-js/web'

import './index.css'

import { SchemaPath } from './schema-path'

import Options from './options'

const element = document.getElementById('app')

if (element == null) {
  throw new Error('No app element found')
}

render(
  () => (
    <SchemaPath>
      <Options />
    </SchemaPath>
  ),
  element
)
