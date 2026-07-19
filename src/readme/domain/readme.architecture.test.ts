import { describe, expect, it } from "vitest";
import { getTranslations } from "./i18n/index.js";
import { renderArchitectureSection, replaceArchitectureSection } from "./readme.architecture.js";

const architecture = {
  mermaid: "flowchart LR\n  cli --> readme",
  components: [{ name: "cli", tech: "Node.js", detail: "Generates documentation" }],
};

describe("architecture section", () => {
  it("renders and replaces only the existing architecture section", () => {
    const section = renderArchitectureSection(architecture, getTranslations("en"));
    const markdown = "# Demo\n\nIntro\n\n## 🏗️ Architecture\n\nold diagram\n\n## 📄 License\n\nMIT\n";

    const updated = replaceArchitectureSection(markdown, section);

    expect(updated).toContain("flowchart LR");
    expect(updated).not.toContain("old diagram");
    expect(updated).toContain("## 📄 License\n\nMIT");
  });

  it("refuses to alter a README without an architecture section", () => {
    expect(() => replaceArchitectureSection("# Demo\n", "replacement")).toThrow(
      "README.md has no architecture section to replace.",
    );
  });
});
