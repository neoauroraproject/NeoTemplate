#!/usr/bin/env bash

draw_header() {
    clear
    echo -e "${BLUE}NeoTemplate - Package Manager${NC}"
    echo "─────────────────────"
}

show_menu() {
    draw_header
    echo "1) Install Package"
    echo "2) Upgrade Packages"
    echo "3) Installed Packages"
    echo "4) Remove Package"
    echo "5) Exit"
    echo
}

draw_progress() {
    local text="$1"
    echo -e "${YELLOW}${text}...${NC}"
}

show_install_success_message() {
    local theme_name="$1"
    local install_path="$2"
    
    local BG_BLUE="\033[44;1;37m"
    local BOLD_YELLOW="\033[1;33m"
    local RESET="\033[0m"
    
    echo ""
    echo "────────────────────────────────────────────────────────"
    echo -e "${GREEN}🎉 THEME INSTALLED SUCCESSFULLY! 🎉${NC}"
    echo "────────────────────────────────────────────────────────"
    echo ""
    echo "Theme Name : $theme_name"
    echo ""
    echo -e "${BOLD_YELLOW}========================================================${RESET}"
    echo -e "${BOLD_YELLOW}⚠️  CRITICAL FINAL STEP ⚠️${RESET}"
    echo -e "${BOLD_YELLOW}========================================================${RESET}"
    echo "You MUST apply this theme in your 3x-ui panel settings!"
    echo ""
    echo "1. Open your 3x-ui panel"
    echo "2. Go to: Panel Settings -> Subscription -> Sub Theme Directory"
    echo "3. Copy the exact path below and paste it into the box:"
    echo ""
    echo -e "${BG_BLUE}                                                        ${RESET}"
    echo -e "${BG_BLUE}   ${install_path}/   ${RESET}"
    echo -e "${BG_BLUE}                                                        ${RESET}"
    echo ""
    echo -e "Don't forget to click ${GREEN}Save${NC} in the panel!"
    echo -e "${BOLD_YELLOW}========================================================${RESET}"
    echo ""
}
