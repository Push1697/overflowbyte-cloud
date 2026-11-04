import { GRAPHQL_PLAYGROUND_GET, GRAPHQL_POST } from '@payloadcms/next/routes';
import configPromise from '../../../../../payload.config';

/** Payload GraphQL API at /api/graphql (playground on GET). */
export const GET = GRAPHQL_PLAYGROUND_GET(configPromise);
export const POST = GRAPHQL_POST(configPromise);
