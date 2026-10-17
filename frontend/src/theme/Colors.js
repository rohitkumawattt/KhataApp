// constants/colors.js

export const Colors = {
    // Light Theme Palette
    light: {
        // Primary Brand Colors (Ocean Teal Blue Theme)
        primary: '#0EA5E9',         // Main Brand Blue (Buttons, Active States)
        primaryHover: '#0284C7',    // Darker Blue for Presses/Hovers
        primaryLight: '#E0F2FE',   // Light Blue tint for backgrounds/chips

        // Backgrounds & Surfaces
        background: '#F8FAFC',     // App Main Screen Background
        surface: '#FFFFFF',        // Cards, Modals, Header background
        surfaceSubtle: '#F1F5F9',  // Input fields, Search bars background

        // Typography / Text Colors
        textPrimary: '#0F172A',    // Main Headings & Important Text
        textSecondary: '#475569',  // Subtitles, Dates, Labels
        textMuted: '#94A3B8',      // Placeholder text, Disabled items

        // Financial Status Indicators (Khata Specific)
        amountGet: '#059669',      // Lene Hai (Positive Balance / Emerald Green)
        amountGetBg: '#D1FAE5',    // Background for Lene Hai badge
        amountGive: '#E11D48',     // Dene Hai (Negative Balance / Rose Red)
        amountGiveBg: '#FFE4E6',   // Background for Dene Hai badge

        // UI Elements & Borders
        border: '#E2E8F0',         // Divider lines, Card borders
        icon: '#808080',           // Inactive icons
        iconActive: '#0EA5E9',     // Active tab icons
        danger: '#bb2124',
        disable: "#D6D6D6"
    },

    // Dark Theme Palette
    dark: {
        // Primary Brand Colors
        primary: '#38BDF8',         // Bright Sky Blue (Pop on dark background)
        primaryHover: '#0EA5E9',
        primaryLight: '#075985',    // Dark Blue tint for active chips

        // Backgrounds & Surfaces
        background: '#0F172A',     // Deep Slate/Charcoal App Background
        surface: '#1E293B',        // Dark Card & Modal Surfaces
        surfaceSubtle: '#334155',  // Dark Input fields & Search bar

        // Typography / Text Colors
        textPrimary: '#F8FAFC',    // Bright White for Headings
        textSecondary: '#94A3B8',  // Soft Gray for Subtitles
        textMuted: '#64748B',      // Dimmed text

        // Financial Status Indicators (Khata Specific)
        amountGet: '#34D399',      // Bright Emerald Green for dark mode
        amountGetBg: '#064E3B',    // Dark Green tint background
        amountGive: '#FB7185',     // Bright Rose Red for dark mode
        amountGiveBg: '#881337',   // Dark Red tint background

        // UI Elements & Borders
        border: '#334155',         // Dark dividers
        icon: '#94A3B8',           // Inactive icons
        iconActive: '#38BDF8',     // Active tab icons
        danger: '#bb2124',
    }
};

export default Colors;