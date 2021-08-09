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

const Icon20Maikefeng: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M377.1904 888.064a33.5872 33.5872 0 0 1-4.9664-66.816l4.9664-0.3584 93.7984-0.0512v-62.3616a256.6656 256.6656 0 0 1-222.72-243.3024l-0.256-11.1616V440.32a33.5872 33.5872 0 0 1 66.816-4.9664l0.3584 4.9664v63.6928a189.44 189.44 0 0 0 378.5728 10.0864l0.256-10.0864V440.32a33.5872 33.5872 0 0 1 66.816-4.9664l0.3584 4.9664v63.6928a256.6656 256.6656 0 0 1-222.9248 254.464l-0.0512 62.3616h93.7984a33.5872 33.5872 0 0 1 4.9664 66.8672l-4.9664 0.3584H377.1904zM504.6272 120.0128a129.1776 129.1776 0 0 1 129.1264 129.1776v254.8224a129.1776 129.1776 0 1 1-258.304 0V249.1904a129.1776 129.1776 0 0 1 129.1776-129.1776z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon20Maikefeng.defaultProps = {
  size: 18,
};

export default Icon20Maikefeng;
