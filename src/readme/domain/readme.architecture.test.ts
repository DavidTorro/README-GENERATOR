import { describe, expect, it } from "vitest";
import { getTranslations } from "./i18n/index.js";
import { renderArchitectureSection, replaceArchitectureSection } from "./readme.architecture.js";

const architecture = {
  mermaid: "flowchart LR\n  cli --> readme",
  components: [{ name: "cli", tech: "Node.js", detail: "Generates documentation" }],
};

describe("architecture section", () => {
  it("replaces a marked architecture section", () => {
    const section = renderArchitectureSection(architecture, getTranslations("en"));
    const markdown = "# Demo\n\n<!-- readme-gen:architecture:start -->\n## 🏗️ Architecture\n\n```mermaid\nold diagram\n```\n<!-- readme-gen:architecture:end -->\n\n## 📄 License\n\nMIT\n";

    const updated = replaceArchitectureSection(markdown, section);

    expect(updated).toBeDefined();
    expect(updated!).toContain("flowchart LR");
    expect(updated!).not.toContain("old diagram");
    expect(updated!).toContain("## 📄 License\n\nMIT");
  });

  it("updates only the Mermaid block in a legacy generated section", () => {
    const markdown = "# Demo\n\n## Architecture\n\n```mermaid\nold diagram\n```\n\nManual notes\n\n## License\n\nMIT\n";

    const updated = replaceArchitectureSection(markdown, renderArchitectureSection(architecture, getTranslations("en")));

    expect(updated).toBeDefined();
    expect(updated!).toContain("flowchart LR");
    expect(updated!).toContain("Manual notes");
    expect(updated!).toContain("## License\n\nMIT");
  });

  it("does not replace an unmarked manual architecture section", () => {
    const markdown = "# Demo\n\n## Arquitectura\n\n![Manual diagram](diagram.svg)\n";

    expect(replaceArchitectureSection(markdown, "replacement")).toBeUndefined();
  });
});
