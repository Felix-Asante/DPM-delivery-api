export const messages = {
  shipmentReceived: (reference: string, trackLink: string) =>
    `Hi, your package with order number: #${reference} has been received. A rider will be assigned shortly,thank you!.\n\n\nTrack order here: ${trackLink}`,
  shipmentReceivedReceiver: (reference: string, trackLink: string) =>
    `Hi, your package with order number: #${reference} has been received. A rider will be assigned shortly,thank you!.\n\n\nTrack order here: ${trackLink}`,
  riderAssigned: (
    fullName: string,
    orderNumber: string,
    deliveryArea: string,
    contactNumber: string,
    dashboardLink: string,
    fee: number,
  ) =>
    `Hi ${fullName}, You have been assigned a new order (#${orderNumber}).\n Deliver to: ${deliveryArea}.\n Contact: ${contactNumber}.\n Fee: ${fee}gh \n Please check your Dashboard (${dashboardLink}) for more details. Thank you`,
  riderAssignedUser: (reference: string) =>
    `Hi, your order (#${reference}) has been confirmed and assigned to a rider. Rider will get in touch with updates. Thanks for choosing us!`,
  riderReassigned: (fullName: string, reference: string) =>
    `Hi ${fullName}, Note that the order (#${reference}) previously assigned to you has now been reassigned. Thank you for your understanding.`,
  newOrderReceived: () =>
    `Hi, A new order has been received and is awaiting assignment for Pickup & Delivery. Please review and assign it as soon as possible!`,
  riderAccountCreated: (
    fullName: string,
    dashboardLink: string,
    phone: string,
    password: string,
  ) =>
    `Hi ${fullName}, your registration is complete! You're ready to start receiving orders now. Visit ${dashboardLink} to check your orders. Your login credentials are: Phone: ${phone}, Password: ${password}.\n\nThanks for joining DPM Deliveries!`,
  outForDelivery: (
    reference: string,
    trackingLink: string,
    code: string,
    totalCost: number,
  ) => `
  Hi, your package with order number: #${reference} is Out for Delivery. Confirmation code: ${code}
\nYour assigned delivery guy will contact you!
\nFee: ${totalCost}gh
\nTrack order here: ${trackingLink}
\n#dpmdeliveries
  `,
  delivered: (reference: string) => `
  Hi, your package with order number: #${reference} has been delivered. Thank you for choosing DPM Deliveries!
  `,
  payoutRequestedAdminMessage: (
    riderName: string,
    amount: number,
    currentBalance: number,
    requestId: string,
  ) => `
  Payout Alert: Rider ${riderName} has requested a payout of ${amount}. \nCurrent wallet balance is ${currentBalance}. \nRequest ID: ${requestId}.\n Please check and process.\n\n#dpmdeliveries
  `,
  payoutReceivedRiderMessage: (riderName: string) => `
  Hi ${riderName}, we have received your Withdrawal Request. It will be reviewed and processed as soon as possible. Thank You.\n\n#dpmdeliveries
  `,
};
