import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NativeBaseProvider, extendTheme, Text } from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import { PortalProvider } from "./Portal";

// React Query config: Create a client
const queryClient = new QueryClient();

const config = {
  dependencies: {
    "linear-gradient": LinearGradient,
  },
};

export const GlobalProvider = ({ children }) => {
  const theme = extendTheme({
    config: { strictMode: "warn" },
    components: {
      Box: {
        variants: {
          elevated: () => ({
            shadowColor: "#999",
            shadowOffset: {
              width: 0,
              height: 16,
            },
            shadowOpacity: 0.25,
            shadowRadius: 18.46,
            elevation: 22,
          }),
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PortalProvider>
        <NativeBaseProvider config={config} theme={theme}>
          {children}
        </NativeBaseProvider>
      </PortalProvider>
    </QueryClientProvider>
  );
};
