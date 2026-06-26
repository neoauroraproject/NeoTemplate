#!/usr/bin/env bash

fetch_repository() {
    local repo_url="$1"
    local cache_file="$2"
    local timestamp=$(date +%s)
    curl -sSL "${repo_url}?t=${timestamp}" -o "$cache_file"
    if [[ $? -ne 0 ]]; then
        log_error "Failed to fetch repository data."
        return 1
    fi
}

download_theme() {
    local theme_url="$1"
    local output_file="$2"
    curl -sSL "$theme_url" -o "$output_file"
    if [[ $? -ne 0 ]]; then
        log_error "Failed to download theme."
        return 1
    fi
}

# Fetch the single registry.json file on-the-fly
fetch_registry() {
    local config_file="$1"
    local repo_url=$(get_config_val "repositoryUrl" "$config_file")
    local cache_dir=$(get_config_val "cacheDirectory" "$config_file")
    local registry_file="$cache_dir/registry.json"
    
    safe_create_dir "$cache_dir"
    
    fetch_repository "$repo_url" "$registry_file"
    if [[ $? -eq 0 ]]; then
        echo "$registry_file"
    else
        return 1
    fi
}

search_packages() {
    local query="$1"
    local config_file="$2"
    
    local registry_file=$(fetch_registry "$config_file")
    if [[ -z "$registry_file" || ! -f "$registry_file" ]]; then
        log_error "Failed to load registry."
        return 1
    fi
    
    echo -e "${BLUE}Search Results for '$query':${NC}"
    
    jq -r --arg q "$query" '.packages[] | select(.name | test($q; "i")) | "\(.id) (v\(.latest)) - \(.description)"' "$registry_file"
}
