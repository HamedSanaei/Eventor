export interface User {
  userName: string;
  displayName: string;
  token: string;
  image?: string;
}

// the interface for login and registration simultanously
export interface UserFormValues {
  email: string;
  password: string;
  displayName?: string;
  username?: string;
}
