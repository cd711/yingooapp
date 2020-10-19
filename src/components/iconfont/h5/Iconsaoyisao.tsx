/* tslint:disable */
/* eslint-disable */

import React, { CSSProperties, DOMAttributes, FunctionComponent } from 'react';
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

const Iconsaoyisao: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M166.826667 410.197333a29.994667 29.994667 0 1 1-59.989334 0v-171.093333a132.266667 132.266667 0 0 1 132.266667-132.266667h171.733333a29.994667 29.994667 0 1 1 0 59.989334H239.104A72.277333 72.277333 0 0 0 166.826667 239.104v171.093333zM615.04 166.826667a29.994667 29.994667 0 1 1 0-59.989334h169.514667a132.266667 132.266667 0 0 1 132.266666 132.266667v171.178667a29.994667 29.994667 0 1 1-59.989333 0V239.104a72.277333 72.277333 0 0 0-72.277333-72.277333h-169.514667z m241.792 448.426666a29.994667 29.994667 0 1 1 59.989333 0v169.301334a132.266667 132.266667 0 0 1-132.266666 132.266666h-167.893334a29.994667 29.994667 0 1 1 0-59.989333h167.893334a72.277333 72.277333 0 0 0 72.277333-72.277333V615.253333zM412.074667 856.789333a29.994667 29.994667 0 1 1 0 59.989334H239.061333a132.266667 132.266667 0 0 1-132.266666-132.266667v-170.069333a29.994667 29.994667 0 1 1 60.032 0v170.069333c0 39.936 32.384 72.277333 72.277333 72.277333h172.970667z m-142.165334-315.008h490.88a29.994667 29.994667 0 0 0 0-59.989333H269.909333a29.994667 29.994667 0 0 0 0 59.989333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconsaoyisao.defaultProps = {
  size: 18,
};

export default Iconsaoyisao;
