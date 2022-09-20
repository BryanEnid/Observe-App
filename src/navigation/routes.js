import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { useKeepAwake } from "expo-keep-awake";
import { useIsFetching } from "react-query";

import { Loading } from "../components/Loading";
import { BottomMenu } from "../components/ObserveMenu/BottomMenu";
import { useUser } from "../hooks/useUser";
import { Profile } from "../screens/Profile/Profile";
import { SignIn } from "../screens/Authentication/SignIn";

const linking = {
  prefixes: ["https://mychat.com", "mychat://"],
  config: {
    screens: {
      Profile: "profile",
    },
  },
};

const Stack = createStackNavigator();
const screenConfig = { headerShown: false };

export default function Routes() {
  // Hooks
  useKeepAwake();
  const isFetching = useIsFetching();
  const user = useUser();

  if (!user)
    return (
      <NavigationContainer linking={linking} independent>
        <Stack.Navigator initialRouteName="SignIn" screenOptions={screenConfig}>
          <Stack.Screen name="SignIn" component={SignIn} />
        </Stack.Navigator>
      </NavigationContainer>
    );

  return (
    <>
      <NavigationContainer linking={linking} independent>
        <Stack.Navigator
          initialRouteName="Profile"
          screenOptions={screenConfig}
        >
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>

      {!!isFetching && <Loading />}

      <BottomMenu />
    </>
  );
}
