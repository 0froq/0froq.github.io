#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus_utils.zsh
# Last modified: 2025-11-08 11:00:55

# Corpus utility library

corpus_parse_options() {
  local args=("$@")

  # Clear any existing ARG_ variables
  unset -m 'ARG_*'

  local positional_args=()
  local i=1

  while [[ $i -le ${#args[@]} ]]; do
    local arg="${args[$i]}"

    case "$arg" in
      --*=*)
        # Long option with value: --key=value
        local key="${arg#--}"
        key="${key%%=*}"
        key="${key//-/_}"
        local value="${arg#--*=}"
        export "ARG_${key}=${value}"
        ;;
      --*)
        # Long option flag: --flag
        local key="${arg#--}"
        key="${key//-/_}"
        export "ARG_${key}=true"
        ;;
      -*)
        # Short options: support -f as --force, -i as --insta
        local flags="${arg#-}"
        local j=1
        while [[ $j -le ${#flags} ]]; do
          local flag="${flags[$j]}"
          case "$flag" in
            f)
              export ARG_force=true
              ;;
            i)
              export ARG_insta=true
              ;;
            *)
              corpus_warning "Unknown short option: -$flag"
              ;;
          esac
          ((j++))
        done
        ;;
      *)
        # Positional argument
        positional_args+=("$arg")
        ;;
    esac
    ((i++))
  done

  # Export positional arguments
  export CORPUS_POSITIONAL_ARGS=("${positional_args[@]}")
  export CORPUS_POSITIONAL_COUNT=${#positional_args[@]}
}

# -----------------------
# Safe File Operations
# -----------------------

corpus_datestamp() {
  if [[ -x "/bin/date" ]]; then
    /bin/date +%Y%m%d
  elif [[ -x "/usr/bin/date" ]]; then
    /usr/bin/date +%Y%m%d
  else
    printf '%(%Y%m%d)T' -1
  fi
}

corpus_date() {
  if [[ -x "/bin/date" ]]; then
    /bin/date +%Y-%m-%d
  elif [[ -x "/usr/bin/date" ]]; then
    /usr/bin/date +%Y-%m-%d
  else
    printf '%(%Y-%m-%d)T' -1
  fi
}

corpus_datetime() {
  if [[ -x "/bin/date" ]]; then
    /bin/date +%Y-%m-%d\ %H:%M:%S
  elif [[ -x "/usr/bin/date" ]]; then
    /usr/bin/date +%Y-%m-%d\ %H:%M:%S
  else
    printf '%(%Y-%m-%d %H:%M:%S)T' -1
  fi
}

corpus_safe_filename() {
  local input="$1"

  # Replace basic set: spaces and hyphens -> underscore
  local safe="${input// /_}"
  safe="${safe//-/_}"

  # Replace all non-allowed chars with underscore (allow: ASCII letters/digits, CJK, underscore)
  safe="${safe//[^a-zA-Z0-9\u4e00-\u9fff_]/_}"

  # Collapse multiple underscores to a single underscore
  while [[ "$safe" == *"__"* ]]; do
    safe="${safe//__/_}"
  done

  safe="${safe#_}"
  safe="${safe%_}"

  [[ -z "$safe" ]] && safe="unnamed"

  echo "$safe"
}

corpus_generate_filename() {
  local layer="$1"
  local content="${2:-}"
  local template_type="${3:-}"
  local datestamp="$(corpus_datestamp)"

  # Determine if this layer includes date in filename
  local include_date="true" # default for backward compatibility

  if corpus_layer_exists "$layer"; then
    include_date="$(corpus_find_layer "$layer" "include_date")"

    # Special case: paper template omits date
    if [[ "$template_type" == "paper" ]]; then
      include_date="false"
    fi
  fi

  if [[ -n "$content" ]]; then
    local safe_content="$(corpus_safe_filename "$content")"
    if [[ "$include_date" == "true" ]]; then
      echo "${layer}_${safe_content}_${datestamp}.md"
    else
      echo "${layer}_${safe_content}.md"
    fi
  else
    if [[ "$include_date" == "true" ]]; then
      echo "${layer}_${datestamp}.md"
    else
      echo "${layer}.md"
    fi
  fi
}

corpus_ensure_directory() {
  local dir="$1"

  if [[ ! -d "$dir" ]]; then
    if ! mkdir -p "$dir" 2> /dev/null; then
      corpus_error "Cannot create directory: $dir"
      return 1
    fi
    corpus_info "Created directory: $dir"
  fi

  return 0
}

# -----------------------
# Template Processing (Enhanced)
# -----------------------

