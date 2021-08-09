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

const Icon24BianjiqiYangshi1: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M896 10.666667A117.333333 117.333333 0 0 1 1013.333333 128v768A117.333333 117.333333 0 0 1 896 1013.333333H128A117.333333 117.333333 0 0 1 10.666667 896V128A117.333333 117.333333 0 0 1 128 10.666667z m0 64H128c-29.44 0-53.333333 23.893333-53.333333 53.333333v768c0 29.44 23.893333 53.333333 53.333333 53.333333h768c29.44 0 53.333333-23.893333 53.333333-53.333333V128c0-29.44-23.893333-53.333333-53.333333-53.333333z m-384.085333 186.666666c27.306667 0 51.754667 16.725333 61.696 42.112l165.973333 423.765334 0.981333 3.072a26.026667 26.026667 0 0 1-25.173333 32.384c-25.386667 0-48.085333-15.786667-56.917333-39.552l-31.744-85.333334-4.992-3.456H402.090667l-4.992 3.456-31.744 85.333334-2.261334 5.333333a60.714667 60.714667 0 0 1-54.613333 34.218667 26.026667 26.026667 0 0 1-24.234667-35.456l165.973334-423.765334 2.56-5.717333c11.178667-22.186667 33.962667-36.394667 59.136-36.394667z m1.834666 79.701334h-2.944l-4.992 3.456-82.986666 224.426666 4.992 7.253334h168.192l5.034666-7.210667-82.261333-224.426667-5.034667-3.498666z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiYangshi1.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiYangshi1;
