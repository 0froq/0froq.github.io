#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus_core.zsh
# Last modified: 2025-11-06 00:53:04

# Corpus core library

corpus_init() {
  # Environment validation
  if [[ -z "$CORPUS_DIR" ]]; then
    echo "Error: CORPUS_DIR environment variable not set" >&2
    exit 1
  fi

  if [[ ! -d "$CORPUS_DIR" ]]; then
    echo "Error: Corpus directory does not exist: $CORPUS_DIR" >&2
    exit 1
  fi

  # Load configuration defaults
  corpus_load_config

  # Resolve library directory
  local lib_dir
  if [[ -n "${ZSH_VERSION:-}" ]]; then
    # Use eval to avoid non-zsh shells parsing the zsh-specific ${(%):-%x} expansion.
    eval 'lib_dir="$(dirname "${(%):-%x}")"'
  elif [[ -n "${BASH_SOURCE[0]:-}" ]]; then
    lib_dir="$(dirname "${BASH_SOURCE[0]}")"
  else
    lib_dir="$CORPUS_DIR/_lib"
  fi

  # Load libraries
  source "$lib_dir/corpus_ui.zsh" || {
    echo "Error: Cannot load $lib_dir/corpus_ui.zsh" >&2
    exit 1
  }

  source "$lib_dir/corpus_layers.zsh" || {
    echo "Error: Cannot load $lib_dir/corpus_layers.zsh" >&2
    exit 1
  }

  source "$lib_dir/corpus_utils.zsh" || {
    echo "Error: Cannot load $lib_dir/corpus_utils.zsh" >&2
    exit 1
  }

  # Load commands
  if [[ -f "$CORPUS_DIR/_commands/create.zsh" ]]; then
    source "$CORPUS_DIR/_commands/create.zsh" || {
      echo "Error: Cannot load create command" >&2
      exit 1
    }
  fi
}

# -----------------------
# Configuration Management
# -----------------------

corpus_load_config() {
  CORPUS_CONFIG_FILE="$CORPUS_DIR/_config/corpus.conf"

  # Defaults (do not override if already set)
  : ${CORPUS_DEFAULT_STATUS:="probe"}
  : ${CORPUS_AUTO_TIMESTAMP:="true"}
  : ${CORPUS_DEFAULT_EDITOR:="nvim"}

  export CORPUS_DEFAULT_STATUS CORPUS_AUTO_TIMESTAMP CORPUS_DEFAULT_EDITOR

  # Ensure config file exists (no parsing for now)
  if [[ ! -f "$CORPUS_CONFIG_FILE" ]]; then
    mkdir -p "$(dirname "$CORPUS_CONFIG_FILE")"
    cat > "$CORPUS_CONFIG_FILE" << 'EOF'
# Corpus Configuration File

# Default Values
defaults:
  editor: nvim
  status: probe
  auto_timestamp: true

# Layer Configuration - Six Layer Architecture
layers:
  enabled: all  # all | custom list

# Instant Note Configuration
instant:
  default_editor: nvim
  auto_tag: true
EOF
  fi
}

corpus_create_default_config() {
  local config_dir="$CORPUS_DIR/_config"
  mkdir -p "$config_dir"

  cat > "$CORPUS_CONFIG_FILE" << 'EOF'
# Corpus Configuration File

defaults:
  editor: nvim
  status: probe
  auto_timestamp: true

layers:
  enabled: all

instant:
  default_editor: nvim
  auto_tag: true
EOF
}

# -----------------------
# Core Commands
# -----------------------

corpus_version() {
  echo "Corpus Knowledge Management System"
  echo "Version: 2.0.0 (Six-Layer Architecture)"
  echo "Path: $CORPUS_DIR"

  local checks=""
  [[ -d "$CORPUS_DIR/_template" ]] && checks+="Template:✓ " || checks+="Template:✗ "
  [[ -d "$CORPUS_DIR/_scripts" ]] && checks+="Scripts:✓ " || checks+="Scripts:✗ "
  [[ -f "$ZOTERO_BIB_FILE" ]] && checks+="Zotero:✓" || checks+="Zotero:✗"

  echo "Status: $checks"

  echo
  echo "Six-Layer Architecture:"
  echo "  • autopsia (aut) - Metacognitive dissection"
  echo "  • ingesta (ing)  - Information ingestion"
  echo "  • neoplasma (neo) - Thought proliferation"
  echo "  • putredo (put)  - Decay and retrospection"
  echo "  • delirium (del) - Aesthetic wonders"
  echo "  • vigil (vig)    - Night watches"
}

corpus_help() {
  cat << 'EOF'
Corpus - Pathological Knowledge Management System
Six-Layer Architecture (v2.0.0)

USAGE:
  corpus [command] [arguments] [options]

CORE COMMANDS:
  create [layer] [content]  Create a new entry in the specified layer
  nav, cd                   Navigate to Corpus directory
  layers, list              List all available layers
  help [command]            Show help information
  version                   Show version and system status

LAYER SHORTCUTS:
  aut [content]             Create autopsia entry (metacognitive)
  ing [content]             Create ingesta entry (information intake)
  neo [content]             Create neoplasma entry (thought proliferation)
  put [content]             Create putredo entry (decay/retrospection)
  del [content]             Create delirium entry (aesthetic materials)
  vig [content]             Create vigil entry (night watches)

SPECIAL COMMANDS:
  ing paper [citation]      Create paper entry with metadata
  [layer] --insta          Instant note-taking mode (opens nvim immediately)

OPTIONS:
  --status=[status]         Set entry status (draft, probe, form, canon, void)
  --no-edit                Don't open editor after creation
  --type=paper             Use paper template (for ingesta layer)
  --insta, -i              Instant note-taking mode
  -f, --force              Overwrite if target file already exists

INSTANT NOTE EXAMPLES:
  corpus ing --insta                    # Quick note in ingesta layer
  corpus neo --insta "brain waves"      # Quick note with initial content
  corpus del -i                         # Quick aesthetic note

REGULAR EXAMPLES:
  corpus create ing "new research topic"
  corpus ing paper @smith2023
  corpus aut --status=draft --no-edit
  corpus neo "consciousness and AI"

For detailed layer descriptions: corpus layers

EOF
}
