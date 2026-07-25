import { Alert, Platform } from 'react-native';

if (Platform.OS === 'web') {
    Alert.alert = (title, message, buttons) => {
        const textParts = [title, message].filter(Boolean);
        const text = textParts.join('\n\n');

        if (!buttons || buttons.length === 0) {
            window.alert(text);
            return;
        }

        if (buttons.length === 1) {
            window.alert(text);
            if (buttons[0]?.onPress) {
                buttons[0].onPress();
            }
            return;
        }


        const cancelBtn = buttons.find(b => b.style === 'cancel');
        const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];

        const confirmed = window.confirm(text);
        if (confirmed) {
            if (confirmBtn?.onPress) {
                confirmBtn.onPress();
            }
        } else {
            if (cancelBtn?.onPress) {
                cancelBtn.onPress();
            }
        }
    };
}
