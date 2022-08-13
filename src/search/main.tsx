import { render } from 'solid-js/web';
import { Search }  from './search';

import './index.css';

const element = document.getElementById('app');
if (!element) {
  throw new Error('No app element found');
}

render(() => <Search />, element);
