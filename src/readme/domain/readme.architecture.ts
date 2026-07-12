import type {
  ProjectInfo,
  Architecture,
  ArchitectureComponent,
} from "../../project/domain/project.interfaces.js";
import { buildMermaid, type MermaidEdge, type MermaidNode, type MermaidSpec } from "./readme.mermaid.js";

const SRC_PREFIX = "src/";
// Profundidad de carpeta que cuenta como "componente": src/ai/infrastructure/x.ts → "ai/infrastructure"
const COMPONENT_DEPTH = 2;

// Rol de cada capa/carpeta: verdades ESTRUCTURALES de la arquitectura, no texto inventado
const LAYER_ROLE: Record<string, string> = {
  domain: "Entities, types and pure business logic",
  application: "Use cases orchestrating the domain",
  infrastructure: "Adapters to the outside world (fs, HTTP…)",
  cli: "Command-line parsing and help",
  main: "Composition root — wires every layer",
};

// Fichero fuente → su componente (carpeta, hasta COMPONENT_DEPTH niveles bajo src/) y su módulo
// (1er nivel). Un fichero suelto en la raíz de src/ (main.ts) es un actor sin módulo.
function componentOf(file: string): { comp: string; group: string | null } | null {
  if (!file.startsWith(SRC_PREFIX)) return null;
  const dir = file.slice(SRC_PREFIX.length).split("/").slice(0, -1);
  if (dir.length === 0) return { comp: "main", group: null };
  return { comp: dir.slice(0, COMPONENT_DEPTH).join("/"), group: dir[0] ?? null };
}

const labelOf = (comp: string): string => comp.split("/").pop() ?? comp;

// Construye el diagrama de arquitectura desde los IMPORTS REALES del proyecto.
// 100% determinista: no puede alucinar, a diferencia de pedírselo a la IA.
export function buildArchitecture(info: ProjectInfo): Architecture | null {
  // 1. Descubre componentes: agrupados por módulo, o sueltos (actores)
  const groups = new Map<string, Set<string>>(); // módulo → componentes
  const actors = new Set<string>(); // componentes sin módulo (main)
  const groupOf = new Map<string, string | null>(); // componente → su módulo
  for (const file of info.files) {
    const c = componentOf(file);
    if (!c) continue;
    groupOf.set(c.comp, c.group);
    if (c.group === null) {
      actors.add(c.comp);
    } else {
      const set = groups.get(c.group) ?? new Set<string>();
      set.add(c.comp);
      groups.set(c.group, set);
    }
  }

  // 2. Aristas entre componentes (deduplicadas, sin bucles a sí mismo)
  const edgeKeys = new Set<string>();
  const edges: MermaidEdge[] = [];
  for (const [file, targets] of Object.entries(info.imports)) {
    const from = componentOf(file);
    if (!from) continue;
    for (const target of targets) {
      const to = componentOf(target);
      if (!to || to.comp === from.comp) continue;
      const key = `${from.comp}->${to.comp}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      edges.push({ from: from.comp, to: to.comp });
    }
  }

  // Listón: sin varios componentes y varias conexiones no hay arquitectura que contar
  if (groupOf.size < 3 || edges.length < 2) return null;

  // 3. MermaidSpec: un subgrafo por módulo; los actores, sueltos
  const subgraphs = [...groups.entries()].map(([group, comps]) => ({
    title: group,
    nodes: [...comps].sort().map((comp): MermaidNode => ({ id: comp, label: labelOf(comp) })),
  }));
  const standalone = [...actors].sort().map((comp): MermaidNode => ({ id: comp, label: comp }));
  const spec: MermaidSpec = { subgraphs, nodes: standalone, edges };

  // 4. Tabla: un componente por fila, con su módulo y su rol estructural
  const components: ArchitectureComponent[] = [...groupOf.keys()].sort().map((comp) => ({
    name: comp,
    tech: groupOf.get(comp) ?? "—",
    detail: LAYER_ROLE[labelOf(comp)] ?? "—",
  }));

  return { mermaid: buildMermaid(spec), components };
}
