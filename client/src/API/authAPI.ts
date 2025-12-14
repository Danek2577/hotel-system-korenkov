import { $host, $authHost } from './index';

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    name: string;
    role?: 'ADMIN' | 'MANAGER';
}

export interface AuthResponse {
    message: {
        token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: 'ADMIN' | 'MANAGER';
        };
    };
}

export interface UserResponse {
    message: {
        id: number;
        email: string;
        name: string;
        role: 'ADMIN' | 'MANAGER';
    };
}

// Login
export const fetchAuthLogin = async (params: LoginParams): Promise<AuthResponse> => {
    const { data } = await $host.post('/auth/login', params);
    return data;
};

// Register
export const fetchAuthRegister = async (params: RegisterParams): Promise<AuthResponse> => {
    const { data } = await $host.post('/auth/register', params);
    return data;
};

// Check auth
export const fetchAuthCheck = async (): Promise<UserResponse> => {
    const { data } = await $authHost.get('/auth/check');
    return data;
};
