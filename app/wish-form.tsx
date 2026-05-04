import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WishForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [wish, setWish] = useState('');
  const [errors, setErrors] = useState<{name?: string, birthdate?: string, wish?: string}>({});

  const validate = () => {
    let newErrors: {name?: string, birthdate?: string, wish?: string} = {};
    let isValid = true;

    if (name.trim().length < 2) {
      newErrors.name = "이름을 정확히 입력하세요. (Enter your valid name)";
      isValid = false;
    }

    // Basic YYYY.MM.DD validation
    const dateRegex = /^(19|20)\d\d\.(0[1-9]|1[012])\.(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(birthdate)) {
      newErrors.birthdate = "올바른 생년월일을 입력하세요 (YYYY.MM.DD)";
      isValid = false;
    }

    if (wish.trim().length < 5) {
      newErrors.wish = "소원은 더 구체적이어야 합니다. (Be more specific)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validate()) {
      router.push('/camera');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>제물을 준비하세요</Text>
            <Text style={styles.subtitle}>거짓은 허용되지 않습니다.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름 (Name)</Text>
              <TextInput 
                style={[styles.input, errors.name && styles.inputError]} 
                placeholderTextColor="#444"
                placeholder="본명을 입력하세요"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({...errors, name: undefined});
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>생년월일 (Birthdate)</Text>
              <TextInput 
                style={[styles.input, errors.birthdate && styles.inputError]} 
                placeholderTextColor="#444"
                placeholder="YYYY.MM.DD"
                keyboardType="numbers-and-punctuation"
                value={birthdate}
                onChangeText={(text) => {
                  setBirthdate(text);
                  if (errors.birthdate) setErrors({...errors, birthdate: undefined});
                }}
              />
              {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>소원 (Wish)</Text>
              <TextInput 
                style={[styles.input, styles.textArea, errors.wish && styles.inputError]} 
                placeholderTextColor="#444"
                placeholder="어떤 대가를 치르더라도 이루고 싶은 소원..."
                multiline
                value={wish}
                onChangeText={(text) => {
                  setWish(text);
                  if (errors.wish) setErrors({...errors, wish: undefined});
                }}
              />
              {errors.wish && <Text style={styles.errorText}>{errors.wish}</Text>}
            </View>
          </View>

          <Text style={styles.warningText}>
            경고: 한 번 바쳐진 이름은 돌려받을 수 없습니다.
          </Text>

          <TouchableOpacity 
            style={[styles.button, (!name || !birthdate || !wish) && styles.buttonDisabled]} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>의식 시작하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#171417',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: '#8A0303', // Deep blood red
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 2,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    color: '#999',
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  input: {
    backgroundColor: '#0A0A0A',
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
  },
  inputError: {
    borderBottomColor: '#8A0303',
  },
  errorText: {
    color: '#8A0303',
    fontSize: 12,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  warningText: {
    color: '#444',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#8A0303',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#500000',
  },
  buttonDisabled: {
    backgroundColor: '#111',
    borderColor: '#222',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 4,
  },
});
