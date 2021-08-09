/* tslint:disable */
/* eslint-disable */

import { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
import { getIconColor } from './helper';

interface Props extends DOMAttributes<SVGElement> {
  size?: number;
  color?: string | string[];
  style?: CSSProperties;
  className?: string;
}

const DEFAULT_STYLE: CSSProperties = {
  display: 'block',
};

const Icon32Guanbi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".25"
      />
      <path
        d="M466.016 503.04l-154.4-154.368a25.856 25.856 0 1 1 36.576-36.544l154.336 154.368 154.4-154.368a25.856 25.856 0 0 1 36.576 36.544l-154.4 154.4 154.4 154.368a25.856 25.856 0 0 1-36.576 36.544l-154.368-154.368-154.368 154.368a25.856 25.856 0 1 1-36.576-36.544l154.4-154.368z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon32Guanbi.defaultProps = {
  size: 18,
};

export default Icon32Guanbi;
