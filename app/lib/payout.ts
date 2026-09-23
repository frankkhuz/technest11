// A seller's bank payout destination, stored locally (Mongo) and mirrored to
// a Paystack subaccount so marketplace-listing sales can be split
// automatically: the buyer pays one charge, Paystack routes the seller's
// price straight to their bank and TechNest's fee to the platform account.

export type PayoutAccount = {
  userId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  subaccountCode: string;
  createdAt: string;
  updatedAt: string;
};
