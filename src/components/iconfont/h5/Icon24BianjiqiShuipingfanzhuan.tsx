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

const Icon24BianjiqiShuipingfanzhuan: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 130.688c14.72 0 26.88 10.837333 29.013333 24.96l0.341334 4.352v704a29.312 29.312 0 0 1-58.368 4.352l-0.341334-4.352V160c0-16.213333 13.141333-29.354667 29.354667-29.354667zM329.813333 263.253333c14.506667-26.666667 55.04-16.341333 55.04 14.037334v430.208c0 16.213333-13.098667 29.354667-29.312 29.354666h-234.666666a29.312 29.312 0 0 1-25.728-43.392z m309.333334 14.037334c0-30.378667 40.533333-40.704 55.04-14.08l234.666666 430.250666a29.312 29.312 0 0 1-25.728 43.392h-234.666666a29.312 29.312 0 0 1-29.354667-29.354666zM326.144 392.362667l-155.904 285.824h155.904V392.362667z m371.584 0v285.824h155.904l-155.904-285.824z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24BianjiqiShuipingfanzhuan.defaultProps = {
  size: 18,
};

export default Icon24BianjiqiShuipingfanzhuan;
