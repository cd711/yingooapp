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

const Icon16Shaixuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M762.368 176.128a60.672 60.672 0 0 1 39.936 106.368L587.072 470.528a6.72 6.72 0 0 0-2.304 5.056V851.2a60.672 60.672 0 0 1-92.032 51.968L382.08 836.48a60.736 60.736 0 0 1-29.248-51.968V474.112a6.72 6.72 0 0 0-2.048-4.736L162.176 279.68a60.672 60.672 0 0 1 43.008-103.488z m0 53.888H205.184a6.72 6.72 0 0 0-4.736 11.52l188.608 189.888a60.672 60.672 0 0 1 17.6 42.752v310.4c0 2.304 1.28 4.48 3.2 5.76l110.72 66.752a6.72 6.72 0 0 0 10.24-5.76v-375.68c0-17.536 7.616-34.24 20.8-45.76L766.72 241.92a6.72 6.72 0 0 0-4.416-11.84z m45.824 533.824a26.944 26.944 0 0 1 4.864 53.504l-4.864 0.448H673.28a26.944 26.944 0 0 1-4.8-53.504l4.8-0.448h134.848z m5.888-117.888a26.944 26.944 0 0 1 4.8 53.504l-4.8 0.384h-134.848a26.944 26.944 0 0 1-4.864-53.504l4.864-0.384h134.848z m1.28-117.952a26.944 26.944 0 0 1 4.8 53.504l-4.8 0.448h-134.848a26.944 26.944 0 0 1-4.864-53.504l4.864-0.448h134.848z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon16Shaixuan.defaultProps = {
  size: 18,
};

export default Icon16Shaixuan;
