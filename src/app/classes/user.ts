
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

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
