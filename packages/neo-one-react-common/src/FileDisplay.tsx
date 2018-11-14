import * as nodePath from 'path';
import * as React from 'react';
import { Grid, styled } from 'reakit';
import { FileIcon } from './FileIcon';
import { File } from './types';

const GridWrapper = styled(Grid)`
  grid-auto-flow: column;
  gap: 4px;
  align-items: start;
`;

const StyledFileIcon = styled(FileIcon)`
  height: 16px;
  width: 16px;
`;

interface Props {
  readonly file: File;
  readonly omitReadOnly?: boolean;
}

export const FileDisplay = ({ file, omitReadOnly, ...props }: Props) => (
  <GridWrapper {...props}>
    <StyledFileIcon path={file.path} />
    {`${nodePath.basename(file.path)}${omitReadOnly || file.writable ? '' : ' (read-only)'}`}
  </GridWrapper>
);
