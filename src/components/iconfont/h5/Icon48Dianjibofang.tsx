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

const Icon48Dianjibofang: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-469.333333 0a469.333333 469.333333 0 1 0 938.666666 0 469.333333 469.333333 0 1 0-938.666666 0Z"
        fill={getIconColor(color, 0, '#000000')}
        opacity=".25"
      />
      <path
        d="M683.008 578.048l-213.610667 123.669333a64 64 0 0 1-96.064-55.381333V398.997333a64 64 0 0 1 96.064-55.381333l213.610667 123.669333a64 64 0 0 1 0 110.762667z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon48Dianjibofang.defaultProps = {
  size: 18,
};

export default Icon48Dianjibofang;
