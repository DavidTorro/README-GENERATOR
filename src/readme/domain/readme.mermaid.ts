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

// Los ids solo admiten [a-zA-Z0-9_]; todo lo demás se sustituye
function toId(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z0-9_]/g, "_") || "node";
}

// Las labels van SIEMPRE entre comillas: espacios, emojis y símbolos dejan de ser problema
function quote(raw: string): string {
  return `"${raw.trim().replace(/"/g, "'")}"`;
}

export function buildMermaid(spec: MermaidSpec): string {
  const lines = ["flowchart LR"];
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
  return lines.join("\n");
}