import { type Component } from 'solid-js';
import { type JSX } from 'solid-js';

import styles from './index.module.css';

import { TiDelete } from 'solid-icons/ti';

const Entry: Component<{ children: JSX.Element; remove: () => void }> = (
  props
) => {
  // should include elements to delete the element, as well as editing the element
  return (
    <div class={styles.entry}>
      <button onClick={props.remove}>
        <TiDelete size={24} />
      </button>
      {/* should either be a folder or a url, allowing either clicks or input */}
      <div class={styles.entryContent}>{props.children}</div>
    </div>
  );
};

export default Entry;
