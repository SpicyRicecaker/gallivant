import { type Component, type JSX } from 'solid-js'

import styles from './index.module.scss'

import { TiDelete } from 'solid-icons/ti'
import { BiRegularArrowFromBottom, BiRegularArrowFromTop } from 'solid-icons/bi'

const Entry: Component<{
  children: JSX.Element
  remove: () => void
  moveUp: () => void
  moveDown: () => void
}> = (props) => {
  // should include elements to delete the element, as well as editing the element
  return (
    <div class={styles.entry}>
      <div class={styles.controls}>
        <button onClick={props.moveUp}>
          <BiRegularArrowFromBottom size={24} />
        </button>
        <button onClick={props.remove} class={styles.remove}>
          <TiDelete size={24} />
        </button>
        <button onClick={props.moveDown}>
          <BiRegularArrowFromTop size={24} />
        </button>
      </div>
      {/* should either be a folder or a url, allowing either clicks or input */}
      <div class={styles.entryContent}>{props.children}</div>
    </div>
  )
}

export default Entry
