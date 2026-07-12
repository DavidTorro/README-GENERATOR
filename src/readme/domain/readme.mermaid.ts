// Genera sintaxis mermaid VÁLIDA desde datos estructurados
// La IA nunca escribe mermaid directamente: nos da el grafo y aquí

export interface MermaidNode {
  id: string;
  label: string;
}

export interface MermaidSubgraph {
  title: string;
  nodes: MermaidNode[];
}

export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
}

export interface MermaidSpec {
  subgraphs: MermaidSubgraph[];
  // Nodos fuera de cualquier grupo (actores: usuario, navegador...)
  nodes?: MermaidNode[];
  edges: MermaidEdge[];
}

// Tema oscuro global del diagrama
const INIT_BLOCK = [
  "%%{init: {",
  '    "theme": "base",',
  // curve linear = flechas rectas (no las curvas serpenteantes de mermaid); más aire entre cajas
  '    "flowchart": { "curve": "linear", "nodeSpacing": 60, "rankSpacing": 90 },',
  '    "themeVariables": {',
  '        "primaryColor": "#1f2937",',
  '        "primaryTextColor": "#f9fafb",',
  '        "primaryBorderColor": "#60a5fa",',
  '        "lineColor": "#94a3b8",',
  '        "tertiaryColor": "#0f172a"',
  "    }",
  "}}%%",
].join("\n");

// Color de acento por grupo, rotando si hay más grupos que colores
const GROUP_COLORS = ["#38bdf8", "#c084fc", "#34d399", "#f472b6"];
const NODE_FILLS = ["#0f172a", "#111827", "#08111f", "#1f2937"];

const groupColor = (i: number): string => GROUP_COLORS[i % GROUP_COLORS.length] ?? "#60a5fa";
const nodeFill = (i: number): string => NODE_FILLS[i % NODE_FILLS.length] ?? "#0f172a";

// Los ids solo admiten [a-zA-Z0-9_]; todo lo demás se sustituye
function toId(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_]/g, "_") || "node";
}

// Las labels van SIEMPRE entre comillas: espacios, emojis y símbolos dejan de ser problema
function quote(raw: string): string {
  return `"${raw.trim().replace(/"/g, "'")}"`;
}

export function buildMermaid(spec: MermaidSpec): string {
  const lines = [INIT_BLOCK, "", "flowchart LR"];

  spec.subgraphs.forEach((sg, i) => {
    lines.push(`    subgraph SG${i}[${quote(sg.title)}]`);
    for (const node of sg.nodes) {
      lines.push(`        ${toId(node.id)}[${quote(node.label)}]`);
    }
    lines.push("    end");
  });

  for (const node of spec.nodes ?? []) {
    lines.push(`    ${toId(node.id)}[${quote(node.label)}]`);
  }

  for (const edge of spec.edges) {
    const arrow = edge.label ? `-- ${quote(edge.label)} -->` : "-->";
    lines.push(`    ${toId(edge.from)} ${arrow} ${toId(edge.to)}`);
  }

  // Estilo: un classDef por grupo aplicado a sus nodos...
  lines.push("");
  spec.subgraphs.forEach((sg, i) => {
    lines.push(
      `    classDef g${i} fill:${nodeFill(i)},stroke:${groupColor(i)},color:#f8fafc,stroke-width:2px;`,
    );
    lines.push(`    class ${sg.nodes.map((n) => toId(n.id)).join(",")} g${i};`);
  });

  // ...los actores con borde discontinuo ámbar...
  const actors = spec.nodes ?? [];
  if (actors.length > 0) {
    lines.push(
      "    classDef actor fill:#1f2937,stroke:#f59e0b,color:#fff7ed,stroke-width:2px,stroke-dasharray: 5 3;",
    );
    lines.push(`    class ${actors.map((n) => toId(n.id)).join(",")} actor;`);
  }

  // ...y cada caja de grupo con su acento, punteada
  spec.subgraphs.forEach((_, i) => {
    lines.push(
      `    style SG${i} fill:#0b1220,stroke:${groupColor(i)},stroke-width:1.5px,stroke-dasharray: 4 4,color:#e2e8f0`,
    );
  });

  return lines.join("\n");
}