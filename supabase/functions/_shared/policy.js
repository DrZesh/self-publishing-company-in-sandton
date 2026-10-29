export const staffRoles = ['admin', 'super_user'];
export const publicActions = {
  quoteActions: ['get_public', 'respond', 'generate_pdf'], invoiceActions: ['get_public'],
  contractSignature: ['get_by_token', 'sign', 'signing_started'],
  eSignatureActions: ['track_open', 'signing_started', 'submit_signature', 'decline', 'get_request'],
  appointmentActions: ['get_by_cancel_token', 'cancel_by_client'],
  documentActions: ['track_view', 'track_download', 'client_action'],
};
export const publicForms = ['captureFormSubmission', 'createBookingRequest', 'getAvailableSlots', 'fetchGoogleReviews', 'checkCoverErrors'];
export const portalActions = {
  clientPortalData: ['load', 'access', 'mark_messages_read', 'accept_quote', 'decline_quote', 'download_invoice', 'download_receipt'],
  portalMessages: ['list', 'send', 'mark_read'],
  portalAppointments: ['get_my_appointments', 'get_available_slots', 'create_appointment', 'cancel_appointment'],
  fileUploadActions: ['upload_file', 'upload_payment_proof'], proofApprovalActions: ['approve', 'request_changes'],
};
export function accessMode(name, action, role, internal = false) {
  if (['adminConfirmWorkflow', 'autoCreatePortalAccess'].includes(name)) return internal || ['admin', 'super_user'].includes(role) ? 'staff' : 'deny';
  if (internal || staffRoles.includes(role)) return 'staff';
  if (publicForms.includes(name)) return 'form';
  if (publicActions[name]?.includes(action)) return 'document';
  if (portalActions[name]?.includes(action)) return 'portal';
  if (name === 'platform-upload' || name === 'platform-file') return 'file';
  if (['portalUploads', 'portalReviews'].includes(name) && role) return 'client';
  return 'deny';
}
export function safeRedirect(value, origin) {
  const target = new URL(value || '/', origin);
  return target.origin === origin ? target.pathname + target.search : '/';
}
