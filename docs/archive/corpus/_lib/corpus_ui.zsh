#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus_ui.zsh
# Last modified: 2025-11-06 00:53:20

# Corpus user interface library

UI_RED=$'\033[31m'
UI_GREEN=$'\033[32m'
UI_YELLOW=$'\033[33m'
UI_BLUE=$'\033[34m'
UI_MAGENTA=$'\033[35m'
UI_CYAN=$'\033[36m'
UI_WHITE=$'\033[37m'
UI_GRAY=$'\033[90m'
UI_RESET=$'\033[0m'
UI_BOLD=$'\033[1m'
UI_ITALIC=$'\033[3m'

# Color enable/disable controls
# Honor NO_COLOR to disable; allow FORCE_COLOR to force-enable
UI_ENABLE_COLORS=1
if [[ -n "${NO_COLOR:-}" || "${TERM:-}" == "dumb" ]]; then
    UI_ENABLE_COLORS=0
fi
case "${FORCE_COLOR:-}" in
    1|true|always)
        UI_ENABLE_COLORS=1
        ;;
esac

if [[ "$UI_ENABLE_COLORS" -eq 0 ]]; then
    UI_RED=""; UI_GREEN=""; UI_YELLOW=""; UI_BLUE=""; UI_MAGENTA=""; UI_CYAN=""; UI_WHITE=""; UI_GRAY=""; UI_RESET=""; UI_BOLD=""; UI_ITALIC="";
fi

# -----------------------
# Feedback Functions
# -----------------------
corpus_success() {
    local message="$1"
    echo "${UI_GREEN}${UI_BOLD}[Corpus]${UI_RESET} ${message}"
}

corpus_info() {
    local message="$1"
    echo "${UI_CYAN}${UI_BOLD}[Corpus]${UI_RESET} ${message}"
}

corpus_warning() {
    local message="$1"
    echo "${UI_YELLOW}${UI_BOLD}[Corpus]${UI_RESET} ${message}" >&2
}

corpus_error() {
    local message="$1"
    echo "${UI_RED}${UI_BOLD}[Corpus]${UI_RESET} ${message}" >&2
}

# -----------------------
# Input Utilities
# -----------------------
corpus_prompt() {
    local prompt="$1"
    local default="${2:-}"
    local response

    if [[ -n "$default" ]]; then
    echo -n "${UI_CYAN}${prompt} [${default}]: ${UI_RESET}"
    else
    echo -n "${UI_CYAN}${prompt}: ${UI_RESET}"
    fi

    read response
    echo "${response:-$default}"
}

corpus_confirm() {
    local prompt="$1"
    local default="${2:-n}"
    local response

    echo -n "${UI_YELLOW}${prompt} [y/N]: ${UI_RESET}"
    read response

    case "${response:-$default}" in
        [Yy]|[Yy][Ee][Ss])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}
