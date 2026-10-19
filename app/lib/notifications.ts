import {
  Wallet,
  Repeat,
  ShoppingBag,
  RefreshCcw,
  PackageCheck,
  CheckCheck,
  CheckCircle2,
  Send,
  Tag,
  MessageCircle,
  ClipboardList,
  BadgeCheck,
  ShieldCheck,
  Star,
  Scale,
  ShieldAlert,
  Megaphone,
  Bell,
  type LucideIcon,
} from "lucide-react";

export type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  listing?: string;
  listingId?: string;
  transaction?: string;
  order?: string;
  orderRequest?: string;
  deviceRequest?: string;
  dispute?: string;
};

export const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  bid_placed: Wallet,
  new_swap_request: Repeat,
  new_cash_listing: Tag,
  swap_request: Repeat,
  buy_request: ShoppingBag,
  transaction_update: RefreshCcw,
  order_paid: PackageCheck,
  listing_sold: CheckCheck,
  offer_accepted: CheckCircle2,
  offer_update: RefreshCcw,
  offer_received: Wallet,
  device_request: Send,
  order_request: MessageCircle,
  listing_update: ClipboardList,
  account_update: BadgeCheck,
  identity_update: ShieldCheck,
  review_request: Star,
  review_received: Star,
  dispute_update: Scale,
  stolen_device_alert: ShieldAlert,
  stolen_report_update: ShieldAlert,
  announcement: Megaphone,
  admin_alert: Bell,
};

/** Types that are warnings rather than good news — drawn in red. */
export const ALERT_NOTIFICATION_TYPES = new Set(["stolen_device_alert", "dispute_update", "admin_alert"]);

type Viewer = { userType?: string; isAdmin?: boolean } | null | undefined;

/** Where tapping a notification should take this person. */
export function notificationHref(n: AppNotification, viewer: Viewer): string | undefined {
  const isVendor = viewer?.userType === "vendor";
  const listingId = n.listing ?? n.listingId;
  switch (n.type) {
    case "device_request":
    case "offer_received":
    case "offer_accepted":
    case "offer_update":
      if (isVendor && n.type !== "offer_received") {
        return n.deviceRequest ? `/b2b?request=${n.deviceRequest}` : "/b2b";
      }
      return n.deviceRequest ? `/requests/${n.deviceRequest}` : "/requests";
    case "order_request":
      return viewer?.isAdmin ? "/admin?section=whatsapp" : "/orders";
    case "listing_update":
    case "bid_placed":
      return listingId ? `/user#listing-${listingId}` : "/user";
    case "account_update":
      return isVendor ? "/dashboard" : "/account";
    case "identity_update":
      return "/account/verify";
    case "review_request":
      return "/reviews";
    case "review_received":
      return "/reviews?tab=mine";
    case "dispute_update":
      return n.dispute ? `/disputes/${n.dispute}` : "/disputes";
    case "stolen_device_alert":
    case "stolen_report_update":
      return "/imei?tab=reports";
    case "admin_alert":
      return "/admin";
    case "new_cash_listing":
    case "new_swap_request":
      return isVendor ? "/dashboard" : "/marketplace";
    case "order_paid":
      return "/orders";
    case "swap_request":
    case "buy_request":
    case "transaction_update":
    case "listing_sold":
      return "/transactions";
    case "announcement":
      return "/notifications";
    default:
      if (n.deviceRequest) return `/requests/${n.deviceRequest}`;
      if (n.orderRequest) return "/orders";
      if (n.transaction) return "/transactions";
      if (n.order) return "/orders";
      return undefined;
  }
}
