import { RootPage } from '@payloadcms/next/views';
import configPromise from '../../../../../payload.config';
import { importMap } from '../importMap';

/**
 * The Payload admin UI lives at /admin. `withPayload` regenerates
 * ../importMap.ts on every dev/build run.
 */
export default function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  return (
    <RootPage
      config={configPromise}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  );
}
