import os
import sys
from datetime import datetime
from typing import Set, Optional
import argparse
import logging
import chardet # Import chardet

class ProjectDocumentGenerator:
    def __init__(
        self,
        base_path: str,
        output_file: str,
        ignored_dirs: Optional[Set[str]] = None,
        text_extensions: Optional[Set[str]] = None,
        max_file_size: int = 10 * 1024 * 1024  # 10 MB
    ):
        self.base_path = os.path.abspath(base_path)
        self.output_file = os.path.abspath(output_file)
        self.ignored_dirs = ignored_dirs or {'venv', '__pycache__', '.git', 'node_modules'}
        # *** ADDED .prompt to the default list ***
        self.text_extensions = text_extensions or {
            '.py', '.txt', '.md', '.json', '.yaml', '.yml',
            '.js', '.jsx', '.ts', '.tsx', '.css', '.scss',
            '.html', '.htm', '.xml', '.csv', '.ini', '.cfg',
            '.prompt' # <-- Added here
        }
        self.stats = {
            'total_files': 0,
            'text_files': 0,
            'binary_files': 0,
            'total_size': 0
        }

        # Store the output file's relative path to base_path
        if os.path.commonpath([self.output_file, self.base_path]) == self.base_path:
            self.output_file_rel = os.path.relpath(self.output_file, self.base_path)
        else:
            self.output_file_rel = None  # Output file is outside base_path

        self.max_file_size = max_file_size  # Maximum file size to include (in bytes)

    def format_size(self, size: int) -> str:
        """Convert size in bytes to human-readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} PB"

    def is_text_file(self, filename: str) -> bool:
        """Determine if a file is a text file based on its extension."""
        # *** Keep the extension check as the primary method ***
        return os.path.splitext(filename)[1].lower() in self.text_extensions

    def generate_documentation(self):
        """Generate the project documentation."""
        with open(self.output_file, 'w', encoding='utf-8') as doc:
            # Write header
            doc.write("# Project Documentation\n\n")
            doc.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            # Write base directory name
            base_dir_name = os.path.basename(self.base_path)
            doc.write(f"## Directory Structure\n{base_dir_name}\n")
            tree_lines = []
            self._generate_directory_structure(self.base_path, tree_lines, prefix="")
            doc.writelines(tree_lines)

            # Generate file contents
            doc.write("\n## File Contents\n\n")
            self._generate_file_contents(doc)

            # Write statistics
            self._write_statistics(doc)

    def _generate_directory_structure(self, current_path: str, tree_lines: list, prefix: str):
        """Recursively generate the directory structure."""
        try:
            entries = os.listdir(current_path)
        except PermissionError as e:
            logging.warning(f"Permission denied: {current_path}")
            return
        except Exception as e:
            logging.warning(f"Error accessing {current_path}: {e}")
            return

        dirs = sorted([d for d in entries if os.path.isdir(os.path.join(current_path, d)) and d not in self.ignored_dirs])
        files = sorted([f for f in entries if os.path.isfile(os.path.join(current_path, f))])

        all_entries = dirs + files
        total_entries = len(all_entries)

        for index, entry in enumerate(all_entries):
            path = os.path.join(current_path, entry)
            is_last = index == (total_entries - 1)
            connector = "└── " if is_last else "├── "
            if os.path.isdir(path):
                tree_lines.append(f"{prefix}{connector}{entry}/\n")
                new_prefix = prefix + ("    " if is_last else "│   ")
                self._generate_directory_structure(path, tree_lines, new_prefix)
            else:
                tree_lines.append(f"{prefix}{connector}{entry}\n")

    def _generate_file_contents(self, doc_file):
        """Generate the contents of each file in a separate section."""
        for root, dirs, files in os.walk(self.base_path):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]

            for file in sorted(files):
                file_path = os.path.join(root, file)

                if self.output_file_rel and os.path.normpath(os.path.relpath(file_path, self.base_path)) == os.path.normpath(self.output_file_rel):
                    continue

                try:
                    file_size = os.path.getsize(file_path)
                except OSError as e:
                    logging.warning(f"Cannot access file {file_path}: {e}")
                    continue

                rel_path = os.path.relpath(file_path, self.base_path)
                self.stats['total_files'] += 1
                self.stats['total_size'] += file_size

                doc_file.write(f"\n### {rel_path} ({self.format_size(file_size)})\n\n")

                # *** Use the is_text_file check based on extension ***
                if self.is_text_file(file):
                    self.stats['text_files'] += 1
                    if file_size == 0:
                        doc_file.write("```\n*Empty file*\n```\n")
                        continue
                    if file_size > self.max_file_size:
                        doc_file.write("*File too large to display.*\n")
                        logging.info(f"Skipped large file: {file_path}")
                        continue

                    # *** Attempt to read with UTF-8 first, fallback with detection ***
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        logging.warning(f"UTF-8 decoding failed for {file_path}. Attempting detection.")
                        try:
                            with open(file_path, 'rb') as fb:
                                raw_data = fb.read()
                                detected_encoding = chardet.detect(raw_data)['encoding']
                                if detected_encoding:
                                    logging.info(f"Detected encoding {detected_encoding} for {file_path}.")
                                    content = raw_data.decode(detected_encoding, errors='replace')
                                else:
                                    logging.error(f"Could not detect encoding for {file_path}. Skipping content.")
                                    content = "*Error reading file: Could not detect encoding*"
                        except Exception as e_read:
                             logging.error(f"Error reading file {file_path} after detection attempt: {e_read}")
                             content = f"*Error reading file: {str(e_read)}*"
                    except Exception as e_other:
                        logging.error(f"Error reading file {file_path}: {e_other}")
                        content = f"*Error reading file: {str(e_other)}*"

                    # Write content to doc
                    doc_file.write("```")
                    lang = os.path.splitext(file)[1][1:]
                    if lang: doc_file.write(lang)
                    doc_file.write("\n")
                    # Replace potential problematic characters if needed, though decode(errors='replace') handles some
                    doc_file.write(content.replace('\x00', '')) # Example: remove null bytes
                    doc_file.write("\n```\n")
                else:
                    # If extension not in list, mark as binary
                    self.stats['binary_files'] += 1
                    doc_file.write("*Binary or unsupported file format based on extension*\n")


    def _write_statistics(self, doc_file):
        """Write project statistics."""
        doc_file.write("\n## Project Statistics\n\n")
        doc_file.write(f"- Total Files: {self.stats['total_files']}\n")
        doc_file.write(f"- Text Files: {self.stats['text_files']}\n")
        doc_file.write(f"- Binary Files: {self.stats['binary_files']}\n")
        doc_file.write(f"- Total Size: {self.format_size(self.stats['total_size'])}\n")

def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Generate project documentation.")
    parser.add_argument("base_path", nargs='?', default=".", help="Base directory of the project.")
    parser.add_argument("-o", "--output-dir", default=".", help="Output directory.")
    parser.add_argument("-i", "--ignore", nargs='*', default=['venv', '__pycache__', '.git', 'node_modules'], help="Directories to ignore.")
    # *** ADDED .prompt to the default list ***
    parser.add_argument(
        "-e", "--extensions",
        nargs='*',
        default=[
            '.py', '.txt', '.md', '.json', '.yaml', '.yml',
            '.js', '.jsx', '.ts', '.tsx', '.css', '.scss',
            '.html', '.htm', '.xml', '.csv', '.ini', '.cfg',
            '.prompt' # <-- Added here
        ],
        help="List of file extensions to consider as text files."
    )
    parser.add_argument("-m", "--max-size", type=int, default=10 * 1024 * 1024, help="Max file size (bytes) for content.")
    parser.add_argument("--verbose", action='store_true', help="Enable verbose logging.")
    return parser.parse_args()

def setup_logging(verbose: bool):
    """Configure logging settings."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format='[%(levelname)s] %(message)s')

