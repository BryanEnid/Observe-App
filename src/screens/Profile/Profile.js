// import ConicalGradient from '../../components/ConicalGradient/ConicalGradient';
import React from "react";
import { StyleSheet, useWindowDimensions, StatusBar } from "react-native";
import {
  Text,
  Box,
  Pressable,
  Column,
  Center,
  Image,
  Button,
  IconButton,
  Icon,
  VStack,
} from "native-base";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { getStatusBarHeight } from "react-native-status-bar-height";
import { Feather } from "@expo/vector-icons";

import { useRandomUsers } from "../../hooks/query/useRandomUsers";
import { scrollTo } from "../../utils/scrollTo";
import { MENU_H } from "../../components/ObserveMenu/BottomMenu";
import { BucketScreen } from "./Buckets/Buckets";
import { ResumeScreen } from "./Resume/Resume";
import { useNavigation } from "@react-navigation/native";

const statusBarHeight = getStatusBarHeight();

const PROFILE_DIMENSIONS = { width: 180, height: 180, padding: 20 };
// ! Also declare refs using "useAnimatedRef"  per screen and add it to the refs array
const SCREENS = [
  ["Resume", ResumeScreen],
  ["Bucket", BucketScreen],
];

const PROFILE_NAME_H = 50;
const PROFILE_NAME_W = 250;
const PROFILE_H = 255;
const NAV_BTN_W = 82;
const NAVBAR_H = 50;
const NAVBAR_W = NAV_BTN_W * SCREENS.length;
const HEADER_W = 400;

