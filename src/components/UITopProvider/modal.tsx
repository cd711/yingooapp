import "./index.less";
import Taro, {Component} from "@tarojs/taro";
import {View} from "@tarojs/components";
import {UITop} from "./index";


// 此modal仅为一个基础容器，无实际内容、作用，弹出的内容需要自己实现
interface ModalOptions {
    onOk?: () => void;
    onClose?: () => void;
}
export default class Modal extends Component<ModalOptions & {
    onDidClose: () => void;
    content: JSX.Element;
}, any> {

    constructor(props) {
        super(props);

    }


    public close = () => {
        const {onClose, onDidClose} = this.props;
        onClose && onClose();
        onDidClose()
    }

    static show(content: JSX.Element, opt: ModalOptions = {}): any {
        const id = UITop.show(<Modal onDidClose={() => UITop.remove(id)} content={content} {...opt} />);

        return id
    }

    render() {
        const {content} = this.props;
        return (
            <View className="custom_modal_container">
                {content}
            </View>
        )
    }
}
