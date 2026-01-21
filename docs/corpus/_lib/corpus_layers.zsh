#!/opt/homebrew/bin/zsh
# Version: 2.0.0
# File name: corpus_layers.zsh
# Last modified: 2025-11-06 02:34:11

# Corpus layer management library - Six Layer Architecture

# Format: category|full_name|alias|path|description|requires_arg|include_date
typeset -g -r CORPUS_LAYERS_DATA='
autopsia|autopsia|aut|000_autopsia|Metacognitive dissection and optimization|false|true
ingesta|ingesta|ing|100_ingesta|Information ingestion and intake|true|true
paper|ingesta|paper|100_ingesta|Create paper entry with metadata (uses tp_rel_paper.md)|true|false
neoplasma|neoplasma|neo|200_neoplasma|Internalization and thinking|true|true
putredo|putredo|put|300_putredo|Journaling and retrospective review|false|true
delirium|delirium|del|400_delirium|Aesthetic materials and wonders|true|true
vigil|vigil|vig|500_vigil|Non-rational and semi-rational creation|false|true
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
  echo "  ing paper <citation>  - Create paper entry with metadata (uses tp_rel_paper.md)"
  echo "  [layer] --insta      - Instant note-taking mode"
}
