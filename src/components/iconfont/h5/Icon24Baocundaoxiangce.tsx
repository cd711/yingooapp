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

const Icon24Baocundaoxiangce: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M739.84 175.872c72.192 0 130.645333 58.453333 130.645333 130.645333v481.237334a130.645333 130.645333 0 0 1-130.602666 130.602666H258.56A130.645333 130.645333 0 0 1 128 787.754667V306.474667c0-72.106667 58.453333-130.56 130.645333-130.56a27.52 27.52 0 1 1 0 54.954666c-41.813333 0-75.648 33.877333-75.648 75.648v481.237334c0 41.770667 33.877333 75.605333 75.648 75.605333H739.84c41.770667 0 75.605333-33.834667 75.605333-75.605333V306.474667c0-41.728-33.834667-75.605333-75.605333-75.605334a27.52 27.52 0 1 1 0-54.997333z m-246.570667-68.736c15.189333 0 27.52 12.288 27.52 27.477333l-0.426666 476.842667 136.405333-132.053333a27.52 27.52 0 0 1 35.541333-2.304l3.328 2.944a27.52 27.52 0 0 1-0.64 38.912l-171.136 165.632a44.672 44.672 0 0 1-61.909333 0.256l-173.909333-165.717334a27.52 27.52 0 0 1 37.973333-39.850666l139.349333 132.821333 0.426667-477.44c0-13.824 10.154667-25.258667 23.424-27.221333z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Baocundaoxiangce.defaultProps = {
  size: 18,
};

export default Icon24Baocundaoxiangce;
