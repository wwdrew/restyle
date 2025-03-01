import {StyleSheet} from 'react-native';

import {
  RestyleFunctionContainer,
  BaseTheme,
  Dimensions,
  RNStyle,
  RestyleFunction,
} from './types';
import {AllProps} from './restyleFunctions';

const composeRestyleFunctions = <
  Theme extends BaseTheme,
  TProps extends AllProps<Theme>
>(
  restyleFunctions: (
    | RestyleFunctionContainer<TProps, Theme>
    | RestyleFunctionContainer<TProps, Theme>[])[],
) => {
  const flattenedRestyleFunctions = restyleFunctions.reduce(
    (acc: RestyleFunctionContainer<TProps, Theme>[], item) => {
      return acc.concat(item);
    },
    [],
  );
  const variantProp = flattenedRestyleFunctions.find(
    item => item.variant === true,
  );
  const properties = flattenedRestyleFunctions.map(
    styleFunc => styleFunc.property,
  );
  const propertiesMap = properties.reduce(
    (acc, prop) => ({...acc, [prop]: true}),
    {} as Record<keyof TProps, true>,
  );

  const funcsMap = flattenedRestyleFunctions.reduce(
    (acc, each) => ({[each.property]: each.func, ...acc}),
    {} as Record<keyof TProps, RestyleFunction<TProps, Theme, string>>,
  );

  // TInputProps is a superset of TProps since TProps are only the Restyle Props
  const buildStyle = (
    props: TProps,
    {
      theme,
      dimensions,
    }: {
      theme: Theme;
      dimensions: Dimensions;
    },
  ): RNStyle => {
    const styles = Object.keys(props).reduce(
      (styleObj, propKey) => ({
        ...styleObj,
        ...funcsMap[propKey as keyof TProps](props, {theme, dimensions}),
      }),
      {},
    );
    const {stylesheet} = StyleSheet.create({stylesheet: styles});
    return stylesheet;
  };
  return {
    buildStyle,
    properties,
    propertiesMap,
    variantProp: variantProp ? variantProp.property : 'variant',
  };
};

export default composeRestyleFunctions;
