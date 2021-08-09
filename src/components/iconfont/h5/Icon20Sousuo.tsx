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

const Icon20Sousuo: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M480.4096 96a384.4096 384.4096 0 0 1 295.5776 630.1696l109.6192 112.8448a35.2256 35.2256 0 1 1-50.432 49.1008l-109.0048-112.128a384.4096 384.4096 0 1 1-245.76-679.936z m0 70.4a314.0096 314.0096 0 1 0 0 628.0192 314.0096 314.0096 0 0 0 0-628.0192z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Sousuo.defaultProps = {
  size: 18,
};

export default Icon20Sousuo;
