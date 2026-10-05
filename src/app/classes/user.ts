
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

// Shape returned by GET/POST /api/users — the real, MySQL-backed profile
// for the currently signed-in Firebase user.
export interface UserProfile {
    id: number;
    firebaseUid: string;
    name: string;
    surename: string;
    nickname: string;
    email: string;
    profilePicture: string | null;
    bio: string | null;
    role: UserRole;
}

// Fields a user can edit on their own profile (PUT /api/users/me).
export type ProfileChanges = Pick<UserProfile, 'name' | 'surename' | 'nickname' | 'email' | 'bio'>;

export class User {
    id: number;
    name: string;
    surename: string;
    nickname: string;
    email: string;
    password: string;
    profilePicture: string;
    bio: string;
    
    role: UserRole = UserRole.USER;

    constructor(
        id: number,
        name: string,
        surename: string,
        nickname: string,
        email: string,
        password: string,
        profilePicture: string,
        bio: string,
        userRole: UserRole 
    ) {
        this.id = id;
        this.name = name;
        this.surename = surename;
        this.nickname = nickname;
        this.email = email;
        this.password = password;
        this.profilePicture = profilePicture;
        this.bio = bio;
        this.role = userRole;
    }





}
