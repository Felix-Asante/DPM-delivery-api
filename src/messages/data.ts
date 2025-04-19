export const messages = {
  shipmentReceived: (reference: string, trackLink: string) =>
    `Hi, your order (#${reference}) has been received. A rider will be assigned shortly,thank you!.\n\n\nTrack order here: ${trackLink}`,
};
