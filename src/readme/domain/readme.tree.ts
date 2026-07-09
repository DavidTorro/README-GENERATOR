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

// Una línea dibujada + la ruta del nodo (para buscar su comentario)
interface TreeLine {
  text: string;
  path: string;
}

// Dibuja un nivel del árbol y recursa en los hijos
function renderNode(node: TreeNode, prefix: string, parentPath: string): TreeLine[] {
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
    const path = parentPath === "" ? name : `${parentPath}/${name}`;
    const label = children.size > 0 ? `${name}/` : name;
    return [{ text: prefix + connector + label, path }, ...renderNode(children, childPrefix, path)];
  });
}

// API pública: nombre + rutas → árbol en texto
// Con comments (ruta → comentario), añade "# ..." alineado en columna
export function buildTree(
  rootName: string,
  files: string[],
  comments: Record<string, string> = {},
): string {
  const root: TreeNode = new Map();
  for (const file of files) insertPath(root, file);
  const lines: TreeLine[] = [{ text: `${rootName}/`, path: "" }, ...renderNode(root, "", "")];

  if (!lines.some((line) => comments[line.path])) {
    return lines.map((line) => line.text).join("\n");
  }
  const width = Math.max(...lines.map((line) => line.text.length));
  return lines
    .map((line) => {
      const comment = comments[line.path];
      return comment ? `${line.text.padEnd(width)}  # ${comment}` : line.text;
    })
    .join("\n");
}