// Regla hecha a mano: en los componentes de React, la forma de un objeto
// (las props, el estado...) se declara con `interface`, nunca con `type`.
//
//   type Props = { id: string }          ❌  → interface Props { id: string }
//   type Clase = 'Super' | 'Sports'      ✅  (una unión no se puede escribir con interface)
//
// ESLint recorre el árbol del código (AST) y llama a cada función con el nodo
// de ese tipo. Para ver los nodos de cualquier código: https://typescript-eslint.io/play

export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'Las formas de objeto se declaran con interface en los componentes de React' },
    messages: {
      usaInterface:
        'En los componentes de React, «{{nombre}}» se declara con `interface {{nombre}} { … }`, no con `type`. ' +
        'Es una regla del equipo: mira eslint/propsConInterface.js.',
    },
    schema: [],
  },
  create(context) {
    if (!context.filename.endsWith('.tsx')) return {}
    return {
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation.type !== 'TSTypeLiteral') return
        context.report({ node: node.id, messageId: 'usaInterface', data: { nombre: node.id.name } })
      },
    }
  },
}
