import React from 'react';
import '@payloadcms/next/css';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import type { ServerFunctionClient } from 'payload';
import configPromise from '../../../payload.config';
import { importMap } from './admin/importMap';

/**
 * Root layout for the (payload) route group — the admin panel and the
 * REST/GraphQL APIs. The site has its own root layout in (site); the two
 * groups never nest, because Payload's RootLayout renders its own <html>.
 */

// The admin's client components call back into the server through this, so it
// must be a server action rather than a plain function.
const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({ ...args, config: configPromise, importMap });
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
