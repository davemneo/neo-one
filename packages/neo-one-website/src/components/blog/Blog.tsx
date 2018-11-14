// tslint:disable-next-line no-import-side-effect
import * as React from 'react';
import { SectionData } from '../../types';
import { Author, Content } from '../content';

export interface BlogProps {
  readonly current: string;
  readonly title: string;
  readonly content: string;
  readonly date: string;
  readonly author: Author;
  readonly sidebar: ReadonlyArray<SectionData>;
}

export const Blog = (props: BlogProps) => <Content sidebarAlwaysVisible {...props} />;
