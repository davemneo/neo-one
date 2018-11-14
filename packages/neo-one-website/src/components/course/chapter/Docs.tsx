import * as React from 'react';
import { Grid, styled } from 'reakit';
import { prop } from 'styled-tools';
import { Markdown } from '../common';
import { selectChapter } from '../coursesData';
import { SelectedChapter } from '../types';
import { DocsFooter } from './DocsFooter';

const Wrapper = styled(Grid)`
  background-color: ${prop('theme.black')};
  grid-template:
    'docs' 1fr
    'footer' auto
    / auto;
  grid-gap: 0;
  min-height: 0;
  min-width: 0;
`;

const StyledMarkdown = styled(Markdown)`
  background-color: ${prop('theme.black')};
  min-height: 0;
  overflow-y: scroll;
`;

interface Props {
  readonly selected: SelectedChapter;
}

export const Docs = ({ selected, ...props }: Props) => (
  <Wrapper {...props}>
    <StyledMarkdown source={selectChapter(selected).documentation} openAllLinksInNewTab resetScroll />
    <DocsFooter selected={selected} />
  </Wrapper>
);
