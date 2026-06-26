#!/usr/bin/env bash

# Resolve base directory of the script (works with symlinks)
SCRIPT_PATH=$(readlink -f "${BASH_SOURCE[0]}")
DIR="$( cd "$( dirname "$SCRIPT_PATH" )" && pwd )"
CONFIG_FILE="/etc/3x-ui-theme-manager/config.json"

# Fallback to local config if /etc doesn't exist (for dev/testing)
if [[ ! -f "$CONFIG_FILE" ]]; then
    CONFIG_FILE="$DIR/config/config.json"
fi

# Source libraries
source "$DIR/lib/utils.sh"
source "$DIR/lib/ui.sh"
source "$DIR/lib/filesystem.sh"
source "$DIR/lib/api.sh"
source "$DIR/lib/validator.sh"
source "$DIR/lib/semver.sh"
source "$DIR/lib/package.sh"
source "$DIR/lib/update.sh"
source "$DIR/lib/self_update.sh"
source "$DIR/lib/build.sh"

check_dependencies

# CLI routing
if [[ $# -gt 0 ]]; then
    case "$1" in
        search)
            if [[ -z "$2" ]]; then log_error "Usage: neotemplate search <query>"; exit 1; fi
            search_packages "$2" "$CONFIG_FILE"
            ;;
        install)
            if [[ -z "$2" ]]; then log_error "Usage: neotemplate install <package_id>[@version]"; exit 1; fi
            install_package "$2" "$CONFIG_FILE"
            ;;
        remove)
            if [[ -z "$2" ]]; then log_error "Usage: neotemplate remove <package_id>"; exit 1; fi
            remove_package "$CONFIG_FILE" "$2"
            ;;
        list)
            list_installed_packages "$CONFIG_FILE"
            ;;
        upgrade)
            upgrade_packages "$CONFIG_FILE"
            ;;
        build)
            if [[ -z "$2" ]]; then log_error "Usage: neotemplate build <path-to-theme>"; exit 1; fi
            build_package "$2"
            ;;
        self-update)
            self_update "$CONFIG_FILE"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Available commands: search, install, remove, list, upgrade, build, self-update"
            exit 1
            ;;
    esac
    exit 0
fi

# Interactive TUI routing
while true; do
    show_menu
    read -p "Select an option: " choice
    case "$choice" in
        1)
            echo "Fetching available themes..."
            registry_file=$(fetch_registry "$CONFIG_FILE")
            if [[ -n "$registry_file" && -f "$registry_file" ]]; then
                mapfile -t pkg_ids < <(jq -r '.packages[].id' "$registry_file")
                mapfile -t pkg_names < <(jq -r '.packages[].name' "$registry_file")
                mapfile -t pkg_desc < <(jq -r '.packages[].description' "$registry_file")
                
                echo ""
                for i in "${!pkg_names[@]}"; do
                    echo "  $((i+1))) ${pkg_names[$i]} - ${pkg_desc[$i]}"
                done
                echo ""
                
                read -p "Select a theme to install (1-${#pkg_names[@]}): " selection
                if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#pkg_names[@]}" ]; then
                    selected_idx=$((selection-1))
                    package_id="${pkg_ids[$selected_idx]}@latest"
                    echo "Installing ${pkg_names[$selected_idx]}..."
                    install_package "$package_id" "$CONFIG_FILE"
                else
                    echo "Invalid selection or cancelled."
                fi
            else
                echo "Failed to load themes from registry. Please check your internet connection."
            fi
            read -p "Press enter to continue..."
            ;;
        2)
            upgrade_packages "$CONFIG_FILE"
            read -p "Press enter to continue..."
            ;;
        3)
            list_installed_packages "$CONFIG_FILE"
            read -p "Press enter to continue..."
            ;;
        4)
            echo "Installed Packages:"
            install_dir=$(get_config_val "installDirectory" "$CONFIG_FILE")
            if [[ -d "$install_dir" ]]; then
                mapfile -t installed_dirs < <(find "$install_dir" -mindepth 1 -maxdepth 1 -type d)
                if [[ ${#installed_dirs[@]} -eq 0 ]]; then
                    echo "No packages installed."
                else
                    for i in "${!installed_dirs[@]}"; do
                        dir="${installed_dirs[$i]}"
                        if [[ -f "$dir/manifest.json" ]]; then
                            id=$(jq -r '.id' "$dir/manifest.json")
                            name=$(jq -r '.name' "$dir/manifest.json")
                            echo "  $((i+1))) $name ($id)"
                        fi
                    done
                    echo ""
                    read -p "Select a package to remove (1-${#installed_dirs[@]}): " r_sel
                    if [[ "$r_sel" =~ ^[0-9]+$ ]] && [ "$r_sel" -ge 1 ] && [ "$r_sel" -le "${#installed_dirs[@]}" ]; then
                        sel_dir="${installed_dirs[$((r_sel-1))]}"
                        pkg_id=$(jq -r '.id' "$sel_dir/manifest.json")
                        if [[ -n "$pkg_id" ]]; then
                            remove_package "$CONFIG_FILE" "$pkg_id"
                        fi
                    else
                        echo "Invalid selection or cancelled."
                    fi
                fi
            else
                echo "No packages installed."
            fi
            read -p "Press enter to continue..."
            ;;
        5)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid option."
            sleep 1
            ;;
    esac
done
