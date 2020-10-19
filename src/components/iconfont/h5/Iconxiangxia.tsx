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

const Iconxiangxia: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M490.24 702.933333a34.474667 34.474667 0 0 1-23.893333-10.410666L138.666667 357.888a34.602667 34.602667 0 0 1 49.450666-48.426667l304.085334 310.528 334.762666-311.68a34.645333 34.645333 0 1 1 47.146667 50.730667l-359.466667 334.634667a34.474667 34.474667 0 0 1-24.448 9.258666h0.085334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconxiangxia.defaultProps = {
  size: 18,
};

export default Iconxiangxia;
