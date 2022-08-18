import { type Component } from 'solid-js';
import { type JSX } from 'solid-js';

import styles from './index.module.css';

const Entry: Component<{ children: JSX.Element; remove: () => void }> = (
  props
) => {
  // should include elements to delete the element, as well as editing the element
  return (
    <div class={styles.entry}>
      <button onClick={props.remove}>x</button>
      {/* should either be a folder or a url, allowing either clicks or input */}
      <div>{props.children}</div>
    </div>
  );
};

export default Entry;
