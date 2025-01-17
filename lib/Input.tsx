import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, Animated, ViewStyle, StyleProp } from 'react-native';

import NumberPadContext from './NumberPadContext';
import styles from './styles';

const inputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];
const inputsInteger = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'];

type InputProps = {
  height: number,
  position: 'relative' | 'absolute',
  style?: StyleProp<ViewStyle>,
  backspaceIcon?: JSX.Element,
  hideIcon?: JSX.Element,
  onlyInteger: boolean,
  onWillHide?: () => void,
  onDidHide?: () => void,
  onWillShow?: () => void,
  onDidShow?: () => void,
}

export default class Input extends Component<InputProps> {
  animation: Animated.Value;

  static contextType = NumberPadContext;

  static propTypes = {
    height: PropTypes.number,
    position: PropTypes.oneOf(['relative', 'absolute']).isRequired,
    style: PropTypes.object,
    backspaceIcon: PropTypes.element,
    hideIcon: PropTypes.element,
    onlyInteger: PropTypes.bool,
    onWillHide: PropTypes.func,
    onDidHide: PropTypes.func,
    onWillShow: PropTypes.func,
    onDidShow: PropTypes.func,
  };

  static defaultProps = {
    height: 270,
    position: 'absolute',
  };

  static iconStyle = {
    color: styles.buttonText.color || '#888',
    size: styles.buttonText.fontSize || 36,
  };

  constructor(props: InputProps) {
    super(props);

    this.animation = new Animated.Value(0);
  }

  show = () => {
    if (this.props.onWillShow) this.props.onWillShow();
    Animated.timing(this.animation, {
      duration: 200,
      toValue: this.props.height,
      useNativeDriver: true,
    }).start(this.props.onDidShow);
  };

  hide = () => {
    if (this.props.onWillHide) this.props.onWillHide();
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start(this.props.onDidHide);
  };

  componentDidMount() {
    this.context.registerInput(this);
    this.context.setHeight(this.props.height);
  }

  componentWillUnmount() {
    Animated.timing(this.animation, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  getStyle = () => {
    const interpolation = this.animation.interpolate({
      inputRange: [0, this.props.height],
      outputRange: [this.props.height, 0],
    });
    return this.props.position === 'absolute'
      ? {
        position: 'absolute',
        bottom: 0,
        height: this.props.height,
        transform: [
          {
            translateY: interpolation,
          },
        ],
      }
      : {
        height: interpolation,
      };
  };

  render() {
    const { onlyInteger } = this.props;
    const inputKeyboard = onlyInteger ? inputsInteger : inputs;
    return (
      <Animated.View style={[this.props.style]}>
        <View style={styles.input}>
          <View style={styles.pad}>
            {inputKeyboard.map((value, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.button}
                  onPress={() => this.context.onInputEvent(value)}
                >
                  <Text style={styles.buttonText}>{value}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              key="backspace"
              style={styles.button}
              onPress={() => this.context.onInputEvent('backspace')}
            >
              {this.props.backspaceIcon ? (
                this.props.backspaceIcon
              ) : (
                <Text style={styles.buttonText}>←</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }
}
