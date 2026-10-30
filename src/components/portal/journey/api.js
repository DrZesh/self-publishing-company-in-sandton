// Client portal calls for booking collection/delivery and sending files.
import { platform } from '@/api/platformClient';

async function call(token, action, body = {}) {
  const res = await platform.functions.invoke('portalBooking', { action, access_token: token, ...body });
  const data = res?.data ?? res;
  if (data?.error) throw new Error(data.error);
  return data;
}

export const journeyApi = {
  month: (token, kind, from, to) => call(token, 'month', { kind, from, to }).then((d) => d.days || {}),
  mine: (token) => call(token, 'mine').then((d) => d.bookings || []),
  request: (token, b) => call(token, 'request', b),
  cancel: (token, id) => call(token, 'cancel', { appointment_id: id }),
  async upload(token, file, purpose, note) {
    const up = await platform.integrations.Core.UploadFile({ file });
    if (!up?.file_url) throw new Error(up?.error || 'Upload failed. Please try again.');
    return call(token, 'uploaded', { file_url: up.file_url, file_name: file.name, purpose, note });
  },
};
