export const messages = {
  shipmentReceived: (reference: string, trackLink: string) =>
    `Hi, your order (#${reference}) has been received. A rider will be assigned shortly,thank you!.\n\n\nTrack order here: ${trackLink}`,
  shipmentReceivedReceiver: (reference: string, trackLink: string) =>
    `Hi, your order (#${reference}) has been received. A rider will be assigned shortly,thank you!.\n\n\nTrack order here: ${trackLink}`,
  riderAssigned: (fullName: string, reference: string) =>
    `Hi ${fullName}, You have been assigned a new order. (#${reference}). Please check your Dashboard for pickup and delivery details. Thank you`,
  riderAssignedUser: (reference: string) =>
    `Hi, your order (#${reference}) has been confirmed and assigned to a rider. Rider will get in touch with updates. Thanks for choosing us!`,
  riderReassigned: (fullName: string, reference: string) =>
    `Hi ${fullName}, Note that the order (#${reference}) previously assigned to you has now been reassigned. Thank you for your understanding.`,
  newOrderReceived: () =>
    `Hi, A new order has been received and is awaiting assignment for Pickup & Delivery. Please review and assign it as soon as possible!`,
  riderAccountCreated: (fullName: string) =>
    `Hi ${fullName}, your registration is complete! You're ready to start receiving orders now. Visit www.dpmdelivery.com/riders to check your orders. Thanks for joining DPM Deliveries!`,
};
