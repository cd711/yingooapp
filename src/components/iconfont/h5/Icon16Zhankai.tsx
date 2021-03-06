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

const Icon16Zhankai: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M561.92 641.536l122.88-153.6A64 64 0 0 0 634.88 384H389.12a64 64 0 0 0-49.92 104l122.88 153.536a64 64 0 0 0 99.84 0z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon16Zhankai.defaultProps = {
  size: 18,
};

export default Icon16Zhankai;
