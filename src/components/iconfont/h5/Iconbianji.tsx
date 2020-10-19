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

const Iconbianji: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M803.114667 808.576a31.616 31.616 0 0 1 4.266666 62.976l-4.266666 0.298667H198.954667a31.616 31.616 0 0 1-4.266667-62.976l4.266667-0.298667h604.16z m-212.053334-633.6a107.136 107.136 0 0 1 156.885334 145.92l-5.290667 5.546667-43.434667 42.325333a29.44 29.44 0 0 1-13.952 16.896l-2.730666 0.938667-297.728 297.685333a122.24 122.24 0 0 1-42.453334 27.648l-8.064 2.773333-121.813333 37.461334a37.674667 37.674667 0 0 1-48.256-42.026667l1.152-5.034667 37.461333-121.856c5.034667-16.341333 13.44-31.402667 24.618667-44.245333l5.845333-6.229333L591.061333 174.933333z m-30.293333 119.722667l-282.794667 282.794666a58.965333 58.965333 0 0 0-12.714666 18.944l-1.962667 5.418667-23.296 75.648 75.648-23.253333c7.381333-2.261333 14.208-5.973333 20.138667-10.794667l4.266666-3.84 282.752-282.88-62.037333-62.037333z m79.061333-78.677334l-3.925333 3.584-30.378667 30.293334 62.08 62.08 30.378667-30.378667c10.069333-9.813333 14.72-23.765333 12.8-37.461333l-1.024-5.12a43.904 43.904 0 0 0-69.973333-22.997334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Iconbianji.defaultProps = {
  size: 18,
};

export default Iconbianji;
