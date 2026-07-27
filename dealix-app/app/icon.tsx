import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="11" fill="#10131A"/><path fill="#F8FAFC" fillRule="evenodd" d="M8 10a4 4 0 0 1 4-4h10c12 0 20 7.3 20 18s-8 18-20 18H12a4 4 0 0 1-4-4V10Zm16 7c-.7 4.5-3 6.9-7.7 8 4.7 1.1 7 3.5 7.7 8 .7-4.5 3-6.9 7.7-8-4.7-1.1-7-3.5-7.7-8Z"/></svg>, size);
}
