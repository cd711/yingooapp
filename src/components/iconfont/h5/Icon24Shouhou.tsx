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

const Icon24Shouhou: FunctionComponent<Props> = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1024 1024" width={size + 'rem'} height={size + 'rem'} style={style} {...rest}>
      <path
        d="M729.984 107.434667c40.448 0 76.928 24.277333 92.586667 61.525333l70.869333 168.789333 0.512 1.194667a28.458667 28.458667 0 0 1 2.773333 12.373333V778.24a136.32 136.32 0 0 1-136.277333 136.277333H222.421333a136.32 136.32 0 0 1-136.32-136.277333V351.317333c0-4.565333 1.066667-8.96 2.986667-12.8l0.298667-0.768L160.256 168.96a100.437333 100.437333 0 0 1 92.586667-61.525333H730.026667z m109.354667 272.597333H143.445333v398.165333a78.933333 78.933333 0 0 0 78.933334 78.933334h538.026666a78.933333 78.933333 0 0 0 78.933334-78.933334V380.032z m-419.285334 44.373333a28.714667 28.714667 0 1 1 40.789334 40.277334l-44.245334 44.8h110.677334a136.32 136.32 0 0 1 0 272.64H347.946667a28.714667 28.714667 0 0 1 0-57.386667h179.328a78.933333 78.933333 0 0 0 0-157.824H356.522667a32.298667 32.298667 0 0 1-22.954667-54.997333z m309.930667-259.584H252.842667c-17.322667 0-32.938667 10.368-39.68 26.368L157.952 322.56h666.88l-55.168-131.413333a43.050667 43.050667 0 0 0-39.68-26.368z"
        fill={getIconColor(color, 0, '#121314')}
      />
    </svg>
  );
};

Icon24Shouhou.defaultProps = {
  size: 18,
};

export default Icon24Shouhou;
