// src/vite-env.d.ts
/// <reference types="vite/client" />

// Add CSS module declarations
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image declarations
declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ELECTION_START_DATE: string;
  readonly VITE_ELECTION_END_DATE: string;
  readonly VITE_SESSION1_START: string;
  readonly VITE_SESSION1_END: string;
  readonly VITE_SESSION2_START: string;
  readonly VITE_SESSION2_END: string;
  readonly VITE_SESSION3_START: string;
  readonly VITE_SESSION3_END: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
