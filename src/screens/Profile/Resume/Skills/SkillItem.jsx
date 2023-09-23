import React from "react";
import { Box, Icon, Image, Button } from "native-base";
import { Feather } from "@expo/vector-icons";
import { TouchableWithoutFeedback } from "react-native";
import reactotron from "reactotron-react-native";
// import { reactotron } from "../../../../config/ReactotronConfig";

export const SkillItem = ({
  children,
  logo,
  onPress,
  selectable,
  id,
  isCurrent,
}) => {
  const [isSelected, setSelected] = React.useState(false);

  React.useEffect(() => {
    if (isCurrent) {
      handleSelected(true);
    }
  }, [isCurrent]);

  const handleSelected = (wasSelected) => {
    console.log(wasSelected);
    const action = !isSelected ? "add" : "remove";
    const payload = { id, name: children, action, logoUri: logo };

    setSelected(!isSelected);
    onPress && onPress(payload);
  };

  return (
    <Button variant="unstyled" onPress={selectable ? handleSelected : onPress}>
      <>
        {isSelected && selectable && (
          <Box
            w="25px"
            h="25px"
            bg="blue.400"
            borderRadius={13}
            justifyContent="center"
            alignItems="center"
            position="absolute"
            zIndex="1"
            right={-5}
            top={-3}
          >
            <Icon as={Feather} name="check" color="white" />
          </Box>
        )}

        <Box
          variant="elevated"
          mb={2}
          backgroundColor="white"
          borderRadius={30}
          borderColor={isSelected && selectable ? "blue.400" : null}
          borderWidth={isSelected && selectable ? 3 : null}
          justifyContent="center"
          alignItems="center"
          h={"93px"}
          w={"93px"}
        >
          {typeof logo === "string" ? (
            <Box mb={1} w="100%" alignItems="center">
              <Image
                alt="logo"
                source={{ uri: logo }}
                resizeMode="contain"
                size="xs"
              />
            </Box>
          ) : (
            logo
          )}
          {children}
        </Box>
      </>
    </Button>
  );
};
