import {
  type Component,
  type JSX,
  createContext,
  useContext,
  createSignal,
} from 'solid-js';

// has a default value of '', which should in theory never be used, and might cause invisible bugs
const SchemaPathContext = createContext(createSignal('unreachable'));

export const SchemaPath: Component<{ children: JSX.Element }> = (props) => {
  const schemaPath = createSignal('');

  return (
    <SchemaPathContext.Provider value={schemaPath}>
      {props.children}
    </SchemaPathContext.Provider>
  );
};

export const useSchemaPathContext = () => useContext(SchemaPathContext);
