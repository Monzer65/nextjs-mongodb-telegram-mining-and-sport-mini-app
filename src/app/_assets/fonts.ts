import {
  Playfair_Display,
  Merriweather,
  Quicksand,
  Lobster,
  Lora,
  Vazirmatn,
} from "next/font/google";

export const playfairDisplayForHeadings = Playfair_Display({
  weight: ["400", "900"],
  style: ["normal"],
  subsets: ["latin"],
});

export const merriWeatherForBody = Merriweather({
  weight: ["400", "700"],
  style: ["normal"],
  subsets: ["latin"],
});

export const quicksandForElements = Quicksand({
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
});

export const lobsterForLogos = Lobster({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
});

export const loraItalicForClassic = Lora({
  weight: ["400", "700"],
  style: ["italic"],
  subsets: ["latin"],
});

export const vazirmatn = Vazirmatn({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  subsets: ["arabic", "latin-ext"],
});
