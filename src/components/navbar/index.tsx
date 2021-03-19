import Taro, {Component} from "@tarojs/taro";
import {Text, View} from '@tarojs/components'
import IconFont from '../iconfont';
import './index.less'
import { jumpUri } from '../../utils/common';

const Navbar = (c) => {
    console.log("a",this,c);

    return function nb() {
        return class NB extends Component {
            constructor(parameters) {
                super(parameters)
            }
            componentWillMount() {
                console.log("componentWillMount");
                
            }
            render(){
                console.log("render");
                
                return(
                    <View>
                        <Text>哈哈</Text>
                    </View>
                )
            }
        }
    }
}

export default Navbar;