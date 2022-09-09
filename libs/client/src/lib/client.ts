import { Configuration, DefaultApi, DefaultApiFactory } from '@myin/openapi';

export function client(): string {
  new DefaultApi(new Configuration({ apiKey: '' }))
  return 'client';
}
