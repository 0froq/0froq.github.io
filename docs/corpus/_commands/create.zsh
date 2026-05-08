#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: create.zsh
# Last modified: 2026-04-26 14:07:20

# Main Create Function

corpus_create() {
  corpus_trace_function

  # Parse arguments properly
  local layer="$1"
  local content=""
  shift

  local remaining_args=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --*) remaining_args+=("$1") ;;
      *)
        if [[ -z "$content" ]]; then
          content="$1"
        else
          remaining_args+=("$1")
        fi
        ;;
    esac
    shift
  done

  corpus_parse_options "${remaining_args[@]}"

  # Handle --insta flag for instant note-taking
  if [[ "${ARG_insta:-}" == "true" ]]; then
    corpus_create_instant_note "$layer" "$content"
    return $?
  fi

  # Validate input
  if [[ -z "$layer" ]]; then
    corpus_error "Layer must be specified"
    echo >&2
    corpus_list_layers
    return 1
  fi

  # Validate and normalize layer
  if ! corpus_layer_exists "$layer"; then
    corpus_error "Unknown layer: $layer"
    local suggestions=($(corpus_get_layer_suggestions "$layer"))
    if [[ ${#suggestions[@]} -gt 0 ]]; then
      # echo "Suggestions: ${(j:, :)suggestions}" >&2
      for suggestion in "${suggestions[@]}"; do
        echo "  - $suggestion" >&2
      done
    fi
    return 1
  fi

  local normalized_layer="$(corpus_normalize_layer "$layer")"

  # Check content requirement (relaxed for six-layer system)
  if corpus_layer_requires_arg "$normalized_layer" && [[ -z "$content" ]] && [[ "${ARG_insta:-}" != "true" ]]; then
    corpus_error "Layer '$layer' requires content argument (or use --insta for instant mode)"
    return 1
  fi

  # Get target directory
  local layer_path="$(corpus_get_layer_path "$normalized_layer")"
  local target_dir="$CORPUS_DIR/$layer_path"
  corpus_debug "Target directory: $target_dir"

  # Ensure target directory exists
  if ! corpus_ensure_directory "$target_dir"; then
    return 1
  fi

  # Handle special paper creation (ingesta layer with --type=paper or 'paper' command)
  if [[ ("$normalized_layer" == "ing" && "${ARG_type:-}" == "paper") || "$layer" == "paper" ]]; then
    corpus_create_paper_entry "$normalized_layer" "${content#paper }" "$target_dir"
    return $?
  fi

  # Handle paper citations (legacy support)
  if [[ "$normalized_layer" == "ing" && -n "$content" ]] && corpus_is_citation "$content"; then
    corpus_create_paper_citation "$normalized_layer" "$content" "$target_dir"
    return $?
  fi

  # Standard creation flow
  corpus_create_standard_entry "$normalized_layer" "$content" "$target_dir"
}

# -----------------------
# Instant Note Creation (New Feature)
# -----------------------

corpus_create_instant_note() {
  local layer="$1"
  local initial_content="${2:-}"

  # Validate layer
  if [[ -z "$layer" ]]; then
    corpus_error "Layer required for instant note"
    return 1
  fi

  if ! corpus_layer_exists "$layer"; then
    corpus_error "Unknown layer: $layer"
    return 1
  fi

  local normalized_layer="$(corpus_normalize_layer "$layer")"
  local layer_path="$(corpus_get_layer_path "$normalized_layer")"
  local target_dir="$CORPUS_DIR/$layer_path"

  # Ensure directory exists
  if ! corpus_ensure_directory "$target_dir"; then
    return 1
  fi

  # Use initial_content as the title for filename generation
  local title_for_filename="${initial_content:-instant}"
  local final_filename="$(corpus_generate_filename "$normalized_layer" "$title_for_filename" "")"
  local final_file="$target_dir/$final_filename"

  # Check if final file already exists
  if [[ -e "$final_file" && "${ARG_force:-}" != "true" ]]; then
    corpus_error "File already exists: $final_file"
    corpus_info "Use --force to overwrite"
    return 1
  fi

  # Create temporary empty file for headless editing
  local temp_dir="${TMPDIR:-/tmp}"
  local temp_file="$temp_dir/corpus_insta_$(date +%s)_$$.md"

  # Create the file immediately
  : > "$temp_file"

  corpus_info "Opening headless editor..."
  corpus_info "Save and exit to complete, or exit without saving to cancel."

  # Open headless nvim session with empty file
  if command -v nvim &> /dev/null; then
    # Start in insert mode with empty buffer
    nvim "+startinsert" "$temp_file"
  elif command -v vim &> /dev/null; then
    vim "+startinsert" "$temp_file"
  else
    corpus_fallback_editor "$temp_file"
  fi

  # Check if user actually wrote content
  if [[ ! -s "$temp_file" ]]; then
    corpus_warning "Note is empty, canceling creation"
    /bin/rm -f "$temp_file"
    return 1
  fi

  # Read the content from temp file
  local user_content="$(< "$temp_file")"

  # Clean up temp file
  /bin/rm -f "$temp_file"

  # Load template
  local template_file="$CORPUS_DIR/_template/tp-${normalized_layer}.md"
  if [[ ! -f "$template_file" ]]; then
    corpus_error "Template not found: $template_file"
    return 1
  fi

  # Determine metadata
  local entry_status="${ARG_status:-${CORPUS_DEFAULT_STATUS}}"
  local layer_path_meta="$(corpus_get_layer_path "$normalized_layer")"

  # Create file with template
  if ! corpus_expand_template "$template_file" "$final_file" \
    "layer" "$layer_path_meta" \
    "status" "$entry_status" \
    "title" "$initial_content"; then
    return 1
  fi

  # Append user content to the template
  echo "" >> "$final_file"
  echo "$user_content" >> "$final_file"

  corpus_success "Created instant note: $final_filename"
  return 0
}

# -----------------------
# Paper Entry Creation (Enhanced)
# -----------------------

corpus_create_paper_entry() {
  local layer="$1"
  local citation_or_content="$2"
  local target_dir="$3"

  # If it's a citation, handle as before
  if corpus_is_citation "$citation_or_content"; then
    corpus_create_paper_citation "$layer" "$citation_or_content" "$target_dir"
    return $?
  fi

  # Otherwise, create a paper template entry
  local paper_title="${citation_or_content:-}"
  local filename="$(corpus_generate_filename "$layer" "$paper_title" "paper")"
  local file_path="$target_dir/$filename"
  local template_file="$CORPUS_DIR/_template/tp-paper.md"

  # Prevent unintended overwrite unless forced
  if [[ -e "$file_path" && "${ARG_force:-}" != "true" ]]; then
    corpus_error "File already exists: $file_path"
    corpus_info "Use --force or -f to overwrite."
    return 1
  elif [[ -e "$file_path" && "${ARG_force:-}" == "true" ]]; then
    corpus_warning "Overwriting existing file: $file_path"
  fi

  if ! corpus_expand_template "$template_file" "$file_path" \
    "layer" "$(corpus_get_layer_path "$layer")" \
    "status" "${ARG_status:-${CORPUS_DEFAULT_STATUS}}" \
    "citation_key" "" \
    "title" "$paper_title" \
    "author" "" \
    "year" "" \
    "journal" "" \
    "doi" ""; then
    return 1
  fi

  corpus_success "Created paper entry: $filename"

  # Open in editor unless disabled
  if [[ -n "${ARG_editor:-}" ]]; then
    corpus_open_editor "$file_path" "${ARG_editor}"
  fi

  return 0
}

# -----------------------
# Standard Entry Creation (Simplified)
# -----------------------

corpus_create_standard_entry() {
  local layer="$1"
  local content="$2"
  local target_dir="$3"

  # Generate filename respecting include_date/template
  local filename="$(corpus_generate_filename "$layer" "$content" "")"
  local file_path="$target_dir/$filename"

  # Select template (simplified to use layer template)
  local template_file="$CORPUS_DIR/_template/tp-${layer}.md"

  if [[ ! -f "$template_file" ]]; then
    corpus_error "Template not found: $template_file"
    return 1
  fi

  # Prevent unintended overwrite unless forced
  if [[ -e "$file_path" && "${ARG_force:-}" != "true" ]]; then
    corpus_error "File already exists: $file_path"
    corpus_info "Use --force or -f to overwrite."
    return 1
  elif [[ -e "$file_path" && "${ARG_force:-}" == "true" ]]; then
    corpus_warning "Overwriting existing file: $file_path"
  fi

  # Determine metadata
  local entry_status="${ARG_status:-${CORPUS_DEFAULT_STATUS}}"
  local layer_path="$(corpus_get_layer_path "$layer")"

  # Create entry
  if ! corpus_expand_template "$template_file" "$file_path" \
    "layer" "$layer_path" \
    "status" "$entry_status" \
    "title" "$content"; then
    return 1
  fi

  corpus_success "Created $layer entry: $filename"

  # Open in editor unless disabled
  if [[ -n "${ARG_editor:-}" ]]; then
    corpus_open_editor "$file_path" "${ARG_editor}"
  fi

  return 0
}

# -----------------------
# Legacy Citation Support (Preserved)
# -----------------------

corpus_create_paper_citation() {
  local layer="$1"
  local citation_input="$2"
  local target_dir="$3"

  local citation_key="$(corpus_extract_citation_key "$citation_input")"

  # Try BibTeX extraction using available Python
  local bibtex_script="$CORPUS_DIR/_scripts/parse_bibtex.py"
  local metadata=""
  local python_cmd=""
  local python_locations=(
    "/usr/bin/python3"
    "/Library/Frameworks/Python.framework/Versions/3.9/bin/python3"
    "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3"
    "/opt/homebrew/bin/python3"
  )

  for location in "${python_locations[@]}"; do
    [[ -x "$location" ]] && python_cmd="$location" && break
  done

  if [[ -n "$python_cmd" && -f "$bibtex_script" && -f "$ZOTERO_BIB_FILE" ]]; then
    if metadata="$("$python_cmd" "$bibtex_script" "$ZOTERO_BIB_FILE" "$citation_key" 2> /dev/null)" && [[ -n "$metadata" ]]; then
      corpus_create_paper_with_metadata "$layer" "$citation_input" "$target_dir" "$metadata"
      return $?
    fi
  fi

  # Fallback to basic template
  corpus_create_paper_fallback "$layer" "$citation_input" "$target_dir"
}

corpus_create_paper_fallback() {
  local layer="$1"
  local citation_input="$2"
  local target_dir="$3"

  local citation_key="$(corpus_extract_citation_key "$citation_input")"
  local filename="$(corpus_generate_filename "$layer" "$citation_key" "paper")"
  local file_path="$target_dir/$filename"
  local template_file="$CORPUS_DIR/_template/tp-paper.md"

  # Prevent unintended overwrite unless forced
  if [[ -e "$file_path" && "${ARG_force:-}" != "true" ]]; then
    corpus_error "File already exists: $file_path"
    corpus_info "Use --force or -f to overwrite."
    return 1
  elif [[ -e "$file_path" && "${ARG_force:-}" == "true" ]]; then
    corpus_warning "Overwriting existing file: $file_path"
  fi

  if ! corpus_expand_template "$template_file" "$file_path" \
    "layer" "$(corpus_get_layer_path "$layer")" \
    "status" "${ARG_status:-${CORPUS_DEFAULT_STATUS}}" \
    "citation_key" "$citation_input" \
    "title" "" \
    "author" "" \
    "year" "" \
    "journal" "" \
    "doi" ""; then
    return 1
  fi

  corpus_success "Created paper note entry: $filename"

  if [[ -n "${ARG_editor:-}" ]]; then
    corpus_open_editor "$file_path" "${ARG_editor}"
  fi

  return 0
}

corpus_create_paper_with_metadata() {
  local layer="$1"
  local citation_input="$2"
  local target_dir="$3"
  local metadata="$4"

  local title="" author="" year="" journal="" doi=""

  while IFS='=' read -r key value; do
    case "$key" in
      "title") title="$value" ;;
      "author") author="$value" ;;
      "year") year="$value" ;;
      "journal") journal="$value" ;;
      "doi") doi="$value" ;;
    esac
  done <<< "$metadata"

  local citation_key="$(corpus_extract_citation_key "$citation_input")"
  local filename="$(corpus_generate_filename "$layer" "$citation_input" "paper")"
  local file_path="$target_dir/$filename"
  local template_file="$CORPUS_DIR/_template/tp-paper.md"

  # Prevent unintended overwrite unless forced
  if [[ -e "$file_path" && "${ARG_force:-}" != "true" ]]; then
    corpus_error "File already exists: $file_path"
    corpus_info "Use --force or -f to overwrite."
    return 1
  elif [[ -e "$file_path" && "${ARG_force:-}" == "true" ]]; then
    corpus_warning "Overwriting existing file: $file_path"
  fi

  if ! corpus_expand_template "$template_file" "$file_path" \
    "layer" "$(corpus_get_layer_path "$layer")" \
    "status" "${ARG_status:-${CORPUS_DEFAULT_STATUS}}" \
    "citation_key" "$citation_input" \
    "title" "$title" \
    "author" "$author" \
    "year" "$year" \
    "journal" "$journal" \
    "doi" "$doi"; then
    return 1
  fi

  corpus_success "Created paper note with metadata: $filename"
  corpus_info "Paper: $title ($year)"

  if [[ -n "${ARG_editor:-}" ]]; then
    corpus_open_editor "$file_path" "${ARG_editor}"
  fi

  return 0
}

# -----------------------
# File System Utilities (Enhanced)
# -----------------------

corpus_ensure_directory() {
  local dir="$1"

  if [[ -z "$dir" ]]; then
    corpus_error "Directory path cannot be empty"
    return 1
  fi

  # Check if it's within CORPUS_DIR for safety
  local abs_dir="$(realpath "$dir" 2> /dev/null || echo "$dir")"
  local abs_corpus="$(realpath "$CORPUS_DIR" 2> /dev/null || echo "$CORPUS_DIR")"

  if [[ "$abs_dir" != "$abs_corpus"* ]]; then
    corpus_error "Directory outside Corpus: $dir"
    return 1
  fi

  if [[ ! -d "$dir" ]]; then
    corpus_debug "Creating directory: $dir"
    if ! mkdir -p "$dir"; then
      corpus_error "Cannot create directory: $dir"
      return 1
    fi
  fi

  return 0
}

# Add alias for backward compatibility
corpus_ensure_dir() {
  corpus_ensure_directory "$@"
}
