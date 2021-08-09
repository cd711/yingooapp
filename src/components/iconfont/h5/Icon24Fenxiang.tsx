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

const Icon24Fenxiang: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M482.816 143.274667a28.714667 28.714667 0 1 1 0 57.429333H233.557333a69.12 69.12 0 0 0-69.12 69.12v521.728a69.12 69.12 0 0 0 69.12 69.12h521.728a69.12 69.12 0 0 0 69.12-69.12v-271.104a28.714667 28.714667 0 0 1 57.386667 0v271.104a126.506667 126.506667 0 0 1-126.506667 126.506667H233.557333a126.506667 126.506667 0 0 1-126.549333-126.506667V269.824a126.506667 126.506667 0 0 1 126.549333-126.549333z m217.386667-29.141334a28.714667 28.714667 0 0 1 40.448 3.541334l127.658666 152.277333a32.298667 32.298667 0 0 1-24.746666 52.992h-169.813334a114.773333 114.773333 0 0 0-114.773333 114.773333v180.309334a28.714667 28.714667 0 1 1-57.386667 0V437.76a172.16 172.16 0 0 1 172.16-172.202667h115.968l-93.056-111.018666a28.714667 28.714667 0 0 1 3.541334-40.405334z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Fenxiang.defaultProps = {
  size: 18,
};

export default Icon24Fenxiang;
