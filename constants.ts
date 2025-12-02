import { CustomerSource, OrderStatus } from "./types";

export const SOURCE_COLORS = {
  [CustomerSource.XiaoHongShu]: '#ff2442',
  [CustomerSource.TikTok]: '#00f2ea',
  [CustomerSource.Facebook]: '#1877f2',
  [CustomerSource.Instagram]: '#c13584',
  [CustomerSource.Amazon]: '#ff9900',
  [CustomerSource.Other]: '#94a3b8'
};

export const STATUS_COLORS = {
  [OrderStatus.Pending]: 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  [OrderStatus.Paid]: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
  [OrderStatus.Shipped]: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
  [OrderStatus.Delivered]: 'text-green-400 border-green-500/50 bg-green-500/10',
  [OrderStatus.Cancelled]: 'text-red-400 border-red-500/50 bg-red-500/10',
};

export const PROMO_PRESETS = [
  // General / Amazon
  { label: "Prime Day Deal", value: "PRIME DAY" },
  { label: "Black Friday", value: "BLACK FRIDAY" },
  { label: "Cyber Monday", value: "CYBER MONDAY" },
  { label: "Lightning Deal", value: "LIGHTNING DEAL" },
  { label: "Clearance", value: "CLEARANCE 50%" },
  // TikTok / Social
  { label: "Summer Sale", value: "SUMMER SALE" },
  { label: "New Arrival Promo", value: "NEW ARRIVAL -20%" },
  { label: "Live Exclusive", value: "LIVE EXCLUSIVE" },
  { label: "Flash Sale", value: "FLASH SALE" },
  // Seasonal
  { label: "Xmas Special", value: "XMAS SPECIAL" },
  { label: "New Year", value: "NEW YEAR SALE" },
  { label: "Valentine's", value: "VALENTINE" },
  { label: "Back to School", value: "BACK 2 SCHOOL" },
];