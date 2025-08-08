/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const yellow = '#FFD600'; // Modern yellow
const red = '#E53935'; // Modern red
const white = '#FFFFFF';
const gray = '#F5F5F5'; // Light gray background
const borderGray = '#BDBDBD'; // Subtle border
const mutedGray = '#757575'; // Muted text
const black = '#111111'; // Text color

export const Colors = {
  light: {
    text: black,
    background: white,
    tint: red,
    icon: mutedGray,
    tabIconDefault: borderGray,
    tabIconSelected: red,
    primary: red,
    yellow: yellow,
    red: red,
    white: white,
    gray: gray,
    border: borderGray,
    muted: mutedGray,
    card: white,
  },
  dark: {
    text: white,
    background: '#18181B',
    tint: red,
    icon: borderGray,
    tabIconDefault: borderGray,
    tabIconSelected: red,
    primary: red,
    yellow: yellow,
    red: red,
    white: white,
    gray: '#23232B',
    border: borderGray,
    muted: mutedGray,
    card: '#23232B',
  },
};
