export interface User {
    id: number;
    name: string;
    avatar: string;
    createdAt: string;
}

export interface CreateUserRequest {
    name: string;
    avatar: string;
    createdAt: string;
    id: number;
}
