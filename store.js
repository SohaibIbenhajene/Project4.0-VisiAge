import { atom } from 'recoil';
import { ScaledSheet } from 'react-native-size-matters';

export const currentUserState = atom({
    key: 'currentUserState',
    default: {},
});

export const dependentsState = atom({
    key: 'dependentsState',
    default: {},
});

export const usersState = atom({
    key: 'usersState',
    default: {},
});

export const alertsState = atom({
    key: 'alertsState',
    default: {},
});

export const alertStatusUserState = atom({
    key: 'alertStatusUserState',
    default: {},
});

export const cameraRoomState = atom({
    key: 'cameraRoomState',
    default: {},
});

export const roleState = atom({
    key: 'roleState',
    default: {},
});

export const styleState = atom({
    key: 'styleState',
    default: {},
});