def generate_timestamped_filename(base_dir: str, base_name: str = "PROJECT_STRUCTURE", extension: str = "md") -> str:
    """Generate a filename with the current date and time appended."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{base_name}_{timestamp}.{extension}"
    return os.path.join(base_dir, filename)

def main():
    """Main function to run the documentation generator."""
    args = parse_arguments()
    setup_logging(args.verbose)

    # *** Install chardet if not present ***
    try:
        import chardet
    except ImportError:
        print("Installing chardet library for encoding detection...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "chardet"])
            import chardet # Try importing again
            print("chardet installed successfully.")
        except Exception as e:
            logging.error(f"Failed to install chardet. Encoding detection fallback might not work: {e}")
            # Continue without chardet if installation fails

    try:
        output_file = generate_timestamped_filename(args.output_dir)
        generator = ProjectDocumentGenerator(
            base_path=args.base_path,
            output_file=output_file,
            ignored_dirs=set(args.ignore),
            text_extensions=set(args.extensions),
            max_file_size=args.max_size
        )
        generator.generate_documentation()
        print(f"\nDocumentation generated successfully!")
        print(f"Output file: {os.path.abspath(generator.output_file)}")
    except ValueError as ve:
        logging.error(ve); sys.exit(1)
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}"); sys.exit(1)

if __name__ == "__main__":
    # Add chardet installation logic here as well for direct script execution
    try:
        import chardet
    except ImportError:
        print("Installing chardet library for encoding detection...")
        try:
            import subprocess # Ensure subprocess is imported here too
            subprocess.check_call([sys.executable, "-m", "pip", "install", "chardet"])
            print("chardet installed successfully.")
        except Exception as e:
            print(f"WARNING: Failed to install chardet. Encoding detection fallback might not work: {e}")
    main()