corpus_expand_template() {
  local template_file="$1"
  local output_file="$2"
  shift 2

  if [[ ! -f "$template_file" ]]; then
    corpus_error "Template not found: $template_file"
    return 1
  fi

  if [[ ! -r "$template_file" ]]; then
    corpus_error "Cannot read template: $template_file"
    return 1
  fi

  local content
  content="$(< "$template_file")" || {
    corpus_error "Failed to read template content"
    return 1
  }

  # Process template variables in pairs
  while [[ $# -ge 2 ]]; do
    local placeholder="$1"
    local replacement="$2"
    shift 2

    # Replace {{placeholder}} with replacement
    content="${content//\{\{${placeholder}\}\}/${replacement}}"
  done

  # Set built-in template variables
  content="${content//\{\{date\}\}/$(corpus_date)}"
  content="${content//\{\{datetime\}\}/$(corpus_datetime)}"
  content="${content//\{\{datestamp\}\}/$(corupus_datestamp)}"
  content="${content//\{\{corpus_dir\}\}/${CORPUS_DIR}}"

  # Write output with error checking
  if ! echo "$content" > "$output_file"; then
    corpus_error "Failed to write to: $output_file"
    return 1
  fi

  return 0
}

# -----------------------
# Citation Processing
# -----------------------

corpus_is_citation() {
  [[ "$1" =~ ^@[a-zA-Z0-9_-]+.*$ ]]
}

corpus_extract_citation_key() {
  local input="$1"
  if [[ "$input" =~ ^@(.+)$ ]]; then
    echo "${match[1]}"
  else
    echo "$input"
  fi
}

# -----------------------
# Editor Integration (Enhanced for Instant Notes)
# -----------------------

corpus_open_editor() {
  local file="$1"
  local editor="${2:-${CORPUS_DEFAULT_EDITOR:-nvim}}"

  # Validate file exists
  if [[ ! -f "$file" ]]; then
    corpus_error "File does not exist: $file"
    return 1
  fi

  # Special handling for instant notes - prefer nvim with insert mode
  if [[ "${ARG_insta:-}" == "true" ]]; then
    if command -v nvim &> /dev/null; then
      # Start nvim at end of file in insert mode
      nvim "+normal G" "+startinsert!" "$file"
      return $?
    elif command -v vim &> /dev/null; then
      vim "+normal G" "+startinsert!" "$file"
      return $?
    fi
  fi

  # Editor priority and fallback chain
  case "$editor" in
    code | vscode)
      if command -v code &> /dev/null; then
        code "$file"
      elif command -v cursor &> /dev/null; then
        cursor "$file"
      elif [[ -x "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]]; then
        "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" "$file"
      elif [[ "$(uname -s)" == "Darwin" ]]; then
        # Try macOS app launchers
        if /usr/bin/open -a "Visual Studio Code" "$file" 2> /dev/null; then
          return 0
        fi
        if /usr/bin/open -a "Cursor" "$file" 2> /dev/null; then
          return 0
        fi
        if /usr/bin/open -a "TextEdit" "$file" 2> /dev/null; then
          return 0
        fi
        corpus_fallback_editor "$file"
      else
        corpus_fallback_editor "$file"
      fi
      ;;
    nvim | vim)
      if command -v "$editor" &> /dev/null; then
        "$editor" "$file"
      elif [[ -x "/opt/homebrew/bin/$editor" ]]; then
        "/opt/homebrew/bin/$editor" "$file"
      elif [[ -x "/usr/local/bin/$editor" ]]; then
        "/usr/local/bin/$editor" "$file"
      else
        corpus_fallback_editor "$file"
      fi
      ;;
    *)
      if command -v "$editor" &> /dev/null; then
        "$editor" "$file"
      else
        corpus_fallback_editor "$file"
      fi
      ;;
  esac
}

corpus_fallback_editor() {
  local file="$1"

  # Try common editors in order
  local editors=(nvim vim nano code cursor subl micro)

  for editor in "${editors[@]}"; do
    if command -v "$editor" &> /dev/null; then
      corpus_info "Using fallback editor: $editor"
      "$editor" "$file"
      return 0
    fi
  done

  # Absolute path fallbacks
  local abs_paths=(
    "/opt/homebrew/bin/nvim"
    "/usr/local/bin/nvim"
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
  )

  for p in "${abs_paths[@]}"; do
    if [[ -x "$p" ]]; then
      corpus_info "Using fallback editor: $p"
      "$p" "$file"
      return 0
    fi
  done

  # macOS app launcher fallbacks
  if [[ "$(uname -s)" == "Darwin" ]]; then
    for app in "Visual Studio Code" "Cursor" "TextEdit"; do
      if /usr/bin/open -a "$app" "$file" 2> /dev/null; then
        corpus_info "Using fallback editor app: $app"
        return 0
      fi
    done
  fi

  # No editor found
  corpus_warning "No suitable editor found. File created at: $file"
  return 1
}

# -----------------------
# Enhanced Logging
# -----------------------

corpus_debug() {
  if [[ "${CORPUS_DEBUG:-}" == "true" ]]; then
    # Use UI color constants when available; fall back to plain if unset
    if [[ -n "${UI_GRAY:-}" && -n "${UI_RESET:-}" ]]; then
      echo "${UI_GRAY}[DEBUG]${UI_RESET} $1" >&2
    else
      echo "[DEBUG] $1" >&2
    fi
  fi
}

corpus_trace_function() {
  if [[ "${CORPUS_TRACE:-}" == "true" ]]; then
    if [[ -n "${UI_GRAY:-}" && -n "${UI_RESET:-}" ]]; then
      echo "${UI_GRAY}[TRACE] ${funcstack[2]:-unknown} -> ${funcstack[1]:-unknown}${UI_RESET}" >&2
    else
      echo "[TRACE] ${funcstack[2]:-unknown} -> ${funcstack[1]:-unknown}" >&2
    fi
  fi
}
