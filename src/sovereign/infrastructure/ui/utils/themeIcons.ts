import eyeOffIcon from '@/sovereign/infrastructure/ui/assets/icons/eye-off.svg?raw';
import eyeIcon from '@/sovereign/infrastructure/ui/assets/icons/eye.svg?raw';
import moonIcon from '@/sovereign/infrastructure/ui/assets/icons/moon.svg?raw';
import sunIcon from '@/sovereign/infrastructure/ui/assets/icons/sun.svg?raw';

export const THEME_ICONS = {
    sun: sunIcon,
    moon: moonIcon,
    eye: eyeIcon,
    'eye-off': eyeOffIcon,
} as const;

export type ThemeIconName = keyof typeof THEME_ICONS;
