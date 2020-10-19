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

const Iconguanbi: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M472.021333 521.386667L266.154667 315.605333a34.474667 34.474667 0 1 1 48.768-48.725333l205.781333 205.824 205.866667-205.824a34.474667 34.474667 0 0 1 48.768 48.725333l-205.866667 205.866667 205.866667 205.824a34.474667 34.474667 0 0 1-48.768 48.725333l-205.824-205.824-205.824 205.824a34.474667 34.474667 0 1 1-48.768-48.725333l205.866666-205.824z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconguanbi.defaultProps = {
  size: 18,
};

export default Iconguanbi;
