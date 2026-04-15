class SkillManager < Formula
  desc "Manage AI Skills across Claude Code, Codex, and OpenClaw"
  homepage "https://github.com/yourname/skill-manager"
  url "https://github.com/yourname/skill-manager.git"
  version "1.0.0"
  license "MIT"

  depends_on "node"

  def install
    # Build the TypeScript project
    system "npm", "install"
    system "npm", "run", "build"

    # Install the CLI globally
    bin.install "dist/index.js" => "skillman"
  end

  test do
    # Basic test
    assert_match "skillman", shell_output("#{bin}/skillman --version")
  end
end
