import { type JSXElement, type Component } from 'solid-js'

import styles from './index.module.scss'

import { BiRegularArrowBack } from 'solid-icons/bi'
import { AiOutlinePlusCircle } from 'solid-icons/ai'

import { useSchemaPathContext } from './schema-path'

// Represents a search schema. When clicked, reveals all urls in it.
const Entries: Component<{ children: JSXElement, add: () => void }> = (
  props
) => {
  const [schemaPath, setSchemaPath] = useSchemaPathContext()

  return (
    <div class={styles.entriesPage}>
      <div class={styles.entriesBar}>
        <button
          class={schemaPath().length === 0 ? styles.nopacity : ''}
          onClick={() => setSchemaPath('')}
        >
          <BiRegularArrowBack size={24} />
        </button>
        <div>SearchSchemas/{schemaPath()}</div>
      </div>
      <div class={styles.entries}>{props.children}</div>
      <button
        onClick={() => {
          props.add()
        }}
      >
        <AiOutlinePlusCircle size={24} />
      </button>
    </div>
  )
}

export default Entries
