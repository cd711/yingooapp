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

const Icon24BianjiqiYangshi4: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M896 10.666667H128A117.333333 117.333333 0 0 0 10.666667 128v768A117.333333 117.333333 0 0 0 128 1013.333333h768A117.333333 117.333333 0 0 0 1013.333333 896V128A117.333333 117.333333 0 0 0 896 10.666667z"
        fill={getIconColor(color, 0, '#121314')}
        opacity=".3"
      />
      <path
        d="M511.914667 261.333333c-25.173333 0-47.957333 14.250667-59.136 36.394667l-2.56 5.717333-165.973334 423.765334a26.026667 26.026667 0 0 0 24.192 35.456c23.466667 0 44.586667-13.44 54.613334-34.218667l2.304-5.333333 31.744-85.333334 4.992-3.456h219.648l4.992 3.456 31.744 85.333334c8.832 23.765333 31.573333 39.552 56.917333 39.552a26.026667 26.026667 0 0 0 25.173333-32.426667l-0.981333-3.029333-165.973333-423.765334a66.261333 66.261333 0 0 0-61.696-42.112z m1.834666 79.701334l5.034667 3.498666 82.261333 224.426667-5.034666 7.168h-168.192l-4.992-7.168 82.986666-224.426667 4.992-3.498666h2.986667z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon24BianjiqiYangshi4.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiYangshi4;