export const Profile = () => {
  // Hooks
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const { data: profile } = useRandomUsers({
    select: ({ results }) => ({
      ...results[0],
      quote: "Seagulls are the eagles of the sea.",
    }),
    key: ["user", { amount: 1 }],
  });

  // State
  const sv_x_ref = useAnimatedRef();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const nav_translate_x = useSharedValue(0);
  const nav_translate_y = useSharedValue(0);

  const bucket_sv_y_ref = useAnimatedRef();
  const resume_sv_y_ref = useAnimatedRef();
  const refs = [bucket_sv_y_ref, resume_sv_y_ref];

  const current_screen = useDerivedValue(() => {
    const result = Math.floor(translateX.value / width);
    return result < 0 ? 0 : result;
  });

  // Styles
  const styles = StyleSheet.create({
    profile_picture: {
      width: PROFILE_DIMENSIONS.width - PROFILE_DIMENSIONS.padding,
      aspectRatio: 1,
      borderRadius: PROFILE_DIMENSIONS.width - PROFILE_DIMENSIONS.padding / 2,
    },
    header: {
      height: PROFILE_H,
      width: HEADER_W,
      position: "absolute",
      top: 0 + statusBarHeight,
      left: width / 2,
    },
    username: {
      height: PROFILE_NAME_H,
      width: PROFILE_NAME_W,
      position: "absolute",
      top: PROFILE_H + statusBarHeight,
      left: width / 2 - PROFILE_NAME_W / 2,
      zIndex: 2,
      display: "flex",
      justifyContent: "space-between",
    },
    navbar: {
      width: NAVBAR_W,
      position: "absolute",
      top: PROFILE_H + PROFILE_NAME_H + statusBarHeight,
      left: width / 2 - NAV_BTN_W / 2,
      zIndex: 2,
    },
    menu_button: {
      position: "absolute",
      right: 10,
      zIndex: 2,
    },
  });

  // Handlers
  const handleNavSelect = (event, index) => {
    refs.map((ref, i) => {
      if (i === current_screen.value) return;
      const y = translateY.value > 254 ? 255 : translateY.value;
      scrollTo(ref, { y, animated: false });
    });
    scrollTo(sv_x_ref, { x: index * width });
  };

  // Config Animations
  const clamped_nav_scroll_x = useDerivedValue(() => {
    const Limits = -NAV_BTN_W * (SCREENS.length - 1);
    return Math.max(Math.min(nav_translate_x.value, 0), Limits);
  });

  // Worklets
  const handleSubscreenXScroll = useAnimatedScrollHandler({
    // TODO: This doesn't work on web
    onBeginDrag: (event, context) => {
      refs.map((ref, index) => {
        if (index === current_screen.value) return;
        const y = translateY.value > 254 ? 255 : translateY.value;
        scrollTo(ref, { y, animated: false }, true);
      });
    },
    onScroll: (event, context) => {
      // Subscreen
      translateX.value = event.contentOffset.x;

      // Navbar
      nav_translate_x.value = interpolate(
        event.contentOffset.x,
        [0, width],
        [0, -Number(NAV_BTN_W)]
      );
    },
  });

  const handleSubscreenYScroll = useAnimatedScrollHandler((event) => {
    // Subscreen
    translateY.value = event.contentOffset.y;

    // Navbar
    nav_translate_y.value = interpolate(
      event.contentOffset.y,
      [0, 1, PROFILE_H, PROFILE_H + 1],
      [0, -1, -PROFILE_H, -PROFILE_H]
    );
  });

  const handleNavPanGesture = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.translateX = clamped_nav_scroll_x.value;
      cancelAnimation(nav_translate_x);
    },
    onActive: (event, context) => {
      nav_translate_x.value = event.translationX + context.translateX;
    },
    onEnd: (event, context) => {
      nav_translate_x.value = withDecay({ velocity: event.velocityX });
    },
  });

  // Animations
  const r_header = useAnimatedStyle(() => {
    const r_translateY = interpolate(translateY.value, [0, 1], [0, -1]);
    return {
      transform: [{ translateY: r_translateY }, { translateX: -HEADER_W / 2 }],
    };
  });

  const r_profile_name_y_translate = useAnimatedStyle(() => {
    return { transform: [{ translateY: nav_translate_y.value }] };
  });

  const r_nav_y_translate = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: clamped_nav_scroll_x.value },
        { translateY: nav_translate_y.value },
      ],
    };
  });

  const r_nav_x_translate_gesture = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: clamped_nav_scroll_x.value },
        { translateY: nav_translate_y.value },
      ],
    };
  });

  const r_nav_x_translate = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: clamped_nav_scroll_x.value },
        { translateY: nav_translate_y.value },
      ],
    };
  });

  if (!profile?.name) return <></>;

  // Components
  const Navbar = ({ onChange }) => {
    const Item = ({ children, index }) => (
      <Button
        height={NAVBAR_H}
        width={NAV_BTN_W}
        variant={"link"}
        onPress={(e) => onChange(e, index)}
      >
        <Text color="coolGray.500">{children}</Text>
      </Button>
    );

    return (
      <PanGestureHandler onGestureEvent={handleNavPanGesture}>
        <Animated.View
          style={[
            styles.navbar,
            r_nav_y_translate,
            r_nav_x_translate_gesture,
            r_nav_x_translate,
          ]}
        >
          <Box flexDirection="row">
            {SCREENS.map((content, index) => (
              <Item key={content[0]} index={index}>
                {content[0]}
              </Item>
            ))}
          </Box>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <>
      <Box overflowX={"hidden"} flex={1} backgroundColor="white">
        <StatusBar barStyle={"dark-content"} />

        {/* User */}
        <Animated.View style={[styles.username, r_profile_name_y_translate]}>
          <Center>
            <Text bold>
              {profile.name.first} {profile.name.last}
            </Text>
            <Text>@{profile.login.username}</Text>
          </Center>

          <Center>
            <Box borderTopWidth={1} borderColor="gray.500" w={170} />
          </Center>
        </Animated.View>

        {/* Navbar */}
        <Navbar onChange={handleNavSelect} />

        {/* RENDER SUB SCREENS */}
        <Box height={height}>
          <Box height={PROFILE_NAME_H + NAVBAR_H + statusBarHeight} />
          <Animated.ScrollView
            pagingEnabled
            horizontal
            ref={sv_x_ref}
            showsHorizontalScrollIndicator={false}
            onScroll={handleSubscreenXScroll}
            scrollEventThrottle={16}
          >
            {SCREENS.map(([screenName, Screen], index) => (
              <Animated.ScrollView
                key={screenName}
                onScroll={handleSubscreenYScroll}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                ref={refs[index]}
              >
                <Box height={PROFILE_DIMENSIONS.height + 25} />
                <Column
                  flex={1}
                  space={10}
                  width={width}
                  pt={10}
                  minHeight={height - PROFILE_NAME_H - NAVBAR_H}
                >
                  <Screen />
                  <Box height={MENU_H} />
                </Column>
              </Animated.ScrollView>
            ))}
          </Animated.ScrollView>
        </Box>

        {/* Profile */}
        {/* This is at the end so the "on" events triggers */}
        <Animated.View style={[r_header, styles.header]}>
          <Box>
            <Box height={PROFILE_H} justifyContent="space-evenly">
              <VStack style={styles.menu_button} space={3}>
                <IconButton
                  icon={<Icon as={Feather} name="settings" size="lg" />}
                  onPress={() => {
                    // Navigate to settings
                    navigation.navigate("Settings");
                  }}
                />
                <IconButton
                  icon={<Icon as={Feather} name="more-horizontal" size="md" />}
                  variant="outline"
                  onPress={() => {
                    // Show more options
                    console.log("in");
                  }}
                />
              </VStack>

              <Center>
                <Pressable onPress={() => {}}>
                  <Box>
                    <Image
                      source={{ uri: profile?.picture?.large }}
                      fallbackSource={{
                        uri: "https://az-pe.com/wp-content/uploads/2018/05/kemptons-blank-profile-picture.jpg",
                      }}
                      style={styles.profile_picture}
                      alt="profile picture"
                    />
                  </Box>
                </Pressable>
              </Center>

              <Center>
                <Text>Software Engineer at Facebook</Text>
                <Text>"{profile.quote}"</Text>
              </Center>
            </Box>
          </Box>
        </Animated.View>
      </Box>
    </>
  );
};
