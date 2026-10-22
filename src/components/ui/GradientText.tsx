import RNMaskedView from "@react-native-masked-view/masked-view";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";

import { cssGradient, type LinearGradientToken } from "@/theme";

// masked-view 0.3 ships class-component typings that React 19.3's JSX types reject.
const MaskedView = RNMaskedView as unknown as ComponentType<{ maskElement: ReactElement; children: ReactNode }>;

type Props = {
  gradient: LinearGradientToken;
  className?: string;
  style?: StyleProp<TextStyle>;
  children: string;
};

/**
 * Text filled with a gradient (CSS `background-clip: text`). RN Text can't take a gradient, so
 * the text masks a gradient view. The invisible copy underneath gives the view the text's size.
 */
export function GradientText({ gradient, className, style, children }: Props) {
  return (
    <MaskedView
      maskElement={
        <Text className={className} style={style}>
          {children}
        </Text>
      }
    >
      <View style={{ backgroundImage: cssGradient(gradient) }}>
        <Text className={className} style={[style, { opacity: 0 }]}>
          {children}
        </Text>
      </View>
    </MaskedView>
  );
}
