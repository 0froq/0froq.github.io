#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus_layers.zsh
# Last modified: 2026-04-26 14:08:31

# Corpus layer management library - Six Layer Architecture

# Format: category|full_name|alias|path|description|requires_arg|include_date
typeset -g -r CORPUS_LAYERS_DATA='
autopsia|autopsia|aut|000-autopsia|Metacognitive/system dissection, not a capture inbox|false|true
ingesta|ingesta|ing|100-ingesta|Stable external source registry|true|false
paper|ingesta|paper|100-ingesta|Create paper source entry with metadata|true|false
neoplasma|neoplasma|neo|200-neoplasma|New thoughts, claims, questions, models, and designs|true|false
putredo|putredo|put|300-putredo|Practice, execution, failure, and reality friction|false|true
delirium|delirium|del|400-delirium|Aesthetic and non-rational materials|true|true
vigil|vigil|vig|500-vigil|Existential anchors and living evidence|false|true
'

# -----------------------
# Layer System Functions
# -----------------------

corpus_find_layer() {
  local search_layer="$1"
  local field="${2:-all}"

  while IFS='|' read -r category full_name alias path description requires_arg include_date; do
    [[ -z "$category" ]] && continue

    if [[ "$full_name" == "$search_layer" || "$alias" == "$search_layer" ]]; then
      case "$field" in
        "path") echo "$path" ;;
        "description") echo "$description" ;;
        "requires_arg") echo "$requires_arg" ;;
        "include_date") echo "$include_date" ;;
        "alias") echo "$alias" ;;
        "full_name") echo "$full_name" ;;
        "category") echo "$category" ;;
        "all") echo "$category|$full_name|$alias|$path|$description|$requires_arg|$include_date" ;;
      esac
      return 0
    fi
  done <<< "$CORPUS_LAYERS_DATA"

  return 1
}

corpus_layer_exists() {
  corpus_find_layer "$1" "alias" > /dev/null 2>&1
}

corpus_get_layer_path() {
  corpus_find_layer "$1" "path"
}

corpus_layer_requires_arg() {
  local requires_arg="$(corpus_find_layer "$1" "requires_arg")"
  [[ "$requires_arg" == "true" ]]
}

corpus_layer_include_date() {
  local include_date="$(corpus_find_layer "$1" "include_date")"
  [[ "$include_date" == "true" ]]
}

corpus_normalize_layer() {
  corpus_find_layer "$1" "alias"
}

corpus_get_layer_suggestions() {
  local partial="$1"
  while IFS='|' read -r category full_name alias path description requires_arg include_date; do
    [[ -z "$category" ]] && continue
    if [[ "$full_name" == "$partial"* || "$alias" == "$partial"* ]]; then
      echo "$alias"
    fi
  done <<< "$CORPUS_LAYERS_DATA"
}

corpus_list_layers() {
  echo "Available Layers (Six-Layer Architecture):"
  echo
  echo "Core Layers:"

  while IFS='|' read -r category full_name alias path description requires_arg include_date; do
    [[ -z "$category" ]] && continue

    local display_name
    if [[ "$full_name" == "$alias" ]]; then
      display_name="$alias"
    else
      display_name="$full_name ($alias)"
    fi

    local content_req=""
    [[ "$requires_arg" == "true" ]] && content_req=" [requires content]"

    local date_info=""
    [[ "$include_date" == "false" ]] && date_info=" [no date]"

    printf "  %-20s - %s%s%s\n" "$display_name" "$description" "$content_req" "$date_info"
  done <<< "$CORPUS_LAYERS_DATA"

  echo
  echo "Special Commands:"
  echo "  ing paper <citation>  - Create paper source entry with metadata"
  echo "  [layer] --insta      - Instant note-taking mode; add #capture when unresolved"
}
