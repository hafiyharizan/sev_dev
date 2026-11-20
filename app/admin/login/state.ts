export type LoginState = { step: 'email' | 'code'; email: string; error?: string };
export const initialLoginState: LoginState = { step: 'email', email: '' };
