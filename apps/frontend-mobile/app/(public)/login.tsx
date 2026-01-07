import { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { useAppStore } from "../../store/useAppStore";

export default function LoginScreen() {
  const signIn = useAppStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={{ padding: 24 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={() => signIn(email, password)} />
    </View>
  );
}
