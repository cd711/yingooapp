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

const Icondaifahuo: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M729.6 107.434667c40.405333 0 76.928 24.277333 92.586667 61.525333l70.826666 168.789333a30.506667 30.506667 0 0 1-16.256 39.936c-5.717333 1.962667-5.717333 1.962667-11.818666 2.346667H143.104v398.165333a78.933333 78.933333 0 0 0 78.890667 78.933334h538.026666a78.933333 78.933333 0 0 0 78.933334-78.933334v-85.205333a28.714667 28.714667 0 1 1 57.386666 0v85.205333a136.32 136.32 0 0 1-136.32 136.277334H221.994667a136.32 136.32 0 0 1-136.32-136.277334V351.317333c0-4.565333 1.109333-8.96 3.029333-12.8l0.298667-0.768L159.872 168.96a100.437333 100.437333 0 0 1 92.586667-61.525333H729.6z m-107.264 363.946666l86.698667 89.6c17.408 18.005333 17.493333 46.506667 0.256 64.597334l-86.826667 91.136a28.714667 28.714667 0 0 1-41.514667-39.594667l43.776-45.994667H293.717333a28.714667 28.714667 0 1 1 0-57.386666h347.733334l-60.373334-62.421334a28.714667 28.714667 0 1 1 41.258667-39.936zM729.6 164.821333H252.458667c-17.322667 0-32.981333 10.368-39.68 26.368L157.525333 322.56h666.922667l-55.210667-131.413333a43.050667 43.050667 0 0 0-39.68-26.368z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icondaifahuo.defaultProps = {
  size: 18,
};

export default Icondaifahuo;
