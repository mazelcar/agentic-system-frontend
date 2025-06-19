import os
import datetime
import logging

# --- CONFIGURATION ---

# Rule #1: Source Code Directories
# All files within these directories will have their full content included,
# unless they are explicitly excluded by a rule in EXCLUDE_PATTERNS.
SOURCE_CODE_DIRS = {
    "src/",
}

# Rule #2: Explicitly Include Full Content for these specific files
# These are key project definition files outside the main source directories.
# Use forward slashes.
EXPLICIT_INCLUDE_FILES = {
    "package.json",
    "public/index.html",
}

# Rule #3: Patterns for files, extensions, and directories to completely ignore.
# This is the primary tool for keeping the output clean and focused.
EXCLUDE_PATTERNS = {
    # Directories
    "node_modules",
    "build",
    "dist",
    ".git",
    ".vscode",
    # Lockfiles and environment
    "package-lock.json",
    "yarn.lock",
    ".env",
    # Boilerplate from create-react-app
    "reportWebVitals.js",
    "setupTests.js",
    # This script and its output
    "generate_frontend_context.py",
    "frontend_context.txt",
    # Common binary/asset formats
    ".log", ".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".eot",
}

# Output filename
OUTPUT_FILENAME = "frontend_context.txt"

# --- END OF CONFIGURATION ---


class ProjectContextGenerator:
    def __init__(self, base_path="."):
        self.base_path = os.path.abspath(base_path)
        self.stats = {
            'total_files_scanned': 0,
            'content_included_files': 0,
            'structure_only_files': 0,
        }

    def is_excluded(self, path):
        """Check if a file or directory should be excluded based on EXCLUDE_PATTERNS."""
        # Normalize path for consistent matching
        norm_path = path.replace('\\', '/')
        path_parts = norm_path.split('/')

        # Check if any part of the path is an excluded directory/file name
        for part in path_parts:
            if part in EXCLUDE_PATTERNS:
                return True

        # Check for file extension exclusion
        if os.path.splitext(norm_path)[1] in EXCLUDE_PATTERNS:
            return True

        return False

    def should_include_content(self, rel_path):
        """Check if a file's content should be included."""
        # Normalize for matching
        norm_rel_path = rel_path.replace('\\', '/')

        # Rule #1: Is it in a source code directory?
        for src_dir in SOURCE_CODE_DIRS:
            if norm_rel_path.startswith(src_dir):
                return True

        # Rule #2: Is it an explicitly included file?
        if norm_rel_path in EXPLICIT_INCLUDE_FILES:
            return True

        return False

    def generate_documentation(self):
        """Generate the project context documentation."""
        # Ensure this script and its output are not in the documentation
        if self.is_excluded(OUTPUT_FILENAME):
             pass # This is expected

        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as doc:
            doc.write(f"--- Project Context: {os.path.basename(self.base_path)} ---\n")
            doc.write(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

            doc.write("\n--- Directory Structure ---\n")
            tree_lines = []
            self._generate_directory_structure(self.base_path, tree_lines)
            doc.writelines(tree_lines)

            doc.write("\n--- File Contents ---\n")
            self._generate_file_contents(doc)

            self._write_statistics(doc)

    def _generate_directory_structure(self, current_path, tree_lines, prefix=""):
        """Recursively generate the directory structure, respecting exclusions."""
        try:
            # Sort entries: directories first, then files, all alphabetically
            entries = os.listdir(current_path)
            entries.sort(key=lambda x: (os.path.isdir(os.path.join(current_path, x)), x.lower()))
        except OSError as e:
            logging.warning(f"Could not read directory {current_path}: {e}")
            return

        filtered_entries = [e for e in entries if not self.is_excluded(os.path.join(current_path, e))]

        for i, entry in enumerate(filtered_entries):
            is_last = i == (len(filtered_entries) - 1)
            connector = "└── " if is_last else "├── "
            path = os.path.join(current_path, entry)

            if os.path.isdir(path):
                tree_lines.append(f"{prefix}{connector}{entry}/\n")
                new_prefix = prefix + ("    " if is_last else "│   ")
                self._generate_directory_structure(path, tree_lines, new_prefix)
            else:
                tree_lines.append(f"{prefix}{connector}{entry}\n")

    def _generate_file_contents(self, doc):
        """Generate content based on the new ruleset."""
        for root, dirs, files in os.walk(self.base_path, topdown=True):
            # Filter directories in place to prevent walking into them
            dirs[:] = [d for d in dirs if not self.is_excluded(os.path.join(root, d))]

            # Sort files for consistent ordering
            files.sort(key=lambda x: x.lower())

            for file in files:
                file_path = os.path.join(root, file)
                if self.is_excluded(file_path):
                    continue

                self.stats['total_files_scanned'] += 1
                rel_path = os.path.relpath(file_path, self.base_path)

                if self.should_include_content(rel_path):
                    self.stats['content_included_files'] += 1
                    doc.write(f"\n### {rel_path.replace('\\', '/')} ###\n")
                    doc.write("```\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                            content = f.read()
                            if not content.strip():
                                doc.write("*File is empty*")
                            else:
                                doc.write(content)
                    except Exception as e:
                        doc.write(f"Error reading file: {e}")
                    doc.write("\n```\n")
                else:
                    self.stats['structure_only_files'] += 1

    def _write_statistics(self, doc):
        """Write summary statistics."""
        doc.write("\n--- Statistics ---\n")
        doc.write(f"Total Files Scanned (excluding noise): {self.stats['total_files_scanned']}\n")
        doc.write(f"Files with Full Content Included: {self.stats['content_included_files']}\n")
        doc.write(f"Files Listed in Structure Only: {self.stats['structure_only_files']}\n")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
    print("Generating frontend context with revised logic...")
    generator = ProjectContextGenerator()
    generator.generate_documentation()
    print(f"Frontend context successfully generated in '{OUTPUT_FILENAME}'")