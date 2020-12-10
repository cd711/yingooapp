import Taro, {Component,Config} from "@tarojs/taro";
import {View} from "@tarojs/components";
import './index.less'

let count = 0;

// eslint-disable-next-line import/no-mutable-exports
export let UITop: UITopProvider = null;

export class UITopProvider extends Component<{}, any> {

    state = {
        ele: {}
    };
    config: Config = {
        
    }
    constructor(p) {
        super(p);
        UITop = this;
    }
    public show(ele: JSX.Element): number {
        const list = this.state.ele;
        count ++;
        list[count] = {id: count, ele: ele};
        this.setState({
            ele: Object.assign({}, list)
        });
        return count;
    }

    public remove(index) {
        const list = this.state.ele;
        for (const i in list) {
            if (i == index) {
                delete list[i];
                this.setState({
                    ele: Object.assign({}, list)
                });
                return;
            }
        }
    }

    render() {
        const keys = Object.keys(this.state.ele);
        return <View id="UITopProvider" className="provider_main">
            {keys.map((id)=> {
                const item = this.state.ele[id];
                return <View key={`top_${item.id}`} className="base_container">{item.ele}</View>;
            })}
        </View>;
    }
}
