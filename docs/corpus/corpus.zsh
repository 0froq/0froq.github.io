#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus.zsh
# Last modified: 2025-11-06 02:31:26

# Corpus entrypoint - Six Layer Architecture

# Slim entrypoint: short-circuit to core library
_CORPUS_LIB_DIR="${CORPUS_DIR:-}/_lib"

if [[ -f "$_CORPUS_LIB_DIR/corpus_core.zsh" ]]; then
    source "$_CORPUS_LIB_DIR/corpus_core.zsh" || {
        echo "Error: Cannot load $_CORPUS_LIB_DIR/corpus_core.zsh" >&2
        exit 1
    }
else
    echo "Error: Corpus core library not found at $_CORPUS_LIB_DIR/corpus_core.zsh" >&2
    exit 1
fi

# Initialize and dispatch commands
corpus_init

# Dispatch commands
command="${1:-}"
[[ $# -gt 0 ]] && shift

# Dispatch based on command
case "$command" in
    create | new)
        corpus_create "$@"
    ;;
    
    # Six-layer shortcuts with support for --insta
    aut | autopsia)
        corpus_create "aut" "$@"
    ;;
    
    ing | ingesta)
        corpus_create "ing" "$@"
    ;;
    
    neo | neoplasma)
        corpus_create "neo" "$@"
    ;;
    
    put | putredo)
        corpus_create "put" "$@"
    ;;
    
    del | delirium)
        corpus_create "del" "$@"
    ;;
    
    vig | vigil)
        corpus_create "vig" "$@"
    ;;
    paper)
        corpus_create "paper" "$@"
    ;;
    # Navigation and information
    nav | cd)
        cd "$CORPUS_DIR" && pwd
    ;;
    
    help | --help | -h)
        corpus_help "$@"
    ;;
    
    version | --version)
        corpus_version
    ;;
    
    layers | list)
        corpus_list_layers
    ;;
    
    debug)
        export CORPUS_DEBUG=true
        corpus_version
    ;;
    
    # Handle unknown commands gracefully
    *)
        if [[ -n "$command" ]]; then
            corpus_error "Unknown command: $command"
            echo >&2
            echo "Available commands:" >&2
            echo "  create, aut, ing, neo, put, del, vig" >&2
            echo "  nav, layers, help, version" >&2
            echo >&2
            echo "Use 'corpus help' for detailed usage information." >&2
            exit 1
        else
            corpus_help
        fi
    ;;
esac

exit 0
