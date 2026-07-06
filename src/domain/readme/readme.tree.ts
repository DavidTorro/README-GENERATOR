// Convierte la lista plana de rutas en un árbol dibujado

// Un nodo = mapa nombre → hijos (mapa vacío = fichero)
type TreeNode = Map<string, TreeNode>;

// Inserta una ruta ("src/domain/x.ts") creando los nodos intermedios
function insertPath(root: TreeNode, path: string): void {
  let node = root;
  for (const part of path.split("/")) {
    let child = node.get(part);
    if (!child) {
      child = new Map();
      node.set(part, child);
    }
    node = child;
  }
}

// Dibuja un nivel del árbol y recursa en los hijos
function renderNode(node: TreeNode, prefix: string): string[] {
  const entries = [...node.entries()].sort(([aName, aChildren], [bName, bChildren]) => {
    const aIsDir = aChildren.size > 0;
    const bIsDir = bChildren.size > 0;
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1; // carpetas primero
    return aName.localeCompare(bName);
  });
  return entries.flatMap(([name, children], i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");
    const label = children.size > 0 ? `${name}/` : name;
    return [prefix + connector + label, ...renderNode(children, childPrefix)];
  });
}

// API pública: nombre del proyecto + rutas relativas → árbol en texto
export function buildTree(rootName: string, files: string[]): string {
  const root: TreeNode = new Map();
  for (const file of files) insertPath(root, file);
  return [`${rootName}/`, ...renderNode(root, "")].join("\n");
}