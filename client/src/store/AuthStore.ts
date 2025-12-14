import { makeAutoObservable } from 'mobx';
import { fetchAuthCheck, fetchAuthLogin, fetchAuthRegister, LoginParams, RegisterParams } from '../API/authAPI';

interface User {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER';
}

class AuthStore {
    user: User | null = null;
    isAuth = false;
    isLoading = true;
    hash = ''; // For SWR conditional fetching

    constructor() {
        makeAutoObservable(this);
    }

    setUser(user: User | null) {
        this.user = user;
        this.isAuth = !!user;
        this.hash = user ? `${user.id}-${Date.now()}` : '';
    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    async login(params: LoginParams) {
        const { message } = await fetchAuthLogin(params);
        localStorage.setItem('token', message.token);
        this.setUser(message.user);
        return message.user;
    }

    async register(params: RegisterParams) {
        const { message } = await fetchAuthRegister(params);
        localStorage.setItem('token', message.token);
        this.setUser(message.user);
        return message.user;
    }

    async checkAuth() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                this.setUser(null);
                return;
            }

            const { message } = await fetchAuthCheck();
            this.setUser(message);
        } catch {
            localStorage.removeItem('token');
            this.setUser(null);
        } finally {
            this.setLoading(false);
        }
    }

    logout() {
        localStorage.removeItem('token');
        this.setUser(null);
    }

    get isAdmin() {
        return this.user?.role === 'ADMIN';
    }

    get isManager() {
        return this.user?.role === 'MANAGER';
    }
}

const Auth = new AuthStore();
export default Auth;
