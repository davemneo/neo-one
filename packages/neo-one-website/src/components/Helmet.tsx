// tslint:disable no-null-keyword
import * as React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet';

interface Props {
  readonly title: string;
  readonly description?: string;
  readonly children?: React.ReactNode;
}

export const Helmet = ({ title, description, children, ...props }: Props) => (
  <ReactHelmet {...props}>
    <title>{title}</title>
    {/*
    // @ts-ignore */}
    <meta itemprop="name" content={title} />
    <meta name="twitter:title" content={title} />
    <meta name="og:title" content={title} />
    {description === undefined ? null : <meta name="description" content={description} />}
    {description === undefined ? null : <meta name="og:description" content={description} />}
    {description === undefined ? null : <meta name="twitter:description" content={description} />}
    {/*
    // @ts-ignore */}
    {description === undefined ? null : <meta itemprop="description" content={description} />}
    <meta name="image" content="https://neo-one.io/social.png" />
    {/*
    // @ts-ignore */}
    <meta itemprop="image" content="https://neo-one.io/social.png" />
    <meta name="twitter:image:src" content="https://neo-one.io/social.png" />
    <meta name="og:image" content="https://neo-one.io/social.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@neo_one_suite" />
    <meta name="og:url" content="https://neo-one.io" />
    <meta name="og:site_name" content="NEO•ONE" />
    <meta name="og:type" content="website" />
    {children}
  </ReactHelmet>
);
