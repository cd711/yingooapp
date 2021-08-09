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

const Icon20Congyunduanxiazai: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".4"
      />
      <path
        d="M512 227.84a38.4 38.4 0 0 1 38.0416 33.1776l0.3584 5.2224v398.7456l180.224-180.1216a38.4 38.4 0 0 1 49.9712-3.7376l4.3008 3.7376a38.4 38.4 0 0 1 3.7376 49.9712l-3.7376 4.3008-245.76 245.76a38.6048 38.6048 0 0 1-4.1472 3.6352l4.1472-3.584a38.5536 38.5536 0 0 1-43.7248 7.4752 36.1472 36.1472 0 0 1-10.5472-7.5264l-245.76-245.76a38.4 38.4 0 0 1 49.9712-58.0096l4.3008 3.7376 180.224 180.1216V266.24a38.4 38.4 0 0 1 38.4-38.4z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon20Congyunduanxiazai.defaultProps = {
  size: 18,
};

export default Icon20Congyunduanxiazai;
