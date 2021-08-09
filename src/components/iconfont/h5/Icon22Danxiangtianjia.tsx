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

const Icon22Danxiangtianjia: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
        fill={getIconColor(color, 0, '#FF4966')}
      />
      <path
        d="M512 253.672727a34.909091 34.909091 0 0 1 34.583273 30.161455l0.325818 4.747636-0.046546 188.509091H735.418182a34.909091 34.909091 0 0 1 4.747636 69.492364l-4.747636 0.325818h-188.555637l0.046546 188.509091a34.909091 34.909091 0 0 1-69.492364 4.747636l-0.325818-4.747636-0.046545-188.509091H288.581818a34.909091 34.909091 0 0 1-4.747636-69.492364l4.747636-0.325818h188.462546l0.046545-188.509091a34.909091 34.909091 0 0 1 34.909091-34.909091z"
        fill={getIconColor(color, 1, '#FFFFFF')}
      />
    </svg>
  );
};

Icon22Danxiangtianjia.defaultProps = {
  size: 18,
};

export default Icon22Danxiangtianjia;
